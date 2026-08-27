import { z } from 'zod';
import { activityTypeSchema, difficultySchema } from './requestSchemas.js';

export const assessmentInterpretationSchema = z.object({
  areas: z.array(z.object({
    skill: z.string(),
    level: difficultySchema,
    confidence: z.number().min(0).max(1),
  })),
  summary: z.string().max(500),
  recommendedDifficulty: difficultySchema,
});

export const activityRecommendationSchema = z.object({
  activityType: activityTypeSchema,
  topic: z.string(),
  difficulty: difficultySchema,
  questionCount: z.number().int().min(1).max(10),
  shouldRetry: z.boolean(),
  reason: z.string().max(300),
  activityId: z.string().optional(),
});

export const feedbackSchema = z.object({
  message: z.string().max(400),
  encouragement: z.string().max(200),
  nextStepHint: z.string().max(200),
});
