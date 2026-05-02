/**
 * Logger Service
 * Winston logger with Cloud Logging-compatible JSON format.
 * Writes structured logs to stdout (captured by Cloud Run → Cloud Logging).
 */
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, errors, json, colorize, simple } = format;

const isProduction = process.env.NODE_ENV === 'production';

const logger = createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp(),
    errors({ stack: true }),
    json()
  ),
  defaultMeta: { service: 'ballotbuddy-backend' },
  transports: [
    new transports.Console({
      format: isProduction
        ? combine(timestamp(), errors({ stack: true }), json())
        : combine(colorize(), simple()),
    }),
  ],
});

// Add Google Cloud Logging transport in production
if (isProduction) {
  const { LoggingWinston } = require('@google-cloud/logging-winston');
  const loggingWinston = new LoggingWinston();
  logger.add(loggingWinston);
}

module.exports = logger;
