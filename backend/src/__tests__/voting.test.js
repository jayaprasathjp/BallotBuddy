/**
 * Backend Tests: Voting Routes
 */
const request = require('supertest');
const app = require('../../server');

describe('Voting Simulation API', () => {
  it('POST /api/vote/simulate should simulate a vote', async () => {
    const res = await request(app)
      .post('/api/vote/simulate')
      .send({ candidateId: 'cand-1', sessionId: '550e8400-e29b-41d4-a716-446655440000' });
    
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.receipt).toBeDefined();
  });

  it('POST /api/vote/simulate should reject missing candidateId', async () => {
    const res = await request(app)
      .post('/api/vote/simulate')
      .send({ sessionId: '550e8400-e29b-41d4-a716-446655440001' });
    
    expect(res.status).toBe(400);
  });

  it('GET /api/vote/receipt/:sessionId should return 404 for missing vote', async () => {
    const res = await request(app).get('/api/vote/receipt/550e8400-e29b-41d4-a716-446655440002');
    expect(res.status).toBe(404);
  });
});
