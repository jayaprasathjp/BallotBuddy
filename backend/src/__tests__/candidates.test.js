/**
 * Backend Tests: Candidate Routes
 */
const request = require("supertest");
const app = require("../../server");

jest.mock("../services/firestore", () => ({
  getDocs: jest.fn().mockResolvedValue([
    { id: "cand-001", name: "Test Candidate 1", party: "Independent" },
    { id: "cand-002", name: "Test Candidate 2", party: "Party A" },
  ]),
  getDoc: jest.fn().mockImplementation((col, id) => {
    if (id === "invalid-id") return Promise.resolve(null);
    return Promise.resolve({ id, name: "Test Candidate" });
  }),
}));

describe("Candidates API", () => {
  it("GET /api/candidates should return list", async () => {
    const res = await request(app).get("/api/candidates");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.candidates)).toBe(true);
  });

  it("GET /api/candidates/:id should return 404 for invalid id", async () => {
    const res = await request(app).get("/api/candidates/invalid-id");
    expect(res.status).toBe(404);
  });

  it("POST /api/candidates/compare should require at least 2 candidates", async () => {
    const res = await request(app)
      .post("/api/candidates/compare")
      .send({ candidateIds: ["id1"] });
    expect(res.status).toBe(400);
  });

  it("POST /api/candidates/compare should return comparison", async () => {
    const res = await request(app)
      .post("/api/candidates/compare")
      .send({ candidateIds: ["cand-001", "cand-002"] });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
