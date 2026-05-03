/**
 * Vertex AI (Gemini) Service
 * Handles all AI chat interactions for BallotBuddy using Google Vertex AI.
 *
 * Key features:
 *  - Singleton VertexAI client to avoid repeated instantiation overhead
 *  - In-memory response caching to reduce redundant API calls
 *  - Graceful fallback to structured mock responses when the API is unavailable
 *  - Multilingual support (English, Hindi, Tamil)
 *
 * @module services/vertexai
 */

const logger = require("./logger");
const cache = require("./cache");

const MOCK_DELAY_MS = 800;
const MAX_OUTPUT_TOKENS = 1024;
const COMPARE_CACHE_TTL_MS = 30 * 60 * 1000;

const LANG_INSTRUCTIONS = {
  hi: "\n\nIMPORTANT: Respond in Hindi language.",
  ta: "\n\nIMPORTANT: Respond in Tamil language."
};

const getLanguageInstruction = (lang) => LANG_INSTRUCTIONS[lang] || "";
const mapChatHistory = (history) => history.map((msg) => ({
  role: msg.role,
  parts: [{ text: msg.content }],
}));

// ─── Lazy-load Vertex AI SDK ─────────────────────────────────────────────────
/** @type {typeof import('@google-cloud/vertexai').VertexAI | undefined} */
let VertexAI = null;
try {
  const vertexModule = require("@google-cloud/vertexai");
  VertexAI = vertexModule.VertexAI;
} catch {
  logger.warn("Vertex AI SDK not available – falling back to mock mode");
}

// ─── Singleton client references (initialized once on first use) ──────────────
/** @type {import('@google-cloud/vertexai').VertexAI | null} */
let _vertexClient = null;

/**
 * Returns a memoized VertexAI client instance.
 * Reads config from environment variables at call time.
 *
 * @returns {import('@google-cloud/vertexai').VertexAI}
 */
const getVertexClient = () => {
  if (_vertexClient === null || _vertexClient === undefined) {
    _vertexClient = new VertexAI({
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.VERTEX_AI_LOCATION || "us-central1",
    });
    logger.info("Vertex AI client initialized", {
      project: process.env.GOOGLE_CLOUD_PROJECT,
      location: process.env.VERTEX_AI_LOCATION || "us-central1",
    });
  }
  return _vertexClient;
};

// ─── System prompt ────────────────────────────────────────────────────────────
const ELECTION_SYSTEM_PROMPT = `You are BallotBuddy AI, an expert, friendly, and accessible election assistant for Indian citizens.
Your role is to help users understand the democratic process, voter rights, and election procedures.

ALWAYS respond in this exact JSON structure:
{
  "explanation": "A clear, simple 2-3 sentence explanation suitable for first-time voters",
  "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ..."],
  "timeline": "Optional: relevant timeline information",
  "checklist": ["Item 1", "Item 2", "Item 3"],
  "tips": ["Helpful tip 1", "Helpful tip 2"],
  "relatedTopics": ["Related topic 1", "Related topic 2"]
}

Guidelines:
- Use simple, clear language (8th grade reading level)
- Be non-partisan and factual
- Reference ECI (Election Commission of India) guidelines
- Include document requirements when relevant
- Be encouraging and positive about civic participation`;

// ─── Mock responses ───────────────────────────────────────────────────────────
/**
 * @typedef {Object} AIResponse
 * @property {string} explanation - Plain-language explanation
 * @property {string[]} steps - Ordered steps for the user to follow
 * @property {string} [timeline] - Timeline information
 * @property {string[]} checklist - Checklist items
 * @property {string[]} tips - Helpful tips
 * @property {string[]} relatedTopics - Related topics to explore
 */

