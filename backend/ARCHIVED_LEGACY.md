# HumSaathi AI — Legacy Node.js Backend (Archived)

> [!NOTE]
> This folder contains the legacy Express.js / Node.js prototype from early development.
> The primary, unified, production-grade backend for HumSaathi AI is located in [`backend-python/`](../backend-python/).

## Unified Architecture Overview

- **Primary Backend**: `backend-python/` (FastAPI, SQLAlchemy, PBKDF2 Password Hashing, Google OAuth, Multilingual NLP, Gemini AI Integration, Admin RBAC).
- **Default Port**: `8000` (http://localhost:8000).
- **Serverless Production**: `api/index.py` handles all `/api/*` routes on Vercel.
- **Frontend**: `frontend/` (Vite, React) proxying `/api` -> `http://localhost:8000`.

To start the full application in development, run from the repository root:
```bash
npm run dev
```
