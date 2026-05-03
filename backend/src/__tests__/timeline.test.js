/**
 * Backend Tests: Timeline Routes
 */
const request = require("supertest");
const app = require("../../server");

const testGuestId = "guest_123";

jest.mock("../services/firestore", () => ({
  getDocs: jest.fn().mockResolvedValue([]),
  getDoc: jest.fn(),
}));

jest.mock("../services/fcm", () => ({
  sendElectionReminder: jest.fn().mockResolvedValue({ success: true }),
}));

describe("Timeline API", () => {
  it("GET /api/timeline should return election events", async () => {
    const res = await request(app).get("/api/timeline");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.events).toBeDefined();
  });

  it("POST /api/timeline/reminder should require guest identifier", async () => {
    const res = await request(app)
      .post("/api/timeline/reminder")
      .send({ eventId: "evt-1", fcmToken: "test-token-long-enough" });
    expect(res.status).toBe(401);
  });

  it("POST /api/timeline/reminder should succeed with valid data", async () => {
    const res = await request(app)
      .post("/api/timeline/reminder")
      .set("x-guest-id", testGuestId)
      .send({ eventId: "evt-008", fcmToken: "test-token-long-enough" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
