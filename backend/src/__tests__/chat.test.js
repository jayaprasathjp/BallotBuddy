/**
 * Backend Tests: Chat Routes
 */
const request = require("supertest");
const app = require("../../server");

const testGuestId = "guest_123";

jest.mock("../services/vertexai", () => ({
  chat: jest.fn().mockResolvedValue({
    explanation: "Test explanation",
    steps: ["Step 1"],
    timeline: "Test timeline",
    checklist: ["Item 1"],
  }),
}));

jest.mock("../services/firestore", () => ({
  createDoc: jest.fn().mockResolvedValue({ id: "mocked_doc_id" }),
  queryDocs: jest
    .fn()
    .mockResolvedValue([
      {
        userMessage: "hi",
        aiResponse: "hello",
        timestamp: new Date().toISOString(),
      },
    ]),
}));

describe("Chat API", () => {
  it("POST /api/chat should return AI response", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "How do I vote?", language: "en" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.response).toBeDefined();
  });

  it("POST /api/chat should return 400 for empty message", async () => {
    const res = await request(app)
      .post("/api/chat")
      .send({ message: "", language: "en" });

    expect(res.status).toBe(400);
  });

  it("GET /api/chat/history should return history for guest user", async () => {
    const res = await request(app)
      .get("/api/chat/history")
      .set("x-guest-id", testGuestId);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.history).toBeDefined();
  });
});
