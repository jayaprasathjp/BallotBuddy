const express = require("express");
const { validators } = require("../middleware/validate");
const { createDoc, queryDocs } = require("../services/firestore");
const logger = require("../services/logger");
const cryptoModule = require("crypto"); // We would use bcrypt in a real app, but crypto is built-in

const router = express.Router();

/**
 * Hash password helper
 */
const hashPassword = (password) => {
  return cryptoModule.createHash("sha256").update(password).digest("hex");
};

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post("/register", validators.register, async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUsers = await queryDocs(
      "users",
      "email",
      "==",
      email.toLowerCase(),
    );

    if (existingUsers && existingUsers.length > 0) {
      logger.warn("Registration failed: Email already exists", {
        email: email.toLowerCase(),
      });
      return res.status(409).json({
        success: false,
        error: "A user with this email already exists",
        field: "email",
      });
    }

    // Create user
    const hashedPassword = hashPassword(password);
    const user = await createDoc("users", {
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
    });

    logger.info("User registered successfully", { userId: user.id });

    // Exclude password from response
    const { password: _, ...safeUser } = user;

    return res.status(201).json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    logger.error("Registration error", { error: error.message });
    return res
      .status(500)
      .json({ success: false, error: "Failed to register user" });
  }
});

/**
 * POST /api/auth/login
 * Authenticate a user
 */
router.post("/login", validators.login, async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await queryDocs("users", "email", "==", email.toLowerCase());

    if (!users || users.length === 0) {
      logger.warn("Login failed: User not found", {
        email: email.toLowerCase(),
      });
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    const user = users[0];
    const hashedPassword = hashPassword(password);

    if (user.password !== hashedPassword) {
      logger.warn("Login failed: Incorrect password", {
        email: email.toLowerCase(),
      });
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    logger.info("User logged in successfully", { userId: user.id });

    // Exclude password from response
    const { password: _, ...safeUser } = user;

    return res.json({
      success: true,
      data: safeUser,
    });
  } catch (error) {
    logger.error("Login error", { error: error.message });
    return res.status(500).json({ success: false, error: "Failed to login" });
  }
});

module.exports = router;
