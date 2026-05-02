/**
 * Input Validation Middleware
 * Joi-based schemas for all API endpoints.
 */
const Joi = require('joi');
const logger = require('../services/logger');

/**
 * Generic validator factory
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    logger.warn('Validation failed', { details, path: req.path });
    return res.status(400).json({ success: false, error: 'Validation failed', details });
  }

  req[source] = value; // Attach sanitized values
  next();
};

// ────────────────────────── Schemas ──────────────────────────

const schemas = {
  register: Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).max(128).required(),
    name: Joi.string().min(2).max(100).trim().required(),
  }),

  login: Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(1).max(128).required(),
  }),

  chatMessage: Joi.object({
    message: Joi.string().min(1).max(1000).trim().required(),
    language: Joi.string().valid('en', 'hi', 'ta').default('en'),
    history: Joi.array().items(
      Joi.object({
        role: Joi.string().valid('user', 'model').required(),
        content: Joi.string().max(2000).required(),
      })
    ).max(20).default([]),
  }),

  candidateCompare: Joi.object({
    candidateIds: Joi.array().items(Joi.string()).min(2).max(4).required(),
  }),

  voteSimulate: Joi.object({
    candidateId: Joi.string().required(),
    sessionId: Joi.string().uuid().required(),
  }),

  reminder: Joi.object({
    eventId: Joi.string().required(),
    fcmToken: Joi.string().min(10).required(),
  }),
};

// Export schemas with validate middleware
const validators = {
  register: validate(schemas.register),
  login: validate(schemas.login),
  chatMessage: validate(schemas.chatMessage),
  candidateCompare: validate(schemas.candidateCompare),
  voteSimulate: validate(schemas.voteSimulate),
  reminder: validate(schemas.reminder),
};

module.exports = { validate, validators, schemas };
