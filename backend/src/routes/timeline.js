/**
 * Election Timeline Routes
 * GET /api/timeline  – Get all election events
 * POST /api/timeline/reminder – Set a reminder for an event
 */
const express = require("express");
const router = express.Router();

const { getDocs, getDoc } = require("../services/firestore");
const { sendElectionReminder } = require("../services/fcm");
const { validators } = require("../middleware/validate");
const { guestMiddleware } = require("../middleware/auth");
const logger = require("../services/logger");

// Seed timeline data
const SEED_TIMELINE = [
  {
    id: "evt-001",
    title: "Election Announcement",
    description:
      "Election Commission announces election schedule and Model Code of Conduct comes into effect.",
    date: "2024-03-01",
    type: "announcement",
    icon: "📢",
    completed: true,
  },
  {
    id: "evt-002",
    title: "Nomination Filing Begins",
    description:
      "Candidates begin filing their nomination papers with the Returning Officer.",
    date: "2024-03-10",
    type: "nomination",
    icon: "📝",
    completed: true,
  },
  {
    id: "evt-003",
    title: "Last Date for Nominations",
    description: "Final day for candidates to submit nomination papers.",
    date: "2024-03-17",
    type: "nomination",
    icon: "📋",
    completed: true,
  },
  {
    id: "evt-004",
    title: "Scrutiny of Nominations",
    description:
      "Returning Officer examines all nomination papers for eligibility.",
    date: "2024-03-18",
    type: "scrutiny",
    icon: "🔍",
    completed: true,
  },
  {
    id: "evt-005",
    title: "Last Date for Withdrawal",
    description: "Candidates can withdraw their candidature until this date.",
    date: "2024-03-20",
    type: "withdrawal",
    icon: "↩️",
    completed: true,
  },
  {
    id: "evt-006",
    title: "Campaign Period",
    description:
      "Active campaigning period. Candidates hold rallies and door-to-door campaigns.",
    date: "2024-03-21",
    endDate: "2024-04-17",
    type: "campaign",
    icon: "📣",
    completed: false,
    current: true,
  },
  {
    id: "evt-007",
    title: "Campaign Silence Period",
    description:
      "48-hour silence period before polling. No campaigning allowed.",
    date: "2024-04-17",
    type: "silence",
    icon: "🤫",
    completed: false,
  },
  {
    id: "evt-008",
    title: "Polling Day",
    description:
      "Election Day! Eligible voters cast their votes at designated polling booths from 7 AM to 6 PM.",
    date: "2024-04-19",
    type: "polling",
    icon: "🗳️",
    completed: false,
    important: true,
  },
  {
    id: "evt-009",
    title: "Vote Counting",
    description:
      "EVM votes are counted at the counting center under strict security.",
    date: "2024-06-04",
    type: "counting",
    icon: "🔢",
    completed: false,
  },
  {
    id: "evt-010",
    title: "Result Declaration",
    description: "Official results announced by Election Commission of India.",
    date: "2024-06-05",
    type: "result",
    icon: "🏆",
    completed: false,
  },
];

// GET /api/timeline
router.get("/", async (req, res) => {
  try {
    let events = await getDocs("timeline", "date", 20);
    if (events.length === 0) {
      events = SEED_TIMELINE;
      logger.info("Returning seed timeline (Firestore empty)");
    }
    res.json({ success: true, events, total: events.length });
  } catch (error) {
    logger.error("Timeline fetch error", { error: error.message });
    res.json({
      success: true,
      events: SEED_TIMELINE,
      total: SEED_TIMELINE.length,
    });
  }
});

// POST /api/timeline/reminder
router.post(
  "/reminder",
  guestMiddleware,
  validators.reminder,
  async (req, res) => {
    const { eventId, fcmToken } = req.body;

    try {
      let event = await getDoc("timeline", eventId);
      if (!event) {
        const events = SEED_TIMELINE;
        event = events.find((e) => e.id === eventId);
      }

      if (!event) {
        return res
          .status(404)
          .json({ success: false, error: "Event not found." });
      }

      const result = await sendElectionReminder([fcmToken], event);
      logger.info("Reminder sent", { userId: req.guestId, eventId });

      res.json({
        success: true,
        message: "Reminder set successfully.",
        notification: result,
      });
    } catch (error) {
      logger.error("Reminder error", { error: error.message });
      res
        .status(500)
        .json({ success: false, error: "Failed to set reminder." });
    }
  },
);

module.exports = router;
