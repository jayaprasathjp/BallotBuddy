/**
 * Mock Voting Simulator Routes
 * POST /api/vote/simulate  – Simulate a ballot vote (no real votes stored)
 * GET  /api/vote/receipt   – Get VVPAT-style receipt
 */
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { randomInt } = require('crypto'); // CSPRNG – safe for unpredictable identifiers

const { validators } = require('../middleware/validate');
const { sanitizeBody } = require('../middleware/sanitize');
const { optionalGuest } = require('../middleware/auth');
const logger = require('../services/logger');

// In-memory store for mock votes (session-scoped, not persisted)
const simulatedVotes = new Map();

// POST /api/vote/simulate
router.post('/simulate', optionalGuest, sanitizeBody, validators.voteSimulate, (req, res) => {
  const { candidateId, sessionId } = req.body;

  // Prevent duplicate votes in same session
  if (simulatedVotes.has(sessionId)) {
    return res.status(409).json({
      success: false,
      error: 'You have already simulated a vote in this session.',
      code: 'DUPLICATE_VOTE',
    });
  }

  const voteId = uuidv4();
  const timestamp = new Date().toISOString();
  const receipt = {
    voteId,
    candidateId,
    sessionId,
    timestamp,
    serialNumber: randomInt(100000, 1000000),
    message: 'Your vote has been recorded in the EVM. A VVPAT slip has been generated for your verification.',
    disclaimer: 'THIS IS A SIMULATION ONLY. No real votes are being recorded.',
  };

  // Store session vote (cleared after 30 minutes)
  simulatedVotes.set(sessionId, receipt);
  setTimeout(() => simulatedVotes.delete(sessionId), 30 * 60 * 1000);

  logger.info('Mock vote simulated', { voteId, candidateId });

  res.json({ success: true, receipt });
});

// GET /api/vote/receipt/:sessionId
router.get('/receipt/:sessionId', (req, res) => {
  const receipt = simulatedVotes.get(req.params.sessionId);
  if (!receipt) {
    return res.status(404).json({ success: false, error: 'No vote found for this session.' });
  }
  res.json({ success: true, receipt });
});

module.exports = router;
