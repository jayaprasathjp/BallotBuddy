/**
 * Vertex AI (Gemini) Service
 * Handles all AI chat interactions for BallotBuddy.
 * Falls back to structured mock responses when API is unavailable.
 */
const logger = require('./logger');

// Attempt to load Vertex AI SDK
let VertexAI;
try {
  ({ VertexAI } = require('@google-cloud/vertexai'));
} catch (e) {
  logger.warn('Vertex AI SDK not available, using mock mode');
}

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

// Mock responses for demo/dev mode
const MOCK_RESPONSES = {
  default: {
    explanation: 'Voting is your fundamental right as a citizen. The election process involves several important steps to ensure fair and transparent democracy in India.',
    steps: [
      'Step 1: Check your eligibility (18+ years, Indian citizen)',
      'Step 2: Register as a voter using Form 6 on the NVSP portal',
      'Step 3: Verify your name on the Electoral Roll',
      'Step 4: Collect your Voter ID card (EPIC)',
      'Step 5: Visit your designated polling booth on election day',
      'Step 6: Cast your vote using the EVM (Electronic Voting Machine)',
    ],
    timeline: 'Voter registration is open year-round. Special Summary Revision periods occur annually (October–November).',
    checklist: [
      'Check if you are 18+ years old',
      'Confirm Indian citizenship',
      'Have proof of address ready',
      'Have identity proof ready',
      'Know your polling booth location',
    ],
    tips: [
      'You can register online at voters.eci.gov.in',
      'Carry your Voter ID card on polling day',
      'The voting process takes approximately 5–10 minutes',
    ],
    relatedTopics: ['Electoral Roll Verification', 'Voter ID Card', 'Polling Booth Location'],
  },
  register: {
    explanation: 'Voter registration in India is free and mandatory to exercise your right to vote. You can register online or visit your nearest Electoral Registration Officer.',
    steps: [
      'Step 1: Visit voters.eci.gov.in or the Voter Helpline App',
      'Step 2: Fill Form 6 (New Registration) with your details',
      'Step 3: Upload required documents (age proof + address proof)',
      'Step 4: Submit the form and note your reference number',
      'Step 5: BLO (Booth Level Officer) will visit to verify details',
      'Step 6: Receive your EPIC (Voter ID) card within 30 days',
    ],
    timeline: 'Registration applications are processed within 30 days. The Electoral Roll is published twice a year.',
    checklist: [
      'Age Proof: Birth Certificate, Passport, or Matriculation Certificate',
      'Address Proof: Aadhar Card, Utility Bill, or Bank Passbook',
      'Recent passport-size photograph',
      'Mobile number for OTP verification',
    ],
    tips: [
      'Use Form 8 to update your existing voter registration details',
      'Form 7 is used to object to inclusion of someone else',
      'You can track your application status online',
    ],
    relatedTopics: ['Electoral Roll', 'EPIC (Voter ID Card)', 'NVSP Portal'],
  },
};

/**
 * Get mock response based on query keywords
 */
const getMockResponse = (userMessage) => {
  const msg = userMessage.toLowerCase();
  if (msg.includes('register') || msg.includes('registration') || msg.includes('sign up')) {
    return MOCK_RESPONSES.register;
  }
  return MOCK_RESPONSES.default;
};

/**
 * Send a chat message to Vertex AI Gemini and get a structured response
 * @param {string} userMessage - The user's question
 * @param {Array} history - Previous conversation history
 * @param {string} language - Preferred language (en/hi/ta)
 * @returns {Object} Structured AI response
 */
const chat = async (userMessage, history = [], language = 'en') => {
  const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
  const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';
  const MODEL = process.env.VERTEX_AI_MODEL || 'gemini-2.5-flash';
  const USE_MOCK = process.env.USE_MOCK_AI === 'true' || !PROJECT_ID || !VertexAI;

  logger.debug('Vertex AI Config Status', { 
    projectId: PROJECT_ID, 
    useMockEnv: process.env.USE_MOCK_AI, 
    hasSdk: !!VertexAI,
    isMocking: USE_MOCK 
  });

  if (USE_MOCK) {
    logger.info('Using mock AI response', { 
      reason: !PROJECT_ID ? 'No Project ID' : !VertexAI ? 'SDK Not Loaded' : 'Forced by config' 
    });
    // Simulate processing delay
    await new Promise((r) => setTimeout(r, 800));
    return getMockResponse(userMessage);
  }

  try {
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const generativeModel = vertexAI.getGenerativeModel({
      model: MODEL,
      systemInstruction: {
        role: 'system',
        parts: [{ text: ELECTION_SYSTEM_PROMPT }],
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    });

    // Build conversation history for context
    const chatHistory = history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    }));

    const languageInstruction = language !== 'en'
      ? `\n\nIMPORTANT: Respond in ${language === 'hi' ? 'Hindi' : 'Tamil'} language.`
      : '';

    const chatSession = generativeModel.startChat({ history: chatHistory });
    const result = await chatSession.sendMessage(userMessage + languageInstruction);
    const responseText = result.response.candidates[0].content.parts[0].text;

    // Parse JSON response
    const parsed = JSON.parse(responseText);
    logger.info('Vertex AI response received', { model: MODEL });
    return parsed;
  } catch (error) {
    logger.error('Vertex AI error, falling back to mock', { error: error.message });
    return getMockResponse(userMessage);
  }
};

/**
 * Generate an AI comparison summary for candidates
 * @param {Array} candidates - Array of candidate objects
 * @returns {string} Comparison summary text
 */
const compareCandidates = async (candidates) => {
  const USE_MOCK = process.env.USE_MOCK_AI === 'true' || !process.env.GOOGLE_CLOUD_PROJECT || !VertexAI;

  if (USE_MOCK) {
    return `Based on the profiles, ${candidates[0]?.name || 'Candidate A'} has a background in ${candidates[0]?.education || 'public service'} with declared assets of ${candidates[0]?.assets || 'N/A'}. ${candidates[1]?.name || 'Candidate B'} brings experience in ${candidates[1]?.education || 'governance'}. Both candidates have filed their affidavits with the Election Commission. Voters are encouraged to review all credentials carefully before making their decision.`;
  }

  try {
    const PROJECT_ID = process.env.GOOGLE_CLOUD_PROJECT;
    const LOCATION = process.env.VERTEX_AI_LOCATION || 'us-central1';
    const vertexAI = new VertexAI({ project: PROJECT_ID, location: LOCATION });
    const generativeModel = vertexAI.getGenerativeModel({
      model: process.env.VERTEX_AI_MODEL || 'gemini-1.5-flash-001',
      generationConfig: { temperature: 0.4, maxOutputTokens: 512 },
    });

    const prompt = `Compare these election candidates objectively and briefly (max 3 sentences). Be factual, non-partisan, and focus on qualifications and declared information:\n\n${JSON.stringify(candidates, null, 2)}`;
    const result = await generativeModel.generateContent(prompt);
    return result.response.candidates[0].content.parts[0].text;
  } catch (error) {
    logger.error('Candidate comparison AI error', { error: error.message });
    return 'Unable to generate AI comparison at this time. Please review the candidate profiles directly.';
  }
};

module.exports = { chat, compareCandidates };
