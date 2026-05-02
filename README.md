# 🗳️ BallotBuddy AI – Interactive Election Process Assistant

> **Hackathon Project** | Google Cloud × Vertex AI × Firebase

BallotBuddy AI is a production-ready, accessible, multilingual election assistant that helps Indian citizens understand and participate in the democratic process. Powered by **Google Gemini (Vertex AI)**, it provides AI-driven guidance on voter registration, election timelines, candidate comparison, and a realistic ballot simulator.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Chat Assistant** | Ask any election question in EN/HI/TA with structured answers |
| 🗺️ **Election Journey** | Interactive 7-step stepper with progress tracking |
| 📅 **Timeline** | Calendar/timeline view with push notification reminders |
| 👥 **Candidate Comparison** | AI-powered comparison of candidates using public affidavit data |
| 🗳️ **Vote Simulator** | Realistic EVM + VVPAT simulation (no real votes cast) |
| 🌐 **Multilingual** | English, Hindi, and Tamil support |
| ♿ **Accessibility** | WCAG AA, screen reader support, high contrast, font scaling |

---

## 🏗️ Architecture

```
BallotBuddy/
├── frontend/           # React 18 + Vite (SPA)
│   ├── src/
│   │   ├── pages/      # HomePage, ChatPage, JourneyPage, TimelinePage, CandidatesPage, VotePage
│   │   ├── components/ # Navbar, AccessibilityPanel, SkeletonLoader
│   │   ├── context/    # AuthContext, AccessibilityContext
│   │   ├── services/   # Axios API client
│   │   ├── locales/    # EN / HI / TA translations
│   │   └── __tests__/  # Vitest + RTL
│   └── Dockerfile
│
├── backend/            # Node.js + Express API
│   ├── src/
│   │   ├── routes/     # /chat, /candidates, /timeline, /voting
│   │   ├── services/   # Vertex AI, Firestore, FCM, Logger
│   │   └── middleware/ # Guest Auth, Rate Limiter, Validate (Joi), Sanitize
│   ├── server.js
│   └── Dockerfile
│
├── cloudbuild.yaml     # Google Cloud Build CI/CD
├── docker-compose.yml  # Local dev orchestration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- (Optional) Google Cloud account with Vertex AI + Firestore

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ballotbuddy.git
cd ballotbuddy

# Backend
cd backend && npm install
cp .env.example .env

# Frontend
cd ../frontend && npm install
```

### 2. Configure `.env` (Backend)

```env
PORT=3001
NODE_ENV=development

# Firebase / Firestore
FIREBASE_PROJECT_ID=your-gcp-project-id
GOOGLE_APPLICATION_CREDENTIALS=./service-account.json

# Set to 'true' for development (no GCP needed)
USE_MOCK_AI=true

ALLOWED_ORIGINS=http://localhost:5173
```

### 3. Run Locally

```bash
# Terminal 1 – Backend
cd backend && npm run dev

# Terminal 2 – Frontend
cd frontend && npm run dev
```

Visit **http://localhost:5173**

---

## 🧪 Testing

```bash
# Backend (Jest)
cd backend && npm test
cd backend && npm run test:coverage

# Frontend (Vitest + React Testing Library)
cd frontend && npm test
cd frontend && npm run test:coverage
```

---

## 🔒 Security

| Measure | Implementation |
|---|---|
| Identity | Persistent anonymous `x-guest-id` identification |
| Rate Limiting | 100 req/15min (general), 20/15min (chat) |
| Input Validation | Joi schemas on all endpoints |
| XSS Prevention | DOMPurify sanitization on all request bodies |
| Security Headers | Helmet.js (CSP, HSTS, X-Frame-Options) |
| CORS | Whitelist-based allowed origins |

---

## ☁️ Google Cloud Integration

| Service | Usage |
|---|---|
| **Vertex AI (Gemini)** | AI election assistant responses with structured JSON |
| **Firestore** | User profiles, chat history, candidate data, timeline events |
| **Cloud Run** | Serverless container hosting for backend + frontend |
| **Cloud Build** | CI/CD pipeline (`cloudbuild.yaml`) |
| **Cloud Logging** | Structured Winston JSON logs |
| **FCM** | Push notifications for election reminders |

---

## ♿ Accessibility

- **WCAG AA compliant** color contrasts
- Skip navigation link (`#main-content`)
- Full ARIA roles: `role="log"`, `role="alert"`, `aria-live`, `aria-expanded`, `aria-label`
- Keyboard navigable ballot (radio group pattern)
- Voice input (Web Speech API) + TTS output
- Font scaling (0.8× – 1.5×) via Accessibility Panel
- High contrast mode toggle
- Screen reader skip links

---

## 📦 Deployment (Cloud Run)

```bash
# Trigger Cloud Build manually
gcloud builds submit \
  --config=cloudbuild.yaml \
  --substitutions=_REGION=asia-south1,_USE_MOCK_AI=false,_FIREBASE_PROJECT_ID=your-project

# Or configure a Cloud Build Trigger in GCP Console to automatically deploy on push:
# 1. Cloud Build > Triggers > Create Trigger
# 2. Select Repository & Branch
# 3. Choose 'Cloud Build configuration file (yaml or json)' -> cloudbuild.yaml
# 4. Add substitution variables if needed
```

---

## 🌐 API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | `/api/chat` | AI election assistant query |
| GET | `/api/candidates` | List candidates |
| POST | `/api/candidates/compare` | AI candidate comparison |
| GET | `/api/timeline` | Election timeline events |
| POST | `/api/timeline/reminder` | Schedule FCM reminder |
| POST | `/api/voting/simulate` | Mock vote simulation |
| GET | `/health` | Health check |

---

## 🛠️ Tech Stack

**Frontend**: React 18, Vite, React Router v6, i18next (EN/HI/TA), Axios, CSS custom properties

**Backend**: Node.js, Express, Firebase Admin SDK, @google-cloud/vertexai, Joi, DOMPurify, Winston

**DevOps**: Docker, Docker Compose, Google Cloud Build, Cloud Run

**Testing**: Vitest + React Testing Library (frontend), Jest + Supertest (backend)

---

## 📄 License

MIT © 2025 BallotBuddy AI Team
