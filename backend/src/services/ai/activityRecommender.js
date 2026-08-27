import { callAiChat, isAiAvailable } from './aiService.js';
import { activityRecommendationSchema } from '../../validators/aiSchemas.js';
import { recommendActivityRuleBased, clampRecommendation, findMatchingActivity } from '../recommendationService.js';
import prisma from '../../lib/prisma.js';
import { parseJson, stringifyJson } from '../../utils/constants.js';

export async function recommendActivity(userId) {
  const ruleBased = await recommendActivityRuleBased(userId);

  if (!isAiAvailable()) {
    return { ...ruleBased, source: 'rules_fallback' };
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const progress = await prisma.progress.findMany({ where: { userId } });
  const latestAssessment = await prisma.assessment.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  const recentAttempts = await prisma.attempt.findMany({
    where: { userId, completed: true },
    orderBy: { completedAt: 'desc' },
    take: 3,
    include: { activity: true },
  });

  const prompt = `Recommend next learning activity for HumSaathi AI (educational only, not medical).
Return JSON: { activityType: letter|number|shape_color_match, topic, difficulty, questionCount (3-10), shouldRetry, reason }.
Persona: ${user.persona}. Language: ${user.language}.
Progress: ${JSON.stringify(progress)}.
Assessment level: ${latestAssessment?.estimatedLevel || 'unknown'}.
Recent attempts: ${JSON.stringify(recentAttempts.map((a) => ({ score: a.score, topic: a.activity.topic, difficulty: a.difficultyAtAttempt })))}.
Keep reason under 2 sentences, supportive and non-judgmental.`;

  const aiResult = await callAiChat([
    { role: 'system', content: 'Return valid JSON only.' },
    { role: 'user', content: prompt },
  ]);

  if (!aiResult) {
    return { ...ruleBased, source: 'rules_fallback' };
  }

  const parsed = activityRecommendationSchema.safeParse(aiResult);
  if (!parsed.success) {
    return { ...ruleBased, source: 'rules_fallback' };
  }

  const clamped = clampRecommendation(parsed.data, progress);
  const activity = await findMatchingActivity({
    persona: user.persona,
    language: user.language,
    activityType: clamped.activityType,
    topic: clamped.topic,
    difficulty: clamped.difficulty,
  });

  const result = { ...clamped, activityId: activity?.id, source: 'ai' };

  await prisma.aiRecommendation.create({
    data: {
      userId,
      kind: 'activity',
      input: stringifyJson({ progress, latestAssessmentId: latestAssessment?.id }),
      output: stringifyJson(result),
      source: result.source,
    },
  });

  return result;
}
