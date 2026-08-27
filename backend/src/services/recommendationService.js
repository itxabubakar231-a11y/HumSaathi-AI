import prisma from '../lib/prisma.js';
import { parseJson } from '../utils/constants.js';
import { clampDifficulty } from '../utils/constants.js';

const TYPE_PRIORITY = {
  letters: 'letter',
  numbers: 'number',
  colors: 'shape_color_match',
  shapes: 'shape_color_match',
  counting: 'counting',
  animals: 'animal_matching',
  emotions: 'emotion_learning',
  routines: 'routine_sequencing',
  vocabulary: 'letter',
  reading: 'number',
  problem_solving: 'number',
};

export async function findMatchingActivity({ persona, language, activityType, topic, difficulty }) {
  const activities = await prisma.activity.findMany({
    where: {
      isActive: true,
      type: activityType,
      language,
      difficulty,
    },
  });

  const filtered = activities.filter((a) => {
    const personas = parseJson(a.personas, []);
    return personas.includes(persona);
  });

  if (topic) {
    const byTopic = filtered.filter((a) => a.topic === topic);
    if (byTopic.length) return byTopic[0];
  }

  return filtered[0] || activities[0] || null;
}

export async function recommendActivityRuleBased(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.persona) throw new Error('User setup incomplete');

  const progress = await prisma.progress.findMany({ where: { userId } });
  const latestAttempt = await prisma.attempt.findFirst({
    where: { userId, completed: true },
    orderBy: { completedAt: 'desc' },
    include: { activity: true },
  });

  let targetSkill = 'letters';
  let difficulty = 'easy';
  let shouldRetry = false;

  if (latestAttempt) {
    const score = latestAttempt.score;
    const total = latestAttempt.totalCount;
    const correct = Math.round(score * total);
    const lastTopic = latestAttempt.activity.topic;

    if (correct <= 1) {
      // Struggling: retry the same skill with simpler difficulty
      shouldRetry = true;
      difficulty = clampDifficulty(latestAttempt.difficultyAtAttempt, -1);
      targetSkill = lastTopic;
    } else {
      // Succeeded: find other skills needing practice or rotate to next skill
      shouldRetry = false;
      const nextDiff = correct >= total
        ? clampDifficulty(latestAttempt.difficultyAtAttempt, 1)
        : latestAttempt.difficultyAtAttempt;

      if (progress.length > 1) {
        const otherSkills = progress.filter((p) => p.skill !== lastTopic);
        const nextProg = otherSkills.sort((a, b) => (a.attempts - b.attempts) || (a.accuracy - b.accuracy))[0];
        if (nextProg) {
          targetSkill = nextProg.skill;
          difficulty = nextProg.level || nextDiff;
        } else {
          targetSkill = lastTopic;
          difficulty = nextDiff;
        }
      } else {
        const skillCycle = user.persona === 'child'
          ? ['letters', 'numbers', 'colors', 'shapes', 'counting', 'animals', 'emotions', 'routines']
          : ['vocabulary', 'reading', 'problem_solving'];
        const currentIdx = skillCycle.indexOf(lastTopic);
        const nextIdx = currentIdx >= 0 ? (currentIdx + 1) % skillCycle.length : 0;
        targetSkill = skillCycle[nextIdx];
        difficulty = nextDiff;
      }
    }
  } else if (progress.length) {
    const weakest = [...progress].sort((a, b) => (a.accuracy - b.accuracy) || (a.attempts - b.attempts))[0];
    targetSkill = weakest.skill;
    difficulty = weakest.level;
  } else {
    const assessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    if (assessment) {
      difficulty = assessment.estimatedLevel;
      const areas = parseJson(assessment.areaLevels, {});
      const entries = Object.entries(areas);
      if (entries.length) {
        targetSkill = entries.sort((a, b) => {
          const order = ['beginner', 'easy', 'medium', 'hard', 'advanced'];
          return order.indexOf(a[1]) - order.indexOf(b[1]);
        })[0][0];
      }
    }
  }

  const activityType = TYPE_PRIORITY[targetSkill] || 'letter';
  const activity = await findMatchingActivity({
    persona: user.persona,
    language: user.language,
    activityType,
    topic: targetSkill,
    difficulty,
  });

  const REASONS = {
    retry: {
      en: 'Let us practice this skill again with a simpler activity.',
      ur: 'آئیے اس مہارت کی ایک آسان سرگرمی کے ساتھ دوبارہ مشق کریں۔',
      ur_rm: 'Aaiye is maharat ki aik aasaan activity ke sath dobara mashq karein.',
    },
    next: {
      en: 'Based on your progress, here is a good next step.',
      ur: 'آپ کی پیش رفت کی بنیاد پر، یہ اگلا اچھا قدم ہے۔',
      ur_rm: 'Aap ki taraqqi ki bunyaad par, yeh agla acha step hai.',
    },
  };

  const userLang = user.language || 'en';
  const reasonText = shouldRetry
    ? (REASONS.retry[userLang] || REASONS.retry.en)
    : (REASONS.next[userLang] || REASONS.next.en);

  return {
    activityType,
    topic: targetSkill,
    difficulty,
    questionCount: 5,
    shouldRetry,
    reason: reasonText,
    activityId: activity?.id,
    source: 'rules_fallback',
  };
}

export function clampRecommendation(raw, userProgress = []) {
  const allowedTypes = [
    'letter',
    'number',
    'shape_color_match',
    'counting',
    'animal_matching',
    'emotion_learning',
    'routine_sequencing',
  ];
  const activityType = allowedTypes.includes(raw.activityType) ? raw.activityType : 'letter';
  const difficulty = ['beginner', 'easy', 'medium', 'hard', 'advanced'].includes(raw.difficulty)
    ? raw.difficulty
    : 'easy';
  const questionCount = Math.min(10, Math.max(3, raw.questionCount || 5));

  return {
    activityType,
    topic: raw.topic || 'letters',
    difficulty,
    questionCount,
    shouldRetry: Boolean(raw.shouldRetry),
    reason: (raw.reason || 'Recommended for your learning level.').slice(0, 300),
    activityId: raw.activityId,
  };
}