/** @type {Record<string, AIResponse>} */
const MOCK_RESPONSES = {
  default: {
    explanation:
      "Voting is your fundamental right as a citizen. The election process involves several important steps to ensure fair and transparent democracy in India.",
    steps: [
      "Step 1: Check your eligibility (18+ years, Indian citizen)",
      "Step 2: Register as a voter using Form 6 on the NVSP portal",
      "Step 3: Verify your name on the Electoral Roll",
      "Step 4: Collect your Voter ID card (EPIC)",
      "Step 5: Visit your designated polling booth on election day",
      "Step 6: Cast your vote using the EVM (Electronic Voting Machine)",
    ],
    timeline:
      "Voter registration is open year-round. Special Summary Revision periods occur annually (October–November).",
    checklist: [
      "Check if you are 18+ years old",
      "Confirm Indian citizenship",
      "Have proof of address ready",
      "Have identity proof ready",
      "Know your polling booth location",
    ],
    tips: [
      "You can register online at voters.eci.gov.in",
      "Carry your Voter ID card on polling day",
      "The voting process takes approximately 5–10 minutes",
    ],
    relatedTopics: [
      "Electoral Roll Verification",
      "Voter ID Card",
      "Polling Booth Location",
    ],
  },
  register: {
    explanation:
      "Voter registration in India is free and mandatory to exercise your right to vote. You can register online or visit your nearest Electoral Registration Officer.",
    steps: [
      "Step 1: Visit voters.eci.gov.in or the Voter Helpline App",
      "Step 2: Fill Form 6 (New Registration) with your details",
      "Step 3: Upload required documents (age proof + address proof)",
      "Step 4: Submit the form and note your reference number",
      "Step 5: BLO (Booth Level Officer) will visit to verify details",
      "Step 6: Receive your EPIC (Voter ID) card within 30 days",
    ],
    timeline:
      "Registration applications are processed within 30 days. The Electoral Roll is published twice a year.",
    checklist: [
      "Age Proof: Birth Certificate, Passport, or Matriculation Certificate",
      "Address Proof: Aadhar Card, Utility Bill, or Bank Passbook",
      "Recent passport-size photograph",
      "Mobile number for OTP verification",
    ],
    tips: [
      "Use Form 8 to update your existing voter registration details",
      "Form 7 is used to object to inclusion of someone else",
      "You can track your application status online",
    ],
    relatedTopics: ["Electoral Roll", "EPIC (Voter ID Card)", "NVSP Portal"],
  },
};

/**
 * Selects the most relevant mock response based on keyword matching.
 *
 * @param {string} userMessage - The user's input message
 * @returns {AIResponse} The best-matching mock response
 */
const getMockResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();
  if (
    msg.includes("register") ||
    msg.includes("registration") ||
    msg.includes("sign up")
  ) {
    return MOCK_RESPONSES.register;
  }
  return MOCK_RESPONSES.default;
};

/**
 * Determines whether the mock AI mode should be used.
 *
 * @returns {{ useMock: boolean, reason: string }}
 */
const getMockStatus = () => {
  if (!process.env.GOOGLE_CLOUD_PROJECT) {
    return { useMock: true, reason: "No Project ID configured" };
  }
  if (!VertexAI) {
    return { useMock: true, reason: "Vertex AI SDK not loaded" };
  }
  if (process.env.USE_MOCK_AI === "true") {
    return { useMock: true, reason: "Forced by USE_MOCK_AI env var" };
  }
  return { useMock: false, reason: "Live AI enabled" };
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Executes the Vertex AI SDK call and parses the response.
 */
const callVertexAI = async (userMessage, history, language) => {
  const MODEL = process.env.VERTEX_AI_MODEL || "gemini-2.5-flash";
  const vertexAI = getVertexClient();
  const generativeModel = vertexAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: {
      role: "system",
      parts: [{ text: ELECTION_SYSTEM_PROMPT }],
    },
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.3,
      maxOutputTokens: MAX_OUTPUT_TOKENS,
    },
  });

  const chatSession = generativeModel.startChat({ history: mapChatHistory(history) });
  const result = await chatSession.sendMessage(userMessage + getLanguageInstruction(language));
  return JSON.parse(result.response.candidates[0].content.parts[0].text);
};

