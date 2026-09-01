# HumSaathi AI — Vercel Deployment Guide

This guide explains how to deploy **HumSaathi AI** (Vite React Frontend + FastAPI Serverless Python Backend) on **Vercel**.

---

## Architecture Overview

* **Frontend**: React + Vite SPA built to `frontend/dist`.
* **Backend API**: Python FastAPI application deployed as an ASGI Serverless Function in `api/index.py`.
* **Routing**: Managed by [`vercel.json`](file:///c:/Users/itxab/Downloads/Compressed/HumSaathi-AI-main/vercel.json), routing `/api/*` to the Python serverless runtime and all client routes to `index.html`.

---

## Method 1: Deploy via Vercel Web Dashboard (Recommended)

1. **Push your code to GitHub / GitLab / Bitbucket**:
   ```bash
   git add .
   git commit -m "Upgrade HumSaathi AI UI/UX and Vercel serverless configuration"
   git push origin main
   ```

2. **Import into Vercel**:
   * Navigate to [vercel.com/new](https://vercel.com/new).
   * Select your **HumSaathi-AI** repository.
   * Vercel will automatically detect `vercel.json` with the following pre-configured settings:
     * **Build Command**: `npm run build --prefix frontend`
     * **Output Directory**: `frontend/dist`

3. **Configure Environment Variables** in Vercel Project Settings:

   | Variable | Required | Description | Example |
   | :--- | :--- | :--- | :--- |
   | `AI_API_KEY` or `GEMINI_API_KEY` | Recommended | Google Gemini / OpenAI API key for live AI roleplay | `AIzaSy...` |
   | `DATABASE_URL` | Optional | PostgreSQL URI (e.g. Supabase, Neon, Vercel Postgres). If omitted, SQLite `/tmp/humsaathi.db` is used. | `postgresql://user:pass@host/db` |
   | `ADMIN_EMAIL` | Optional | Initial administrator email for Control Center | `admin@humsaathi.ai` |
   | `ADMIN_PASSWORD` | Optional | Initial administrator password | `AdminSecurePass123!` |
   | `ALLOWED_ORIGINS` | Optional | Allowed CORS origins (defaults to `*`) | `https://hum-saathi-ai.vercel.app` |
   | `VITE_GOOGLE_CLIENT_ID` | Required for Google Auth (Frontend) | Google OAuth 2.0 Client ID for Google Identity Services frontend button | `xxxx.apps.googleusercontent.com` |
   | `GOOGLE_CLIENT_ID` | Required for Google Auth (Backend) | Google OAuth 2.0 Client ID for server-side token audience verification | `xxxx.apps.googleusercontent.com` |
   | `GOOGLE_CLIENT_SECRET` | Optional (Backend) | Google OAuth 2.0 Client Secret (never exposed to client) | `GOCSPX-...` |

### Google Cloud Console Setup (OAuth 2.0 Credentials)

1. Go to **[Google Cloud Console](https://console.cloud.google.com/)** -> **APIs & Services** -> **Credentials**.
2. Create or configure an **OAuth 2.0 Client ID** (Application type: **Web application**).
3. Under **Authorized JavaScript origins**, add:
   - `https://hum-saathi-ai.vercel.app` (Production)
   - `http://localhost:5173` (Local Dev - Vite)
   - `http://localhost:3000` (Local Dev fallback)
4. Under **Authorized redirect URIs**, add:
   - `https://hum-saathi-ai.vercel.app`
   - `https://hum-saathi-ai.vercel.app/login`
   - `https://hum-saathi-ai.vercel.app/signup`
   - `http://localhost:5173`
   - `http://localhost:5173/login`
5. Copy the **Client ID** and add it as `VITE_GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_ID` in your Vercel Environment Variables.
6. Trigger a redeploy in Vercel so Vite bakes `VITE_GOOGLE_CLIENT_ID` into the frontend build.

4. Click **Deploy**. Vercel will build both the frontend and serverless Python backend functions.


---

## Method 2: Deploy via Vercel CLI

1. **Log in to your Vercel account**:
   ```bash
   npx vercel login
   ```

2. **Deploy to Preview**:
   ```bash
   npx vercel
   ```

3. **Deploy to Production**:
   ```bash
   npx vercel --prod
   ```

4. **Set Environment Variables via CLI**:
   ```bash
   npx vercel env add GEMINI_API_KEY
   ```

---

## Verifying Deployment

Once deployed, you can verify the deployment endpoints:
* **Frontend App**: `https://<your-project>.vercel.app/`
* **API Health Check**: `https://<your-project>.vercel.app/api/health`
* **API Documentation**: `https://<your-project>.vercel.app/docs`
* **Admin Control Center**: `https://<your-project>.vercel.app/admin/dashboard`
