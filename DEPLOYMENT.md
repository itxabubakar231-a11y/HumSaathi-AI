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
   | `ALLOWED_ORIGINS` | Optional | Allowed CORS origins (defaults to `*`) | `https://your-app.vercel.app` |

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
