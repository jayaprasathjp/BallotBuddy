/**
 * Chat Routes
 * POST /api/chat  – Send a message to the AI election assistant
 */
const express = require("express");
const router = express.Router();

const { chat } = require("../services/vertexai");
const { createDoc, queryDocs } = require("../services/firestore");
const { validators } = require("../middleware/validate");
const { chatLimiter } = require("../middleware/rateLimiter");
const { sanitizeBody } = require("../middleware/sanitize");
const { optionalGuest } = require("../middleware/auth");
const logger = require("../services/logger");

const MAX_HISTORY_ITEMS = 50;

// POST /api/chat
router.post(
  "/",
  chatLimiter,
  optionalGuest,
  sanitizeBody,
  validators.chatMessage,
  async (req, res) => {
    const { message, language, history } = req.body;
    const userId = req.guestId;

    try {
      logger.info("Chat request received", {
        userId,
        language,
        messageLength: message.length,
      });

      // Get AI response
      const aiResponse = await chat(message, history, language);

      // Persist chat history to Firestore (async, don't block response)
      if (userId !== "anonymous") {
        createDoc("chatHistory", {
          userId,
          userMessage: message,
          aiResponse,
          language,
          timestamp: new Date().toISOString(),
        }).catch((err) =>
          logger.error("Failed to save chat history", { error: err.message }),
        );
      }

      res.json({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Chat route error", { error: error.message, userId });
      res.status(500).json({
        success: false,
        error: "Failed to process your question. Please try again.",
      });
    }
  },
);

// GET /api/chat/history  – Get user's chat history (protected)
router.get("/history", optionalGuest, async (req, res) => {
  if (req.guestId === "anonymous") {
    return res
      .status(401)
      .json({ success: false, error: "Guest identifier required." });
  }
  try {
    const history = await queryDocs("chatHistory", "userId", "==", req.guestId);
    res.json({ success: true, history: history.slice(-MAX_HISTORY_ITEMS) }); // Last MAX_HISTORY_ITEMS messages
  } catch {
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve history." });
  }
});

module.exports = router;
