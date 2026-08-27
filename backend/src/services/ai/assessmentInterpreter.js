import { callAiChat, isAiAvailable } from './aiService.js';
import { assessmentInterpretationSchema } from '../../validators/aiSchemas.js';
import { levelFromScore } from '../scoringService.js';

function fallbackInterpretation(persona, language, score, areaLevels) {
  const areas = Object.entries(areaLevels).map(([skill, level]) => ({
    skill,
    level,
    confidence: 0.7,
  }));

  const summaries = {
    en: `Based on your answers, your starting level is ${levelFromScore(score)}. We'll personalize activities for you.`,
    ur: `آپ کے جوابات کی بنیاد پر، آپ کی ابتدائی سطح ${levelFromScore(score)} ہے۔ ہم آپ کے لیے سرگرمیاں ذاتی بنائیں گے۔`,
    ur_rm: `Aap ke jawabaat ki bunyaad par, aap ki ibtidaai satah ${levelFromScore(score)} hai. Hum aap ke liye activities personalize karenge.`,
  };

  return {
    areas,
    summary: summaries[language] || summaries.en,
    recommendedDifficulty: levelFromScore(score),
    source: 'rules_fallback',
  };
}

export async function interpretAssessment({ persona, language, score, areaLevels, responses }) {
  const fallback = fallbackInterpretation(persona, language, score, areaLevels);

  if (!isAiAvailable()) return fallback;

  const prompt = `You are an educational assistant for HumSaathi AI, a learning support platform (NOT medical/diagnostic).
Given assessment results, return JSON only with: areas (array of {skill, level, confidence}), summary (max 2 sentences, supportive), recommendedDifficulty (beginner|easy|medium|hard|advanced).
Persona: ${persona}. Language: ${language}. Score: ${(score * 100).toFixed(0)}%. Area levels: ${JSON.stringify(areaLevels)}.
Do not mention autism diagnosis or medical terms.`;

  const aiResult = await callAiChat([
    { role: 'system', content: 'Return valid JSON only. No chain-of-thought.' },
    { role: 'user', content: prompt },
  ]);

  if (!aiResult) return fallback;

  const parsed = assessmentInterpretationSchema.safeParse(aiResult);
  if (!parsed.success) return fallback;

  return { ...parsed.data, source: 'ai' };
}