/**
 * Internal helper to execute and cache Vertex AI API calls.
 */
const fetchChatFromApi = async (userMessage, history, language, cacheKey) => {
  try {
    const parsed = await callVertexAI(userMessage, history, language);
    logger.info("Vertex AI response received");
    cache.set(cacheKey, parsed);
    return parsed;
  } catch (error) {
    logger.error("Vertex AI error – falling back to mock", {
      error: error.message,
    });
    return getMockResponse(userMessage);
  }
};

/**
 * Sends a chat message to Vertex AI Gemini and returns a structured response.
 * Responses are cached for 15 minutes by (message + language) to reduce
 * latency and Vertex AI API costs for repeated queries.
 *
 * @param {string} userMessage - The user's question or request
 * @param {Array<{role: 'user'|'model', content: string}>} [history=[]] - Prior conversation turns
 * @param {'en'|'hi'|'ta'} [language='en'] - Preferred response language
 * @returns {Promise<AIResponse>} Structured AI response object
 */
const chat = async (userMessage, history = [], language = "en") => {
  const { useMock, reason } = getMockStatus();

  if (useMock) {
    logger.info("Using mock AI response", { reason });
    await new Promise((r) => setTimeout(r, MOCK_DELAY_MS));
    return getMockResponse(userMessage);
  }

  const cacheKey = cache.makeKey("chat", userMessage, language);
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info("Serving chat response from cache");
    return cached;
  }

  return fetchChatFromApi(userMessage, history, language, cacheKey);
};

const generateMockComparison = (candidates) => {
  const { name: n1 = "Candidate A", education: e1 = "public service", assets: a1 = "N/A" } = candidates[0] || {};
  const { name: n2 = "Candidate B", education: e2 = "governance" } = candidates[1] || {};
  
  return `Based on the profiles, ${n1} has a background in ${e1} with declared assets of ${a1}. ${n2} brings experience in ${e2}. Both candidates have filed their affidavits with the Election Commission. Voters are encouraged to review all credentials carefully before making their decision.`;
};

/**
 * Internal helper to execute and cache candidate comparison API calls.
 */
const fetchComparisonFromApi = async (candidates, cacheKey) => {
  try {
    const MODEL = process.env.VERTEX_AI_MODEL || "gemini-2.5-flash";
    const vertexAI = getVertexClient();
    const generativeModel = vertexAI.getGenerativeModel({
      model: MODEL,
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
    });

    const prompt = `Compare these election candidates objectively and briefly (max 3 sentences). Be factual, non-partisan, and focus on qualifications and declared information:\n\n${JSON.stringify(candidates, null, 2)}`;
    const result = await generativeModel.generateContent(prompt);
    const summary = result.response.candidates[0].content.parts[0].text;

    cache.set(cacheKey, summary, COMPARE_CACHE_TTL_MS);
    return summary;
  } catch (error) {
    logger.error("Candidate comparison AI error", { error: error.message });
    return "Unable to generate AI comparison at this time. Please review the candidate profiles directly.";
  }
};

/**
 * Generates a concise, non-partisan AI comparison summary for a set of candidates.
 * Results are cached for 30 minutes since candidate data rarely changes.
 *
 * @param {Array<{name?: string, education?: string, assets?: string}>} candidates - Candidate objects
 * @returns {Promise<string>} Plain-text comparison summary (max 3 sentences)
 */
const compareCandidates = async (candidates) => {
  const { useMock } = getMockStatus();

  if (useMock) {
    return generateMockComparison(candidates);
  }

  const cacheKey = cache.makeKey(
    "compare",
    JSON.stringify(candidates.map((c) => c.name)),
  );
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.info("Serving candidate comparison from cache");
    return cached;
  }

  return fetchComparisonFromApi(candidates, cacheKey);
};

module.exports = { chat, compareCandidates, getMockStatus };
