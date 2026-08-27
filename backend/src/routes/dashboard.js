import { Router } from 'express';
import { getDashboardStats, getUserProgress } from '../services/progressService.js';
import { recommendActivity } from '../services/ai/activityRecommender.js';
import { getUserRewards } from '../services/rewardService.js';
import prisma from '../lib/prisma.js';
import { parentPinSchema } from '../validators/requestSchemas.js';

const router = Router();

router.get('/:userId', async (req, res) => {
  const stats = await getDashboardStats(req.params.userId);
  if (!stats.user) return res.status(404).json({ error: 'User not found' });
  const rewards = await getUserRewards(req.params.userId);
  res.json({ dashboard: formatDashboard(stats, rewards) });
});

router.get('/:userId/progress', async (req, res) => {
  const progress = await getUserProgress(req.params.userId);
  const rewards = await getUserRewards(req.params.userId);
  res.json({ progress, rewards });
});

router.post('/:userId/recommend', async (req, res) => {
  try {
    const recommendation = await recommendActivity(req.params.userId);
    res.json({ recommendation });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/:userId/parent', async (req, res) => {
  try {
    const { pin } = parentPinSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.parentPin !== pin) return res.status(403).json({ error: 'Invalid PIN' });

    const stats = await getDashboardStats(user.id);
    res.json({ parentView: formatParentView(stats) });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

function formatDashboard(stats, rewards = null) {
  return {
    name: stats.user.name,
    persona: stats.user.persona,
    language: stats.user.language,
    currentLevel: stats.currentLevel,
    completedCount: stats.completedCount,
    avgAccuracy: Math.round(stats.avgAccuracy * 100),
    strongest: stats.strongest ? { skill: stats.strongest.skill, accuracy: Math.round(stats.strongest.accuracy * 100) } : null,
    needsPractice: stats.weakest ? { skill: stats.weakest.skill, accuracy: Math.round(stats.weakest.accuracy * 100) } : null,
    rewards: rewards || { totalStars: 0, earnedCount: 0, badges: [] },
    progress: stats.progress.map((p) => ({
      skill: p.skill,
      level: p.level,
      accuracy: Math.round(p.accuracy * 100),
      attempts: p.attempts,
    })),
    recentAttempts: stats.attempts.map((a) => ({
      id: a.id,
      score: Math.round(a.score * 100),
      starsAwarded: a.starsAwarded,
      title: a.activity.title,
      topic: a.activity.topic,
      difficulty: a.difficultyAtAttempt,
      completedAt: a.completedAt,
    })),
    assessmentSummary: stats.latestAssessment
      ? {
          score: Math.round(stats.latestAssessment.score * 100),
          level: stats.latestAssessment.estimatedLevel,
        }
      : null,
  };
}

function formatParentView(stats) {
  return {
    learner: {
      name: stats.user.name,
      persona: stats.user.persona,
      language: stats.user.language,
    },
    currentLevel: stats.currentLevel,
    completedCount: stats.completedCount,
    avgAccuracy: Math.round(stats.avgAccuracy * 100),
    strengths: stats.strongest ? [stats.strongest.skill] : [],
    needsPractice: stats.weakest ? [stats.weakest.skill] : [],
    progress: stats.progress.map((p) => ({
      skill: p.skill,
      level: p.level,
      accuracy: Math.round(p.accuracy * 100),
    })),
    recentAttempts: stats.attempts.map((a) => ({
      title: a.activity.title,
      score: Math.round(a.score * 100),
      completedAt: a.completedAt,
    })),
  };
}

export default router;
