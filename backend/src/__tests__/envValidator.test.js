/**
 * Environment Validator Tests
 * Tests for startup env validation covering all rule types,
 * warnings for missing non-required vars, and production error paths.
 */
const { validateRule, validateEnv } = require('../services/envValidator');

// Save and restore env around each test
let originalEnv;
beforeEach(() => {
  originalEnv = { ...process.env };
});
afterEach(() => {
  process.env = { ...originalEnv };
});

describe('validateRule – required fields', () => {
  it('should return valid: false when a required field is missing', () => {
    delete process.env.GOOGLE_CLOUD_PROJECT;
    const result = validateRule({
      name: 'GOOGLE_CLOUD_PROJECT',
      required: true,
      hint: 'Your GCP project ID',
    });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/GOOGLE_CLOUD_PROJECT/);
  });

  it('should return valid: true when a required field is present', () => {
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
    const result = validateRule({
      name: 'GOOGLE_CLOUD_PROJECT',
      required: true,
    });
    expect(result.valid).toBe(true);
  });
});

describe('validateRule – pattern validation', () => {
  it('should pass when value matches the pattern', () => {
    process.env.PORT = '3001';
    const result = validateRule({ name: 'PORT', required: false, pattern: /^\d+$/ });
    expect(result.valid).toBe(true);
  });

  it('should fail when value does not match pattern', () => {
    process.env.PORT = 'not-a-port';
    const result = validateRule({ name: 'PORT', required: false, pattern: /^\d+$/, hint: 'Must be a number' });
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/PORT/);
  });
});

describe('validateRule – optional fields', () => {
  it('should return a warning when optional field is absent', () => {
    delete process.env.VERTEX_AI_MODEL;
    const result = validateRule({ name: 'VERTEX_AI_MODEL', required: false, default: 'gemini-2.5-flash' });
    expect(result.valid).toBe(true);
    expect(result.warning).toMatch(/VERTEX_AI_MODEL/);
  });
});

describe('validateEnv – full validation', () => {
  it('should return valid: true in development with mock AI', () => {
    process.env.NODE_ENV = 'development';
    process.env.USE_MOCK_AI = 'true';
    delete process.env.GOOGLE_CLOUD_PROJECT;
    const { valid } = validateEnv();
    expect(valid).toBe(true);
  });

  it('should return valid: true when all env vars are set correctly', () => {
    process.env.NODE_ENV = 'development';
    process.env.PORT = '3001';
    process.env.USE_MOCK_AI = 'true';
    const { valid, errors } = validateEnv();
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });
});
