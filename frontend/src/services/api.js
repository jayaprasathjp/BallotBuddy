// src/services/api.js
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach guest ID on every request
api.interceptors.request.use((config) => {
  const guestId = localStorage.getItem('ballotbuddy_guest_id');
  if (guestId) config.headers['x-guest-id'] = guestId;
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ballotbuddy_token');
      localStorage.removeItem('ballotbuddy_user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────
// Auth routes removed for Guest-First accessibility

// ── Chat ─────────────────────────────────────────────────────────
export const chatApi = {
  sendMessage: (message, history = [], language = 'en') =>
    api.post('/chat', { message, history, language }),
};

// ── Candidates ───────────────────────────────────────────────────
export const candidatesApi = {
  list: (constituency) => api.get('/candidates', { params: { constituency } }),
  compare: (candidateIds) => api.post('/candidates/compare', { candidateIds }),
};

// ── Timeline ─────────────────────────────────────────────────────
export const timelineApi = {
  list: () => api.get('/timeline'),
  scheduleReminder: (eventId, fcmToken) =>
    api.post('/timeline/reminder', { eventId, fcmToken }),
};

// ── Voting Simulation ────────────────────────────────────────────
export const votingApi = {
  simulate: (candidateId, sessionId) =>
    api.post('/vote/simulate', { candidateId, sessionId }),
};

export default api;
