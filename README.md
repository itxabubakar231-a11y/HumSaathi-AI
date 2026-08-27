# HumSaathi AI

A comprehensive learning support platform.

## Project Structure

This project uses a clear full-stack structure:
- `frontend/` - React/Vite web application
- `backend/` - Node.js/Express API with Prisma

## Getting Started (Full Stack)

To run both the frontend and backend simultaneously from the root:

```bash
npm install
npm run setup
npm run dev:all
```

## Backend Setup Instructions

The backend is built with Node.js, Express, Prisma (SQLite), and Zod. It provides the core API for users, assessments, activities, and AI adaptations.

### 1. Install Dependencies
Navigate to the `backend/` directory and install dependencies:
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend/` directory:
```bash
cp .env.example .env
```
Update the `.env` file if necessary. The AI features use fallback rules if `AI_API_KEY` is empty, so it works out of the box without a key.

### 3. Initialize Prisma (Database)
Generate the Prisma client and push the schema to the SQLite database:
```bash
npm run db:generate
npm run db:push
```

### 4. Seed the Database
Seed the database with sample activities and users:
```bash
npm run db:seed
```
*(Alternatively, you can run `npm run db:setup` to push and seed in one command).*

### 5. Start the Backend
```bash
npm run dev
# OR for production
npm start
```
The server will run on `http://localhost:3000` (or the PORT defined in `.env`).

## Frontend Setup Instructions

### 1. Install Dependencies
Navigate to the `frontend/` directory and install dependencies:
```bash
cd frontend
npm install
```

### 2. Environment Variables
Ensure the `frontend/.env` file contains the correct backend URL:
```env
VITE_API_URL=http://localhost:3000
```

### 3. Start the Frontend
```bash
npm run dev
```
The React application will be available at `http://localhost:5173`.

### Available API Endpoints

- `GET /api/health` - Check backend health and AI mode
- `POST /api/users/setup` - Create/update user profile
- `GET /api/users/:userId` - Get user profile
- `GET /api/assessment/:userId/questions` - Get initial assessment questions
- `POST /api/assessment/:userId/submit` - Submit assessment
- `GET /api/activities` - Get filtered activities
- `GET /api/activities/:id` - Get specific activity details
- `POST /api/attempts/:userId/submit` - Submit activity attempt
- `GET /api/progress/:userId` - Get learner progress on skills
- `GET /api/dashboard/:userId` - Get full learner dashboard stats
