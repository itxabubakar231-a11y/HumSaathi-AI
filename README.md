# HumSaathi AI (ہم ساتھی)

An intelligent, accessible, and multilingual assistive learning & communication coaching platform for Child, Teen, and Adult learners.

---

## Unified Project Architecture

```
Frontend (React, Vite, Responsive UI, STT/TTS)
       │  (Proxies /api -> http://localhost:8000)
       ▼
ONE Unified Backend (FastAPI, Python 3.11, Uvicorn on Port 8000)
 ┌─────────────────────────────────────────────────────────────┐
 │ • Authentication (PBKDF2-HMAC-SHA256, Google OAuth, JWT)    │
 │ • Persona-Adaptive Portals (Child, Teen, Adult)             │
 │ • General AI Assistant & Multilingual Practice Scenarios    │
 │ • 7 Interactive Child Learning Games & Real-world Scenarios │
 │ • Evaluation Engine & Communication Rubrics                 │
 │ • Progress Tracking & Parent Protected Views                │
 │ • Admin Security, RBAC & AI Monitoring                      │
 └─────────────────────────────────────────────────────────────┘
       ▼
Database (SQLite / PostgreSQL with SQLAlchemy ORM)
```

---

## Quick Start (Full Stack)

To run the entire application with ONE single command from the project root:

```bash
# 1. Install frontend dependencies
npm install

# 2. Run full-stack development environment (Frontend on 5173 + Backend on 8000)
npm run dev
```

The web application will open on `http://localhost:5173` and automatically communicate with the unified backend on `http://localhost:8000`.

---

## Individual Service Commands

### Unified Backend (`backend/`)
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
- **API Base**: `http://localhost:8000/api`
- **Swagger Documentation**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`
- **Run Test Suite**: `pytest`

### Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev
```
- **Web App**: `http://localhost:5173`
- **Production Build**: `npm run build`

---

## Core Capabilities & Endpoints

### 1. Authentication & Security
- `POST /api/users/signup` — User registration with PBKDF2-HMAC-SHA256 password hashing.
- `POST /api/users/login` — Secure login returning cryptographic bearer tokens.
- `POST /api/users/auth/google` — Google Identity Services OAuth verification & auto-provisioning.
- `GET /api/users/me` — Authenticated profile lookup.

### 2. Conversational AI & Scenarios
- `GET /api/conversations/scenarios` — Multilingual scenarios with persona isolation.
- `POST /api/conversations/start` — Start a new communication or General AI Assistant session.
- `POST /api/conversations/{sessionId}/message` — Multi-turn dialogue with real-time persona calibration.
- `POST /api/evaluation/conversation` — Comprehensive scoring on clarity, relevance, and appropriateness.

### 3. Child Activities & Modules
- `GET /api/activities` — 7 foundational activities (Letters, Numbers, Colors, Shapes, Counting, Animals, Emotions, Routines).
- `POST /api/attempts/{userId}/submit` — Activity evaluation and star reward system.

### 4. Progress & Parent Portal
- `GET /api/dashboard/{userId}` — Learner dashboard stats and adaptive recommendations.
- `POST /api/dashboard/{userId}/parent` — PIN-protected parent portal.

### 5. Admin Panel & Monitoring
- `GET /api/admin/dashboard` — Platform overview, user metrics, and AI health monitoring.
- `GET /api/admin/users` — User management and persona adjustment.
- `GET /api/admin/audit-logs` — Immutable audit trail of administrative actions.

---

## Deployment
Deployed on Vercel via serverless Python entry [`api/index.py`](api/index.py) matching [`vercel.json`](vercel.json).
Live production URL: **https://hum-saathi-ai.vercel.app**
