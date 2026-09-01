# HumSaathi AI

> A multilingual, persona-aware communication and life-skills companion built in Pakistan for child, teen, and adult learners.

**Live application:** [https://hum-saathi-ai.vercel.app](https://hum-saathi-ai.vercel.app)

HumSaathi (ہم ساتھی, “we are companions”) gives learners a safe place to rehearse everyday conversations, practise foundational skills, receive age-appropriate feedback, and build confidence at their own pace. The product supports English, Urdu, and Roman Urdu across distinct learner portals, with caregiver insights and an administrative control centre.

## Evaluator quick start

For the fastest review:

1. Open the [live application](https://hum-saathi-ai.vercel.app).
2. Create a profile or sign in.
3. Select the Child, Teen, or Adult portal.
4. Complete the short baseline assessment.
5. Explore the dashboard, guided activities, conversation scenarios, progress reporting, sensory preferences, and caregiver view.
6. Switch portals from the profile card to compare how content and coaching adapt.

The interface is responsive from 320 px mobile layouts through large desktop screens. Motion follows the learner’s reduced-motion preference and the operating system preference.

## What makes HumSaathi different

| Capability | What the evaluator should notice |
| --- | --- |
| Persona-aware experience | Child, Teen, and Adult portals change activities, tone, complexity, recommendations, and feedback. |
| Multilingual practice | English, Urdu, and Roman Urdu are available throughout the learning experience. Urdu views support right-to-left layout. |
| Conversation rehearsal | Learners practise realistic school, social, workplace, appointment, shopping, and community situations using text or voice. |
| Adaptive evaluation | Communication is assessed for clarity, relevance, appropriateness, and persona-specific expectations. |
| Foundational learning | Seven child-focused activity types cover letters, numbers, colours, shapes, counting, animals, emotions, and routines. |
| Progress intelligence | Attempts, skill mastery, strengths, areas for practice, streaks, and recommendations are presented in learner-friendly views. |
| Caregiver support | A protected caregiver view provides useful progress information without turning the learner experience into surveillance. |
| Sensory accessibility | Text size, reduced motion, contrast, sound, calm mode, and language controls can be adjusted by the learner. |
| Administration | Role-protected tools cover users, scenarios, permissions, analytics, AI monitoring, audit logs, and platform settings. |

## Design direction

The refreshed interface uses a distinctly Pakistani but contemporary visual language:

- Deep emerald and ivory form the primary palette, supported by saffron and indigo accents.
- Crescent-and-star brand geometry and subtle repeating craft patterns provide local character without distracting from learning.
- Urdu typography, right-to-left composition, and the line “Har qadam par, HumSaathi” reinforce the product’s cultural origin.
- Motion is purposeful: page reveals, navigation indicators, conversation entrances, and ambient hero details clarify state and hierarchy.
- All decorative emoji have been removed in favour of a consistent SVG icon system.
- Route-level code splitting keeps the initial download focused on the screen being viewed.

## Architecture

```text
Browser
  |
  |  React 19 + Vite + Motion
  |  Responsive UI, routing, STT/TTS, accessibility preferences
  v
/api through Vite proxy locally or Vercel rewrite in production
  |
  |  FastAPI + Pydantic + SQLAlchemy
  |  Authentication, persona isolation, activities, evaluation,
  |  conversations, progress, caregiver views and administration
  v
SQLite for local development / PostgreSQL for production
  |
  v
OpenAI-compatible AI provider endpoint
```

### Repository map

```text
HumSaathi-AI/
├── frontend/
│   ├── src/components/       Shared UI, layouts and persona dashboards
│   ├── src/context/          User state and internationalisation
│   ├── src/data/             Activities and translation resources
│   ├── src/pages/            Learner, auth and admin route views
│   ├── src/services/         API client
│   ├── src/utils/            Preferences and voice helpers
│   └── src/styles.css        Responsive design and accessibility system
├── backend-python/
│   ├── app/routers/          FastAPI route groups
│   ├── app/services/         Domain, scoring, AI and recommendation logic
│   ├── app/models/           SQLAlchemy models
│   ├── app/schemas/          Request and response contracts
│   └── test_*.py             Security, persona, AI and end-to-end checks
├── api/index.py              Vercel serverless entry point
├── vercel.json               Build, function and SPA rewrite configuration
└── .env.example              Environment variable template
```

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router, Vite |
| Animation | Motion for React |
| Styling | Responsive custom CSS with design tokens and RTL support |
| Backend | Python 3.11, FastAPI, Uvicorn, Pydantic |
| Data | SQLAlchemy with SQLite locally and PostgreSQL in production |
| Authentication | PBKDF2-HMAC-SHA256 credentials, signed bearer tokens, Google Identity Services |
| AI integration | OpenAI-compatible provider client; Gemini-compatible endpoint by default |
| Deployment | Vercel static frontend and Python serverless API |

## Local development

### Prerequisites

- Node.js 20 or newer
- npm 10 or newer
- Python 3.11 or newer
- Git

### 1. Clone and configure

```bash
git clone https://github.com/itxabubakar231-a11y/HumSaathi-AI.git
cd HumSaathi-AI
cp .env.example .env
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

For a local SQLite-only evaluation, `DATABASE_URL` can be omitted. Add an AI provider key to enable live generated conversation responses.

### 2. Install dependencies

```bash
npm install
python -m venv .venv
```

Activate the virtual environment:

```bash
# macOS or Linux
source .venv/bin/activate

# Windows PowerShell
.venv\Scripts\Activate.ps1
```

Then install the backend:

```bash
pip install -r backend-python/requirements.txt
```

### 3. Run the full stack

```bash
npm run dev
```

| Service | Local address |
| --- | --- |
| Frontend | [http://localhost:5173](http://localhost:5173) |
| API | [http://localhost:8000/api](http://localhost:8000/api) |
| Interactive API docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| Health check | [http://localhost:8000/api/health](http://localhost:8000/api/health) |

The Vite development server proxies `/api` requests to FastAPI on port 8000.

## Environment variables

Copy `.env.example` and configure only the services needed for your environment.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Production | PostgreSQL connection URL. Local development falls back to SQLite. |
| `SECRET_KEY` | Production | Secret used to sign authentication tokens. Use a long, random value. |
| `AI_API_KEY` | For live AI | Primary provider key. Gemini, Google, OpenAI, and DashScope aliases are also accepted. |
| `AI_BASE_URL` | Optional | OpenAI-compatible API base URL. |
| `AI_MODEL` | Optional | Provider model name. |
| `VITE_API_BASE_URL` | Optional | Frontend API origin. Leave empty on Vercel to use relative `/api` calls. |
| `VITE_GOOGLE_CLIENT_ID` | For Google sign-in | Public Google OAuth client identifier used by the frontend. |
| `GOOGLE_CLIENT_ID` | For Google sign-in | Google client identifier verified by the backend. |
| `GOOGLE_CLIENT_SECRET` | Provider-dependent | Google OAuth secret when required by the configured flow. |
| `ADMIN_EMAIL` | Optional | Bootstrap administrator email. |
| `ADMIN_PASSWORD` | Optional | Bootstrap administrator password; never commit a real value. |
| `ALLOWED_ORIGINS` | Optional | Comma-separated CORS origins. |

Never commit `.env`, database credentials, OAuth secrets, or production API keys.

## Core API groups

| Prefix | Responsibility |
| --- | --- |
| `/api/users` | Registration, login, Google authentication, and current profile |
| `/api/assessment` | Baseline assessment and persona-aware interpretation |
| `/api/activities` | Learning activity catalogue |
| `/api/attempts` | Activity submissions, evaluation, and rewards |
| `/api/conversations` | Scenarios, sessions, messages, and conversational coaching |
| `/api/evaluation` | Communication scoring and feedback |
| `/api/skills` | Teen and adult skill modules |
| `/api/progress` | Mastery and progress history |
| `/api/dashboard` | Learner recommendations and caregiver summaries |
| `/api/admin` | Role-protected administration and monitoring |

FastAPI exposes the complete live schema at `/docs` when the backend is running.

## Verification

### Frontend production build

```bash
npm run build
```

### Backend test suite

```bash
cd backend-python
pytest
```

The backend includes focused coverage for authentication security, admin authorization, user isolation, persona separation, multilingual conversation behaviour, AI quality, child activities, progress, caregiver views, and live deployment checks.

Some `*_live.py` and `verify_live_*.py` scripts call the deployed service and may create temporary test records. Run those intentionally and only against an approved environment.

## Accessibility and responsive behaviour

- Semantic headings, labelled controls, visible keyboard focus, and touch-friendly targets.
- Reduced-motion support through both the operating system preference and in-app sensory settings.
- Scalable text with small through extra-large in-app options.
- High-contrast and calm visual modes.
- Urdu right-to-left layout and Urdu-capable font fallbacks.
- Responsive navigation: persistent desktop sidebar, mobile drawer, and thumb-friendly bottom navigation.
- Layouts tested conceptually from 320 px mobile width through wide desktop displays.

## Production deployment

The application is configured as one Vercel project:

- `frontend/dist` is the static production output.
- `api/index.py` exposes FastAPI as a Python serverless function.
- `/api/*` is rewritten to the Python function.
- Non-file routes are rewritten to `index.html` for client-side routing.
- PostgreSQL should be used in production because serverless filesystems are ephemeral.

Deploy from the Vercel dashboard or CLI after setting the production environment variables:

```bash
vercel
vercel --prod
```

Production URL: [https://hum-saathi-ai.vercel.app](https://hum-saathi-ai.vercel.app)

## Security notes

- Learner and administrator routes are protected independently.
- Passwords are derived using PBKDF2-HMAC-SHA256 rather than stored directly.
- Signed bearer tokens identify authenticated requests.
- Persona and user isolation are enforced in backend services, not only hidden in the interface.
- Administrative activity is represented in audit logs.
- Production secrets belong in platform environment variables, never in source control.

## Scope and responsible use

HumSaathi is an assistive practice and learning product. It is not a diagnostic instrument, emergency service, medical device, or replacement for qualified clinical, educational, or mental-health professionals. Caregiver and educator involvement should respect learner autonomy, privacy, and consent.

## Contributors

HumSaathi AI is developed collaboratively by the repository owner and contributors. Contributions should follow the existing project structure described in `AGENTS.md`, keep learner safety and accessibility central, and include appropriate verification for behavioural changes.

---

Built with care in Pakistan. Har qadam par, HumSaathi.
