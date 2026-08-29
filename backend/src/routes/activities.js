import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { parseJson } from '../utils/constants.js';
import { getActivityContent } from '../activities/registry.js';

const router = Router();

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  let activity = await prisma.activity.findUnique({ where: { id } }).catch(() => null);
  
  if (!activity) {
    // Also support finding by topic or type
    activity = await prisma.activity.findFirst({
      where: {
        OR: [
          { topic: id },
          { type: id },
        ],
        isActive: true,
      },
    });
  }

  if (!activity) return res.status(404).json({ error: 'Activity not found' });

  let content = parseJson(activity.content, null);
  if (!content?.questions?.length) {
    content = getActivityContent(activity.type, activity.difficulty, activity.language);
  }

  const safeContent = {
    questions: content.questions.map(({ id, prompt, options, visual, visualPrompt, hint, correctAnswer }) => ({
      id, prompt, options, visual, visualPrompt, hint, correctAnswer,
    })),
  };

  res.json({
    activity: {
      id: activity.id,
      type: activity.type,
      topic: activity.topic,
      title: activity.title,
      difficulty: activity.difficulty,
      language: activity.language,
      content: safeContent,
    },
  });
});

router.get('/', async (req, res) => {
  const { persona, language, type, difficulty } = req.query;
  const activities = await prisma.activity.findMany({ where: { isActive: true } });

  const filtered = activities.filter((a) => {
    if (language && a.language !== language) return false;
    if (type && a.type !== type) return false;
    if (difficulty && a.difficulty !== difficulty) return false;
    if (persona) {
      const personas = parseJson(a.personas, []);
      if (!personas.includes(persona)) return false;
    }
    return true;
  });

  res.json({
    activities: filtered.map((a) => ({
      id: a.id,
      type: a.type,
      topic: a.topic,
      title: a.title,
      difficulty: a.difficulty,
      language: a.language,
    })),
  });
});

export default router;
