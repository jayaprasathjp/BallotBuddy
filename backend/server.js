/**
 * BallotBuddy Backend – Express Server
 * Production-ready Node.js API with security, logging, and GCP integrations.
 *
 * Middleware stack (in order):
 *  1. Compression  – gzip/deflate all text responses for performance
 *  2. Helmet       – sets secure HTTP headers
 *  3. CORS         – allows configured cross-origin requests
 *  4. Body parsing – limits payload to 10 KB
 *  5. Rate limiting – protects API from abuse
 *  6. Routes       – domain-specific handlers
 *  7. Static files – serves frontend SPA with long-lived cache headers
 */
require('dotenv').config();

const express = require('express');
const compression = require('compression');
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
// Startup Environment Validation
// ─────────────────────────────────────────
const { validateEnv } = require('./src/services/envValidator');
validateEnv(); // Logs warnings/errors; non-blocking in dev, strict in prod

// ─────────────────────────────────────────
// Compression (must be first for max effect)
// ─────────────────────────────────────────
app.use(compression({
  level: 6,        // Balance between speed and compression ratio
  threshold: 1024, // Only compress responses > 1 KB
}));

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
// API Routes  (/api/* canonical + /* aliases for backwards compat)
// ─────────────────────────────────────────
app.use('/api/chat', chatRoutes);
app.use('/api/candidates', candidatesRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/vote', votingRoutes);

// Backward-compat aliases – handles frontend built without /api prefix
app.use('/chat', chatRoutes);
app.use('/candidates', candidatesRoutes);
app.use('/timeline', timelineRoutes);
app.use('/vote', votingRoutes);

// Health check endpoint (required for Cloud Run)
app.get('/health', (req, res) => {
  const { stats } = require('./src/services/cache');
  const { getMockStatus } = require('./src/services/vertexai');
  const { useMock, reason } = getMockStatus();

  res.json({
    status: 'healthy',
    service: 'BallotBuddy API',
    version: process.env.npm_package_version || '1.0.0',
    timestamp: new Date().toISOString(),
    ai: { mockMode: useMock, reason },
    cache: stats(),
  });
});

// ─────────────────────────────────────────
// Serve Frontend Static Files (Production)
// ─────────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');

  // Serve hashed assets (JS/CSS) with a 1-year immutable cache
  app.use('/assets', express.static(path.join(frontendBuild, 'assets'), {
    maxAge: '1y',
    immutable: true,
  }));

  // Serve remaining static files (fonts, icons) with 1-week cache
  app.use(express.static(frontendBuild, { maxAge: '7d' }));

  // SPA fallback – always return index.html with no-cache so the
  // browser always gets the latest entry point
  app.get('*', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
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
