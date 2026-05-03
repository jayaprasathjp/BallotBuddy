/**
 * Environment Variable Validator
 * Validates required environment variables at application startup.
 *
 * Prevents the application from silently running with a broken configuration
 * by failing fast with clear, actionable error messages.
 *
 * @module services/envValidator
 */

const logger = require("./logger");

/**
 * @typedef {Object} EnvRule
 * @property {string}   name     - Environment variable name
 * @property {boolean}  required - Whether the app cannot start without it
 * @property {string}   [default] - Description of the default fallback
 * @property {RegExp}   [pattern] - Optional regex the value must match
 * @property {string}   [hint]   - User-facing hint for how to set the value
 */

/** @type {EnvRule[]} */
const ENV_RULES = [
  {
    name: "PORT",
    required: false,
    default: "3001",
    pattern: /^\d+$/,
    hint: "Must be a valid port number (e.g. 3001)",
  },
  {
    name: "NODE_ENV",
    required: false,
    default: "development",
    pattern: /^(development|production|test)$/,
    hint: "Must be one of: development, production, test",
  },
  {
    name: "ALLOWED_ORIGINS",
    required: false,
    default: "http://localhost:5173",
    hint: "Comma-separated list of allowed CORS origins, or * for all",
  },
  {
    name: "VERTEX_AI_MODEL",
    required: false,
    default: "gemini-2.5-flash",
    hint: "The Vertex AI model name to use (e.g. gemini-2.5-flash)",
  },
  {
    name: "VERTEX_AI_LOCATION",
    required: false,
    default: "us-central1",
    hint: "Google Cloud region for Vertex AI (e.g. us-central1)",
  },
];

/** Variables required only in production (live AI mode) */
const PRODUCTION_RULES = [
  {
    name: "GOOGLE_CLOUD_PROJECT",
    required: true,
    hint: "Your GCP project ID (e.g. my-project-123456)",
  },
];

/**
 * Validates a single environment variable against its rule.
 *
 * @param {EnvRule} rule - The validation rule to check
 * @returns {{ valid: boolean, warning?: string, error?: string }}
 */
const validateRule = (rule) => {
  const value = process.env[rule.name];

  if (!value) {
    if (rule.required) {
      return {
        valid: false,
        error: `Missing required env var: ${rule.name}. Hint: ${rule.hint || "Check .env.example"}`,
      };
    }
    return {
      valid: true,
      warning: `${rule.name} not set – using default: ${rule.default || "(none)"}`,
    };
  }

  if (rule.pattern && !rule.pattern.test(value)) {
    return {
      valid: false,
      error: `Invalid value for ${rule.name}="${value}". ${rule.hint || ""}`,
    };
  }

  return { valid: true };
};

/**
 * Validates all environment variables and logs results.
 * In production with live AI, missing `GOOGLE_CLOUD_PROJECT` is a hard error.
 * In development/test, all failures are warnings only.
 *
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
const validateEnv = () => {
  const errors = [];
  const warnings = [];

  const isProduction = process.env.NODE_ENV === "production";
  const isLiveAI = process.env.USE_MOCK_AI !== "true";

  // Validate base rules
  for (const rule of ENV_RULES) {
    const result = validateRule(rule);
    if (!result.valid) errors.push(result.error);
    else if (result.warning) warnings.push(result.warning);
  }

  // Validate production-only rules when running live AI
  if (isProduction && isLiveAI) {
    for (const rule of PRODUCTION_RULES) {
      const result = validateRule(rule);
      if (!result.valid) errors.push(result.error);
    }
  }

  // Log warnings (non-blocking)
  for (const warning of warnings) {
    logger.warn(`[ENV] ${warning}`);
  }

  // Log errors
  for (const error of errors) {
    logger.error(`[ENV] ${error}`);
  }

  const valid = errors.length === 0;

  if (valid) {
    logger.info("[ENV] Environment validation passed", {
      nodeEnv: process.env.NODE_ENV || "development",
      mockAI: process.env.USE_MOCK_AI !== "false",
      model: process.env.VERTEX_AI_MODEL || "gemini-2.5-flash",
    });
  } else {
    logger.error("[ENV] Environment validation failed", {
      errorCount: errors.length,
    });
  }

  return { valid, errors, warnings };
};

module.exports = { validateEnv, validateRule };
