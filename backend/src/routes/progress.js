import { Router } from 'express';
import { getDashboardStats } from '../services/progressService.js';

const router = Router();

router.get('/:userId', async (req, res) => {
  try {
    const stats = await getDashboardStats(req.params.userId);
    if (!stats.user) return res.status(404).json({ error: 'User not found' });
    
    res.json({
      skills: stats.progress.map(p => p.skill),
      levels: stats.progress.reduce((acc, p) => ({ ...acc, [p.skill]: p.level }), {}),
      accuracy: stats.progress.reduce((acc, p) => ({ ...acc, [p.skill]: p.accuracy }), {}),
      attempts: stats.progress.reduce((acc, p) => ({ ...acc, [p.skill]: p.attempts }), {}),
      recentActivity: stats.attempts.map((a) => ({
        id: a.id,
        score: Math.round(a.score * 100),
        title: a.activity.title,
        topic: a.activity.topic,
        difficulty: a.difficultyAtAttempt,
        completedAt: a.completedAt,
      })),
      needsPractice: stats.weakest ? { skill: stats.weakest.skill, accuracy: stats.weakest.accuracy } : null
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
