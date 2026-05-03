/**
 * Rate Limiter Middleware
 * Protects API routes from brute force and abuse.
 */
const rateLimit = require("express-rate-limit");
const logger = require("../services/logger");

/**
 * General API rate limiter (100 requests per 15 minutes per IP)
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 10000 : 100,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn("Rate limit exceeded", { ip: req.ip, path: req.path });
    res.status(options.statusCode).send(options.message);
  },
});

/**
 * AI Chat rate limiter (20 requests per minute per IP)
 */
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 10000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Chat rate limit exceeded", { ip: req.ip });
    res.status(429).json({
      success: false,
      error:
        "Too many chat requests. Please wait a moment before asking again.",
    });
  },
});

/**
 * Auth rate limiter (5 attempts per 15 minutes per IP)
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "test" ? 10000 : 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Auth rate limit exceeded", { ip: req.ip });
    res.status(429).json({
      success: false,
      error: "Too many login attempts. Please try again in 15 minutes.",
    });
  },
});

module.exports = { generalLimiter, chatLimiter, authLimiter };
