import { callAiChat, isAiAvailable } from './aiService.js';
import { feedbackSchema } from '../../validators/aiSchemas.js';
import { scoreBand } from '../scoringService.js';

const FALLBACK_FEEDBACK = {
  perfect: {
    en: { message: 'Great work! You got everything right.', encouragement: 'You are doing wonderfully.', nextStepHint: 'Let us try a slightly harder activity.' },
    ur: { message: 'بہترین! آپ نے سب درست کیا۔', encouragement: 'آپ بہت اچھا کر رہے ہیں۔', nextStepHint: 'آئیے تھوڑی مشکل سرگرمی آزمائیں۔' },
    ur_rm: { message: 'Behtareen! Aap ne sab durust kiya.', encouragement: 'Aap bohot acha kar rahe hain.', nextStepHint: 'Aaiye thori mushkil activity azmayen.' },
  },
  strong: {
    en: { message: 'Great work! You identified most answers correctly.', encouragement: 'Keep going at your own pace.', nextStepHint: 'Let us try a slightly more challenging activity.' },
    ur: { message: 'بہت اچھا! آپ نے زیادہ تر جوابات درست دیے۔', encouragement: 'اپنی رفتار سے آگے بڑھیں۔', nextStepHint: 'آئیے تھوڑی مشکل سرگرمی آزمائیں۔' },
    ur_rm: { message: 'Bohot acha! Aap ne zyada tar jawabaat durust diye.', encouragement: 'Apni raftaar se aage barhein.', nextStepHint: 'Aaiye thori mushkil activity azmayen.' },
  },
  moderate: {
    en: { message: 'Good effort! Some answers were tricky.', encouragement: 'That is okay — learning takes practice.', nextStepHint: 'Let us practice this skill a bit more.' },
    ur: { message: 'اچھی کوشش! کچھ جوابات مشکل تھے۔', encouragement: 'یہ ٹھیک ہے — سیکھنے میں مشق چاہیے۔', nextStepHint: 'آئیے اس مہارت کی مزید مشق کریں۔' },
    ur_rm: { message: 'Achi koshish! Kuch jawabaat mushkil thay.', encouragement: 'Yeh theek hai — seekhne mein mashq chahiye.', nextStepHint: 'Aaiye is maharat ki mazeed mashq karein.' },
  },
  struggling: {
    en: { message: 'That is okay. Let us practice this skill with a simpler activity.', encouragement: 'Every step counts.', nextStepHint: 'We will try again together at an easier level.' },
    ur: { message: 'یہ ٹھیک ہے۔ آئیے اس مہارت کی آسان سرگرمی سے مشق کریں۔', encouragement: 'ہر قدم اہم ہے۔', nextStepHint: 'ہم آسان سطح پر دوبارہ کوشش کریں گے۔' },
    ur_rm: { message: 'Yeh theek hai. Aaiye is maharat ki aasaan activity se mashq karein.', encouragement: 'Har qadam ahem hai.', nextStepHint: 'Hum aasaan satah par dobara koshish karenge.' },
  },
};

function fallbackFeedback(persona, language, score, shouldRetry) {
  const band = scoreBand(score);
  const templates = FALLBACK_FEEDBACK[band][language] || FALLBACK_FEEDBACK[band].en;
  return {
    ...templates,
    shouldRetry,
    source: 'rules_fallback',
  };
}

export async function generateFeedback({ persona, language, score, correctCount, totalCount, topic, shouldRetry }) {
  const fallback = fallbackFeedback(persona, language, score, shouldRetry);

  if (!isAiAvailable()) return fallback;

  const prompt = `Generate supportive learning feedback for HumSaathi AI (NOT medical).
Return JSON: { message, encouragement, nextStepHint } — each max 2 short sentences, age-appropriate for ${persona}, language tone: ${language}.
Score: ${correctCount}/${totalCount} on ${topic}. Should retry: ${shouldRetry}.
Be positive, clear, non-judgmental. No diagnosis language.`;

  const aiResult = await callAiChat([
    { role: 'system', content: 'Return valid JSON only.' },
    { role: 'user', content: prompt },
  ]);

  if (!aiResult) return fallback;

  const parsed = feedbackSchema.safeParse(aiResult);
  if (!parsed.success) return fallback;

  return { ...parsed.data, shouldRetry, source: 'ai' };
}
