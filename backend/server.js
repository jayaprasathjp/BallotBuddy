/**
 * BallotBuddy Backend – Express Server
 * Production-ready Node.js API with security, logging, and GCP integrations.
 */
require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');

const logger = require('./src/services/logger');
const { generalLimiter } = require('./src/middleware/rateLimiter');

// Route imports
const chatRoutes = require('./src/routes/chat');
const candidatesRoutes = require('./src/routes/candidates');
const timelineRoutes = require('./src/routes/timeline');
const votingRoutes = require('./src/routes/voting');

const app = express();
const PORT = process.env.PORT || 3001;

// ─────────────────────────────────────────
// Security Middleware
// ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://www.googletagmanager.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://firebaseinstallations.googleapis.com', 'https://fcmregistrations.googleapis.com'],
    },
  },
}));

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((o) => o.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow if origin is in the list, or if the list contains '*'
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      logger.warn('CORS blocked', { origin });
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-guest-id'],
}));

// ─────────────────────────────────────────
// Body Parsing
// ─────────────────────────────────────────
app.use(express.json({ limit: '10kb' })); // Limit payload size
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// ─────────────────────────────────────────
// Rate Limiting (global)
// ─────────────────────────────────────────
app.use('/api', generalLimiter);

// ─────────────────────────────────────────
// Request Logger
// ─────────────────────────────────────────
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${Date.now() - start}ms`,
      ip: req.ip,
    });
  });
  next();
});

// ─────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/vote', votingRoutes);

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'BallotBuddy API',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    mockMode: process.env.USE_MOCK_AI === 'true',
  });
});

// ─────────────────────────────────────────
// Serve Frontend Static Files (Production)
// ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

// ─────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack });

  if (err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, error: 'CORS policy violation.' });
  }

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error.' : err.message,
  });
});

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
});

// ─────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`BallotBuddy API running on port ${PORT}`, {
      environment: process.env.NODE_ENV || 'development',
      mockMode: process.env.USE_MOCK_AI !== 'false',
    });
  });
}

module.exports = app; // Export for testing
