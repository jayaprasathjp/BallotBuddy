/**
 * Candidates Routes
 * GET  /api/candidates          – List all candidates
 * GET  /api/candidates/:id      – Get single candidate
 * POST /api/candidates/compare  – AI comparison of candidates
 */
const express = require("express");
const router = express.Router();

const { getDocs, getDoc } = require("../services/firestore");
const { compareCandidates } = require("../services/vertexai");
const { validators } = require("../middleware/validate");
const { sanitizeBody } = require("../middleware/sanitize");
const logger = require("../services/logger");

// Seed data used when Firestore is empty (demo mode)
const SEED_CANDIDATES = [
  {
    id: "cand-001",
    name: "Priya Sharma",
    party: "Progressive Alliance",
    partyColor: "#1976d2",
    constituency: "Delhi East",
    education: "M.A. Political Science, Delhi University",
    experience: "8 years as Municipal Councillor",
    assets: "₹45 Lakhs",
    liabilities: "₹12 Lakhs",
    criminalCases: 0,
    manifesto: [
      "Infrastructure development",
      "Women safety",
      "Digital literacy",
    ],
    imageInitial: "P",
    age: 42,
  },
  {
    id: "cand-002",
    name: "Rajesh Kumar",
    party: "National Unity Party",
    partyColor: "#f57c00",
    constituency: "Delhi East",
    education: "B.Tech, IIT Delhi; MBA, IIM Ahmedabad",
    experience: "12 years in business, 4 years as MLA",
    assets: "₹1.2 Crores",
    liabilities: "₹25 Lakhs",
    criminalCases: 1,
    manifesto: ["Economic growth", "Job creation", "Smart city"],
    imageInitial: "R",
    age: 51,
  },
  {
    id: "cand-003",
    name: "Meera Patel",
    party: "Green Future Party",
    partyColor: "#388e3c",
    constituency: "Delhi East",
    education: "Ph.D. Environmental Science, JNU",
    experience: "6 years as environmental activist, 2 years as Councillor",
    assets: "₹18 Lakhs",
    liabilities: "₹3 Lakhs",
    criminalCases: 0,
    manifesto: ["Climate action", "Clean energy", "Public transport"],
    imageInitial: "M",
    age: 38,
  },
  {
    id: "cand-004",
    name: "Arjun Singh",
    party: "Peoples Voice Party",
    partyColor: "#7b1fa2",
    constituency: "Delhi East",
    education: "B.A. History, BHU",
    experience: "15 years as social worker, Union leader",
    assets: "₹8 Lakhs",
    liabilities: "₹0",
    criminalCases: 0,
    manifesto: ["Workers rights", "Affordable housing", "Healthcare for all"],
    imageInitial: "A",
    age: 55,
  },
];

// GET /api/candidates
router.get("/", async (req, res) => {
  try {
    let candidates = await getDocs("candidates", "name", 50);
    if (candidates.length === 0) {
      // Use seed data in demo mode
      candidates = SEED_CANDIDATES;
      logger.info("Returning seed candidates (Firestore empty)");
    }
    res.json({ success: true, candidates, total: candidates.length });
  } catch (error) {
    logger.error("Candidates fetch error", { error: error.message });
    // Fallback to seed data
    res.json({
      success: true,
      candidates: SEED_CANDIDATES,
      total: SEED_CANDIDATES.length,
    });
  }
});

// GET /api/candidates/:id
router.get("/:id", async (req, res) => {
  try {
    let candidate = await getDoc("candidates", req.params.id);
    if (!candidate) {
      candidate = SEED_CANDIDATES.find((c) => c.id === req.params.id);
    }
    if (!candidate) {
      return res
        .status(404)
        .json({ success: false, error: "Candidate not found." });
    }
    res.json({ success: true, candidate });
  } catch (error) {
    logger.error("Failed to retrieve candidate", {
      error: error.message,
      id: req.params.id,
    });
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve candidate." });
  }
});

// POST /api/candidates/compare
router.post(
  "/compare",
  sanitizeBody,
  validators.candidateCompare,
  async (req, res) => {
    const { candidateIds } = req.body;

    try {
      let allCandidates = await getDocs("candidates");
      if (allCandidates.length === 0) allCandidates = SEED_CANDIDATES;

      const selected = allCandidates.filter((c) => candidateIds.includes(c.id));
      if (selected.length < 2) {
        return res
          .status(400)
          .json({
            success: false,
            error: "Select at least 2 candidates to compare.",
          });
      }

      const summary = await compareCandidates(selected);
      res.json({ success: true, candidates: selected, summary });
    } catch (error) {
      logger.error("Compare error", { error: error.message });
      res
        .status(500)
        .json({
          success: false,
          error: "Comparison failed. Please try again.",
        });
    }
  },
);

module.exports = router;
