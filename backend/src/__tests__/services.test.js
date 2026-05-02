/**
 * Backend Tests: Services (Firestore & VertexAI & FCM)
 */
const { getDoc, setDoc, getDocs, queryDocs, createDoc } = require('../services/firestore');
const { chat, compareCandidates } = require('../services/vertexai');
const { sendElectionReminder } = require('../services/fcm');

// Mock @google-cloud/firestore
jest.mock('@google-cloud/firestore', () => {
  const mockFirestore = jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: '1',
          data: () => ({ name: 'Test' }),
        }),
        set: jest.fn().mockResolvedValue(true),
      })),
      get: jest.fn().mockResolvedValue({
        docs: [
          { id: '1', data: () => ({ id: '1', name: 'T1' }) },
          { id: '2', data: () => ({ id: '2', name: 'T2' }) },
        ]
      }),
      add: jest.fn().mockResolvedValue({
        id: 'new-id',
        get: jest.fn().mockResolvedValue({
          data: () => ({ name: 'New Doc' })
        })
      }),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  }));

  mockFirestore.FieldValue = {
    serverTimestamp: jest.fn().mockReturnValue('mock-timestamp'),
  };

  return {
    Firestore: mockFirestore,
  };
});

// Mock firebase-admin is no longer needed

// Mock @google-cloud/vertexai
jest.mock('@google-cloud/vertexai', () => ({
  VertexAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          candidates: [{
            content: {
              parts: [{ text: 'Comparison result string' }]
            }
          }]
        }
      }),
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({
          response: {
            candidates: [{
              content: {
                parts: [{ text: '{"explanation": "ok"}' }]
              }
            }]
          }
        })
      })
    }))
  }))
}));

describe('Firestore Service', () => {
  it('getDoc should return data', async () => {
    const data = await getDoc('test', '1');
    expect(data.id).toBe('1');
    expect(data.name).toBe('Test');
  });

  it('setDoc should complete', async () => {
    const res = await setDoc('test', '1', { name: 'New' });
    expect(res.id).toBe('1');
  });

  it('getDocs should return array', async () => {
    const docs = await getDocs('test');
    expect(docs.length).toBe(2);
  });

  it('queryDocs should return array', async () => {
    const docs = await queryDocs('test', 'name', '==', 'T1');
    expect(docs.length).toBe(2);
  });

  it('createDoc should return new doc', async () => {
    const doc = await createDoc('test', { name: 'New Doc' });
    expect(doc.id).toBe('new-id');
  });
});

describe('VertexAI Service', () => {
  beforeEach(() => {
    process.env.GOOGLE_CLOUD_PROJECT = 'test-project';
    process.env.USE_MOCK_AI = 'false';
  });

  it('chat should return parsed response', async () => {
    const res = await chat('hi');
    expect(res.explanation).toBe('ok');
  });

  it('chat should work with non-english language', async () => {
    const res = await chat('hi', [], 'hi');
    expect(res.explanation).toBe('ok');
  });

  it('compareCandidates should return string result', async () => {
    const res = await compareCandidates([{ name: 'A' }, { name: 'B' }]);
    expect(res).toBe('Comparison result string');
  });
});

describe('FCM Service', () => {
  it('sendElectionReminder should succeed with tokens', async () => {
    const res = await sendElectionReminder(['t1'], { title: 'E', date: '2024-01-01' });
    expect(res.sent).toBe(1);
    expect(res.total).toBe(1);
  });

  it('sendElectionReminder should return undefined if no tokens', async () => {
    const res = await sendElectionReminder([], { title: 'E' });
    expect(res).toBeUndefined();
  });
});
