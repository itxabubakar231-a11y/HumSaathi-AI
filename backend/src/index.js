import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import usersRouter from './routes/users.js';
import assessmentRouter from './routes/assessment.js';
import activitiesRouter from './routes/activities.js';
import attemptsRouter from './routes/attempts.js';
import dashboardRouter from './routes/dashboard.js';
import progressRouter from './routes/progress.js';
import conversationsRouter from './routes/conversations.js';
import evaluationsRouter from './routes/evaluations.js';
import skillsRouter from './routes/skills.js';
import { isAiAvailable } from './services/ai/aiService.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const originalJson = res.json;
  res.json = function (body) {
    if (body && (body.success === true || body.success === false)) {
      return originalJson.call(this, body);
    }
    if (body && body.error) {
      return originalJson.call(this, { success: false, error: body.error });
    }
    return originalJson.call(this, { success: true, data: body });
  };
  next();
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'HumSaathi API',
    aiAvailable: isAiAvailable(),
    mode: isAiAvailable() ? 'ai_enabled' : 'rules_fallback',
  });
});

app.use('/api/users', usersRouter);
app.use('/api/assessment', assessmentRouter);
app.use('/api/activities', activitiesRouter);
app.use('/api/attempts', attemptsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/progress', progressRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/evaluation', evaluationsRouter);
app.use('/api/skills', skillsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`HumSaathi API running on http://localhost:${PORT}`);
  console.log(`AI mode: ${isAiAvailable() ? 'enabled' : 'rules fallback (no API key)'}`);
});
