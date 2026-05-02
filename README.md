# 🗳️ BallotBuddy AI – Intelligent Indian Election Assistant

<div align="center">

![BallotBuddy](https://img.shields.io/badge/BallotBuddy-AI%20Powered-1a73e8?style=for-the-badge&logo=google&logoColor=white)
![Vertex AI](https://img.shields.io/badge/Vertex%20AI-Gemini%202.5%20Flash-4285F4?style=for-the-badge&logo=google-cloud&logoColor=white)
![Cloud Run](https://img.shields.io/badge/Cloud%20Run-Deployed-34A853?style=for-the-badge&logo=google-cloud&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)

**A production-grade, accessible, multilingual AI election assistant for 950+ million Indian voters.**

[🚀 Live Demo](https://ballotbuddy-442722843230.asia-south1.run.app) · [📖 API Docs](#-api-reference) · [🏗️ Architecture](#%EF%B8%8F-system-architecture) · [🧪 Tests](#-testing)

</div>

---

## 🎯 Problem Statement

India is the world's largest democracy, yet millions of first-time voters face critical barriers:
- **Complexity**: The election process involves multiple agencies, forms, and deadlines
- **Language**: Official information is primarily in English, excluding many voters
- **Awareness**: Low civic literacy leads to missed registration windows and polling deadlines
- **Accessibility**: Disabled citizens lack dedicated, accessible election guidance tools

**BallotBuddy AI** solves all four barriers with a single, AI-powered platform that guides citizens through every step of the democratic process — in their language, on any device, for free.

---

## ✨ Core Features

| Feature | Description | Technology |
|---|---|---|
| 🤖 **AI Election Assistant** | Conversational Q&A with structured guidance on any election topic | Vertex AI Gemini 2.5 Flash |
| 🗺️ **Voter Journey Stepper** | Interactive 7-step journey from registration to casting a vote | React + State Machine |
| 📅 **Election Timeline** | Live calendar of key election dates with push notifications | FCM + Firestore |
| 👥 **Candidate Comparison** | AI-powered non-partisan candidate analysis from public affidavits | Vertex AI + Firestore |
| 🗳️ **EVM Ballot Simulator** | Realistic Electronic Voting Machine simulation (no real votes) | React + Accessibility APIs |
| 🌐 **Multilingual Support** | Full EN / हिंदी / தமிழ் support across every screen | i18next + Vertex AI |
| ♿ **WCAG AA Accessibility** | Screen reader, voice input, high contrast, font scaling | Web Speech API + ARIA |
| 🔔 **Push Notifications** | Browser push notifications for election day reminders | Firebase Cloud Messaging |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Google Cloud Platform                     │
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │   Cloud Build    │───▶│         Cloud Run                │   │
│  │  (CI/CD Pipeline)│    │  ┌──────────────┐ ┌───────────┐  │   │
│  └──────────────────┘    │  │   Frontend   │ │  Backend  │  │   │
│                           │  │  React/Vite  │ │  Express  │  │   │
│  ┌──────────────────┐    │  │  nginx:80    │ │  node:3001│  │   │
│  │   Vertex AI      │◀───│  └──────────────┘ └─────┬─────┘  │   │
│  │ Gemini 2.5 Flash │    └────────────────────────--|────────┘   │
│  └──────────────────┘                              │            │
│                                                    ▼            │
│  ┌──────────────────┐    ┌──────────────────────────────────┐   │
│  │  Cloud Logging   │◀───│           Firestore              │   │
│  │  (Winston JSON)  │    │  chatHistory / candidates /      │   │
│  └──────────────────┘    │  timeline / voteSessions         │   │
│                           └──────────────────────────────────┘   │
│  ┌──────────────────┐                                            │
│  │  Firebase FCM    │◀─── Push Notification Reminders           │
│  └──────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Request Lifecycle

```
User Request
    │
    ▼
[Rate Limiter] → 429 if exceeded
    │
    ▼
[CORS Check] → 403 if origin blocked
    │
    ▼
[Helmet Headers] → CSP, HSTS, X-Frame applied
    │
    ▼
[Input Validation (Joi)] → 400 if schema fails
    │
    ▼
[DOMPurify Sanitize] → XSS stripped
    │
    ▼
[Route Handler]
    │
    ├─── [Cache Hit?] ──Yes──▶ Return cached response (< 1ms)
    │
    └─── [Vertex AI Gemini] ──▶ Parse JSON ──▶ Cache ──▶ Return
```

### Directory Structure

```
BallotBuddy/
├── frontend/                    # React 18 + Vite SPA
│   ├── public/
│   │   ├── manifest.json        # PWA manifest
│   │   ├── robots.txt           # SEO crawler config
│   │   └── sitemap.xml          # SEO sitemap
│   ├── src/
│   │   ├── pages/               # 6 feature pages
│   │   │   ├── HomePage.jsx     # Landing + stats
│   │   │   ├── ChatPage.jsx     # AI assistant UI
│   │   │   ├── JourneyPage.jsx  # Step-by-step voter journey
│   │   │   ├── TimelinePage.jsx # Election calendar
│   │   │   ├── CandidatesPage.jsx # Candidate comparison
│   │   │   └── VotePage.jsx     # EVM ballot simulator
│   │   ├── components/          # Shared UI components
│   │   ├── context/             # Auth + Accessibility context
│   │   ├── services/            # Axios API client layer
│   │   ├── i18n/                # EN / HI / TA translation files
│   │   └── __tests__/           # Vitest + React Testing Library
│   ├── Dockerfile               # nginx multi-stage build
│   └── vite.config.js           # Build config with code splitting
│
├── backend/                     # Node.js + Express API
│   ├── src/
│   │   ├── routes/              # RESTful API routes
│   │   │   ├── chat.js          # POST /api/chat
│   │   │   ├── candidates.js    # GET/POST /api/candidates
│   │   │   ├── timeline.js      # GET/POST /api/timeline
│   │   │   └── voting.js        # POST /api/vote
│   │   ├── services/            # Business logic layer
│   │   │   ├── vertexai.js      # Gemini AI integration + caching
│   │   │   ├── firestore.js     # Firestore CRUD helpers
│   │   │   ├── cache.js         # In-memory TTL cache service
│   │   │   ├── fcm.js           # Firebase Cloud Messaging
│   │   │   └── logger.js        # Winston structured logging
│   │   ├── middleware/          # Express middleware
│   │   │   ├── auth.js          # Guest identity middleware
│   │   │   ├── rateLimiter.js   # IP-based rate limiting
│   │   │   ├── validate.js      # Joi schema validation
│   │   │   └── sanitize.js      # DOMPurify XSS sanitization
│   │   └── __tests__/           # Jest + Supertest integration tests
│   ├── server.js                # Express app entry point
│   └── Dockerfile               # Node.js production image
│
├── cloudbuild.yaml              # Cloud Build CI/CD pipeline
└── docker-compose.yml           # Local development orchestration
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+
- **npm** 9+
- (Optional) Google Cloud account with Vertex AI + Firestore enabled

### 1. Clone & Install

```bash
git clone https://github.com/jayaprasathjp/BallotBuddy.git
cd BallotBuddy

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install --legacy-peer-deps
```

### 2. Configure Environment

```bash
# Backend configuration
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=3001
NODE_ENV=development

# Google Cloud (leave blank to use mock AI)
GOOGLE_CLOUD_PROJECT=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Vertex AI
VERTEX_AI_MODEL=gemini-2.5-flash
VERTEX_AI_LOCATION=us-central1

# Set to 'true' for development without GCP
USE_MOCK_AI=true

# CORS
ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Run Locally

```bash
# Terminal 1 – Backend API
cd backend && npm run dev
# → API running on http://localhost:3001

# Terminal 2 – Frontend
cd frontend && npm run dev
# → App running on http://localhost:5173
```

### 4. Using Docker Compose (Recommended)

```bash
docker-compose up --build
# → Full stack at http://localhost:5173
```

---

## 🧪 Testing

### Backend (Jest + Supertest)

```bash
cd backend

# Run all tests
npm test

# Run with coverage report
npm run test -- --coverage

# Watch mode
npm run test:watch
```

**Test Coverage Areas:**
- ✅ Chat API endpoint (request/response validation, error handling)
- ✅ Candidate comparison routes
- ✅ Voting simulation routes
- ✅ Timeline routes
- ✅ Input validation middleware (Joi schemas)
- ✅ Rate limiter middleware
- ✅ Firestore service (CRUD operations)
- ✅ Vertex AI service (mock + live path)
- ✅ In-memory cache service (TTL, eviction, hit/miss)
- ✅ FCM notification service

### Frontend (Vitest + React Testing Library)

```bash
cd frontend

# Run all tests
npm test

# With coverage
npm run test -- --coverage
```

---

## 🔒 Security Architecture

BallotBuddy implements a **defence-in-depth** security model with multiple independent layers:

| Layer | Mechanism | Implementation |
|---|---|---|
| **Transport** | HTTPS only | Cloud Run managed TLS |
| **Headers** | Security headers | Helmet.js (CSP, HSTS, X-Frame-Options, X-Content-Type) |
| **CORS** | Origin whitelist | Dynamic origin validation with wildcard support |
| **Rate Limiting** | IP-based throttling | General: 100/15min · Chat: 20/min · Auth: 5/15min |
| **Input Validation** | Schema enforcement | Joi with `abortEarly: false` and `stripUnknown: true` |
| **XSS Prevention** | HTML sanitization | DOMPurify on all request bodies before processing |
| **Identity** | Anonymous tracking | Persistent `x-guest-id` header (no PII stored) |
| **Secrets** | Env-based config | Never in source code; validated at startup |
| **Compression** | Gzip (level 6) | Applied before all middleware for bandwidth efficiency |

### Content Security Policy

```
default-src: 'self'
script-src: 'self' + Google Analytics
style-src: 'self' + 'unsafe-inline' + Google Fonts
font-src: 'self' + Google Fonts CDN
img-src: 'self' + data: + https:
connect-src: 'self' + Firebase APIs
```

---

## ☁️ Google Cloud Integration

BallotBuddy is deeply integrated with Google Cloud Platform across **6 distinct services**:

| Service | Role | Integration Detail |
|---|---|---|
| **Vertex AI (Gemini 2.5 Flash)** | Core AI engine | Structured JSON responses via system prompt; multilingual; cached |
| **Firestore** | Data persistence | Chat history, candidates, timeline events, vote sessions |
| **Cloud Run** | Serverless hosting | Auto-scales to zero; separate services for frontend + backend |
| **Cloud Build** | CI/CD pipeline | Automated build, Docker push, and Cloud Run deployment on git push |
| **Cloud Logging** | Observability | Winston JSON structured logs shipped to Cloud Logging |
| **Firebase Cloud Messaging** | Push notifications | Election day reminders with browser push support |

### Vertex AI Integration Details

The AI pipeline uses **Gemini 2.5 Flash** with:
- **Singleton client** – initialized once, reused across all requests
- **Response caching** – identical queries served from memory (15-min TTL)
- **Structured output** – `responseMimeType: 'application/json'` enforces consistent response shape
- **Temperature: 0.3** – factual, consistent responses for civic information
- **Graceful fallback** – detailed mock responses when API is unavailable

---

## 🌐 API Reference

All endpoints accept and return `application/json`.

### Chat

```http
POST /api/chat
Content-Type: application/json
x-guest-id: <uuid>

{
  "message": "How do I register to vote?",
  "language": "en",   // "en" | "hi" | "ta"
  "history": []       // Optional: prior conversation turns
}
```

**Response:**
```json
{
  "success": true,
  "response": {
    "explanation": "Voter registration in India is free...",
    "steps": ["Step 1: Visit voters.eci.gov.in", "..."],
    "timeline": "Processed within 30 days",
    "checklist": ["Age proof", "Address proof", "..."],
    "tips": ["You can register online...", "..."],
    "relatedTopics": ["Electoral Roll", "EPIC Card"]
  },
  "timestamp": "2026-05-03T04:26:00.000Z"
}
```

### Candidates

```http
GET /api/candidates            # List all candidates
POST /api/candidates/compare   # AI comparison
  Body: { "candidateIds": ["id1", "id2"] }
```

### Timeline

```http
GET  /api/timeline             # Get election timeline events
POST /api/timeline/reminder    # Schedule push notification
  Body: { "eventId": "...", "fcmToken": "..." }
```

### Voting

```http
POST /api/vote/simulate        # Record a simulated vote
  Body: { "candidateId": "...", "sessionId": "<uuid>" }
```

### Health Check

```http
GET /health

# Response includes AI mode, cache stats, and service version
{
  "status": "healthy",
  "service": "BallotBuddy API",
  "version": "1.0.0",
  "ai": { "mockMode": false, "reason": "Live AI enabled" },
  "cache": { "size": 12, "maxEntries": 500, "defaultTtlMs": 900000 }
}
```

---

## ♿ Accessibility

BallotBuddy targets **WCAG 2.1 AA** compliance across every page:

- **Navigation**: Skip-to-main-content link, `aria-current="page"` on active nav items
- **Semantics**: Proper `<main>`, `<header>`, `<nav>`, `<section>` landmark regions
- **Screen Readers**: `aria-live="polite"` for AI responses, `aria-label` on all interactive elements
- **Keyboard**: Full tab order, focus-visible outlines on all focusable elements
- **Voice Input**: Web Speech API integration in the chat interface
- **Visual**: High contrast mode toggle (CSS custom properties), font scale 0.8×–1.5×
- **Reduced Motion**: Animations disabled via `prefers-reduced-motion` media query
- **Ballot Simulator**: `role="radiogroup"` with `aria-label` per candidate for screen reader voting

---

## 🚢 Deployment

### Cloud Build (CI/CD)

On every push to `main`, the pipeline automatically:

1. **Builds backend** Docker image → pushes to Google Container Registry
2. **Deploys backend** to Cloud Run (`ballotbuddy-backend`)
3. **Builds frontend** Docker image with injected `VITE_` environment variables
4. **Deploys frontend** to Cloud Run (`ballotbuddy-frontend`)

```bash
# Trigger manually
gcloud builds submit --config=cloudbuild.yaml

# Or push to GitHub to trigger automatically
git push origin main
```

### Environment Variables (Cloud Build Substitutions)

| Variable | Description | Default |
|---|---|---|
| `_REGION` | GCP region | `asia-south1` |
| `_BACKEND_URL` | Production backend URL | *(set after first deploy)* |
| `_VERTEX_AI_MODEL` | Gemini model name | `gemini-2.5-flash` |
| `_VERTEX_AI_LOCATION` | Vertex AI region | `us-central1` |
| `_USE_MOCK_AI` | Toggle mock AI | `false` |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** with Hooks and lazy-loaded routes
- **Vite 8** with tree-shaking and code splitting
- **React Router v7** for client-side navigation
- **i18next** for EN / हिंदी / தமிழ் internationalization
- **Axios** for typed HTTP client
- **Vanilla CSS** with custom properties design system

### Backend
- **Node.js 20** with ESM-compatible CJS modules
- **Express 4** with ordered middleware stack
- **@google-cloud/vertexai** for Gemini AI integration
- **@google-cloud/firestore** for NoSQL persistence
- **Joi** for declarative input validation
- **Helmet** for HTTP security headers
- **compression** for gzip response encoding
- **winston** for structured JSON logging

### Infrastructure
- **Docker** multi-stage builds for minimal image size
- **Google Cloud Build** for CI/CD automation
- **Google Cloud Run** for serverless auto-scaling
- **Firebase Cloud Messaging** for push notifications

### Testing
- **Jest** + **Supertest** for backend integration tests
- **Vitest** + **React Testing Library** for frontend unit tests

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development guidelines, branch naming, and PR process.

---

## 📄 License

MIT © 2026 BallotBuddy AI Team
