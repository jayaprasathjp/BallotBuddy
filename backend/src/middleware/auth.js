/**
 * Guest Middleware
 * Identifies users via a transient x-guest-id header for persistent anonymous interactions.
 */
const logger = require("../services/logger");

const guestMiddleware = (req, res, next) => {
  const guestId = req.headers["x-guest-id"];

  if (!guestId) {
    logger.warn("Missing x-guest-id header", { ip: req.ip });
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      message: "Missing guest identifier.",
    });
  }

  req.guestId = guestId;
  next();
};

const optionalGuest = (req, res, next) => {
  req.guestId = req.headers["x-guest-id"] || "anonymous";
  next();
};

module.exports = { guestMiddleware, optionalGuest };
