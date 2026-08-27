import { Router } from 'express';
import prisma from '../lib/prisma.js';
import { attemptSubmitSchema } from '../validators/requestSchemas.js';
import { scoreActivity } from '../services/scoringService.js';
import { updateProgressFromAttempt, parseJson, stringifyJson } from '../services/progressService.js';
import { generateFeedback } from '../services/ai/feedbackGenerator.js';
import { calculateStars, evaluateBadges } from '../services/rewardService.js';

const router = Router();

router.post('/:userId/submit', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { activityId } = req.body;
    const { answers, timeMs } = attemptSubmitSchema.parse(req.body);

    const activity = await prisma.activity.findUnique({ where: { id: activityId } });
    if (!activity) return res.status(404).json({ error: 'Activity not found' });

    const storedContent = parseJson(activity.content, {});
    const result = scoreActivity(storedContent, answers);
    const totalAttemptsUsed = answers.reduce((sum, a) => sum + (a.attemptsUsed || 1), 0);
    const starsAwarded = calculateStars(result.score, true);

    const attempt = await prisma.attempt.create({
      data: {
        userId: user.id,
        activityId: activity.id,
        answers: stringifyJson(result.graded),
        score: result.score,
        correctCount: result.correctCount,
        totalCount: result.totalCount,
        starsAwarded,
        attemptsUsed: totalAttemptsUsed,
        timeMs: timeMs || null,
        completed: true,
        difficultyAtAttempt: activity.difficulty,
        completedAt: new Date(),
      },
    });

    const adaptation = await updateProgressFromAttempt(user.id, activity, result);
    const rewardResult = await evaluateBadges(user.id);

    const feedback = await generateFeedback({
      persona: user.persona,
      language: user.language,
      score: result.score,
      correctCount: result.correctCount,
      totalCount: result.totalCount,
      topic: activity.topic,
      shouldRetry: adaptation.shouldRetry,
    });

    res.json({
      attempt: {
        id: attempt.id,
        score: attempt.score,
        correctCount: attempt.correctCount,
        totalCount: attempt.totalCount,
        starsAwarded: attempt.starsAwarded,
        totalStars: rewardResult.totalStars,
        newlyUnlockedBadges: rewardResult.newlyUnlockedBadges,
        adaptation,
      },
      feedback,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/:userId/recent', async (req, res) => {
  const attempts = await prisma.attempt.findMany({
    where: { userId: req.params.userId, completed: true },
    include: { activity: true },
    orderBy: { completedAt: 'desc' },
    take: 10,
  });

  res.json({
    attempts: attempts.map((a) => ({
      id: a.id,
      score: a.score,
      correctCount: a.correctCount,
      totalCount: a.totalCount,
      completedAt: a.completedAt,
      activity: {
        id: a.activity.id,
        title: a.activity.title,
        type: a.activity.type,
        topic: a.activity.topic,
        difficulty: a.activity.difficulty,
      },
    })),
  });
});

export default router;
