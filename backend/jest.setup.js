/**
 * Global Jest Setup
 * Mocks heavy cloud dependencies that should not be initialized during tests.
 */

jest.mock('@google-cloud/firestore', () => {
  const mockFirestore = jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn().mockResolvedValue({
          exists: true,
          id: 'mock-id',
          data: () => ({ name: 'Mock Data' }),
        }),
        set: jest.fn().mockResolvedValue(true),
        delete: jest.fn().mockResolvedValue(true),
      })),
      get: jest.fn().mockResolvedValue({
        docs: []
      }),
      add: jest.fn().mockResolvedValue({
        id: 'new-id',
        get: jest.fn().mockResolvedValue({
          data: () => ({})
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

jest.mock('google-auth-library', () => ({
  GoogleAuth: jest.fn().mockImplementation(() => ({
    getClient: jest.fn().mockResolvedValue({
      getAccessToken: jest.fn().mockResolvedValue({ token: 'mock-token' }),
    }),
  })),
}));

jest.mock('axios', () => ({
  post: jest.fn().mockResolvedValue({ data: { name: 'projects/test/messages/123' } }),
  get: jest.fn().mockResolvedValue({ data: {} }),
}));

jest.mock('@google-cloud/vertexai', () => ({
  VertexAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockImplementation(() => ({
      generateContent: jest.fn().mockResolvedValue({ response: { candidates: [] } }),
      startChat: jest.fn().mockReturnValue({
        sendMessage: jest.fn().mockResolvedValue({ response: { candidates: [] } }),
      }),
    })),
  })),
}));

jest.mock('@google-cloud/logging-winston', () => ({
  LoggingWinston: jest.fn().mockImplementation(() => ({
    log: jest.fn(),
  })),
}));
