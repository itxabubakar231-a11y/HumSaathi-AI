import { z } from 'zod';

export const personaSchema = z.enum(['child', 'teen', 'adult']);
export const languageSchema = z.enum(['en', 'ur', 'ur_rm']);
export const difficultySchema = z.enum(['beginner', 'easy', 'medium', 'hard', 'advanced']);
export const activityTypeSchema = z.enum([
  'letter',
  'number',
  'shape_color_match',
  'counting',
  'animal_matching',
  'emotion_learning',
  'routine_sequencing',
]);

export const sensoryPrefsSchema = z.object({
  textSize: z.enum(['small', 'medium', 'large', 'xlarge']).default('medium'),
  soundEnabled: z.boolean().default(false),
  animationsEnabled: z.boolean().default(true),
  reducedMotion: z.boolean().default(false),
  highContrast: z.boolean().default(false),
  calmMode: z.boolean().default(true),
});

export const setupSchema = z.object({
  name: z.string().min(1).max(80),
  persona: personaSchema,
  language: languageSchema,
  sensoryPrefs: sensoryPrefsSchema.optional(),
});

export const assessmentSubmitSchema = z.object({
  responses: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number()]),
    timeMs: z.number().optional(),
  })).min(1),
});

export const attemptSubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string(),
    answer: z.union([z.string(), z.number()]),
    correct: z.boolean(),
    attemptsUsed: z.number().int().min(1).default(1),
  })).min(1),
  timeMs: z.number().optional(),
});

export const feedbackRequestSchema = z.object({
  attemptId: z.string(),
});

export const recommendRequestSchema = z.object({
  afterAttemptId: z.string().optional(),
});

export const parentPinSchema = z.object({
  pin: z.string().min(4).max(8),
});

export const startConversationSchema = z.object({
  userId: z.string(),
  scenarioId: z.string(),
  mode: z.enum(['text', 'voice']),
});

export const sendMessageSchema = z.object({
  userId: z.string(),
  message: z.string().min(1),
});

