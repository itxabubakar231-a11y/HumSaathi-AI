import prisma from '../lib/prisma.js';
import { adaptDifficulty, levelFromScore } from './scoringService.js';
import { parseJson, stringifyJson } from '../utils/constants.js';

export async function upsertProgressFromAssessment(userId, areaLevels) {
  const entries = Object.entries(areaLevels);
  for (const [skill, level] of entries) {
    await prisma.progress.upsert({
      where: { userId_skill: { userId, skill } },
      create: { userId, skill, level, accuracy: 0, attempts: 0 },
      update: { level },
    });
  }
}

export async function updateProgressFromAttempt(userId, activity, attemptResult) {
  const skill = activity.topic;
  const existing = await prisma.progress.findUnique({
    where: { userId_skill: { userId, skill } },
  });

  const currentLevel = existing?.level || activity.difficulty;
  const adaptation = adaptDifficulty(currentLevel, attemptResult.score, attemptResult.totalCount);

  const prevAttempts = existing?.attempts || 0;
  const prevAccuracy = existing?.accuracy || 0;
  const newAttempts = prevAttempts + 1;
  const newAccuracy = ((prevAccuracy * prevAttempts) + attemptResult.score) / newAttempts;

  await prisma.progress.upsert({
    where: { userId_skill: { userId, skill } },
    create: {
      userId,
      skill,
      level: adaptation.level,
      accuracy: newAccuracy,
      attempts: 1,
    },
    update: {
      level: adaptation.level,
      accuracy: newAccuracy,
      attempts: newAttempts,
    },
  });

  return adaptation;
}

export async function getUserProgress(userId) {
  return prisma.progress.findMany({
    where: { userId },
    orderBy: { skill: 'asc' },
  });
}

export async function getDashboardStats(userId) {
  const [user, progress, attempts, latestAssessment] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.progress.findMany({ where: { userId } }),
    prisma.attempt.findMany({
      where: { userId, completed: true },
      include: { activity: true },
      orderBy: { completedAt: 'desc' },
    }),
    prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const completedCount = attempts.length;
  const avgAccuracy = completedCount
    ? attempts.reduce((sum, a) => sum + a.score, 0) / completedCount
    : 0;

  const sortedByAccuracy = [...progress].sort((a, b) => b.accuracy - a.accuracy);
  const strongest = sortedByAccuracy[0] || null;
  const weakest = [...progress].sort((a, b) => a.accuracy - b.accuracy)[0] || null;

  const currentLevel = latestAssessment?.estimatedLevel
    || progress[0]?.level
    || 'beginner';

  return {
    user,
    progress,
    attempts: attempts.slice(0, 5),
    completedCount,
    avgAccuracy,
    strongest,
    weakest,
    currentLevel,
    latestAssessment,
  };
}

export function buildAreaLevelsFromQuestions(questions, gradedResponses, score) {
  const areas = {};
  for (const question of questions) {
    const response = gradedResponses.find((r) => r.questionId === question.id);
    const area = question.area || question.skill || 'general';
    if (!areas[area]) {
      areas[area] = { correct: 0, total: 0 };
    }
    areas[area].total += 1;
    if (response?.correct) areas[area].correct += 1;
  }

  const areaLevels = {};
  for (const [area, stats] of Object.entries(areas)) {
    const areaScore = stats.total ? stats.correct / stats.total : score;
    areaLevels[area] = levelFromScore(areaScore);
  }
  return areaLevels;
}

export { stringifyJson, parseJson };
