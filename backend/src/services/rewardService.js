import prisma from '../lib/prisma.js';

export const BADGE_DEFINITIONS = [
  {
    code: 'first_adventure',
    icon: '🌱',
    titleKey: 'badge.first_adventure.title',
    descKey: 'badge.first_adventure.desc',
  },
  {
    code: 'star_gatherer',
    icon: '⭐',
    titleKey: 'badge.star_gatherer.title',
    descKey: 'badge.star_gatherer.desc',
  },
  {
    code: 'super_star',
    icon: '🌟',
    titleKey: 'badge.super_star.title',
    descKey: 'badge.super_star.desc',
  },
  {
    code: 'letters_explorer',
    icon: '🔤',
    titleKey: 'badge.letters_explorer.title',
    descKey: 'badge.letters_explorer.desc',
  },
  {
    code: 'numbers_explorer',
    icon: '🔢',
    titleKey: 'badge.numbers_explorer.title',
    descKey: 'badge.numbers_explorer.desc',
  },
  {
    code: 'shapes_explorer',
    icon: '🎨',
    titleKey: 'badge.shapes_explorer.title',
    descKey: 'badge.shapes_explorer.desc',
  },
  {
    code: 'counting_explorer',
    icon: '🍎',
    titleKey: 'badge.counting_explorer.title',
    descKey: 'badge.counting_explorer.desc',
  },
  {
    code: 'animals_explorer',
    icon: '🐾',
    titleKey: 'badge.animals_explorer.title',
    descKey: 'badge.animals_explorer.desc',
  },
  {
    code: 'emotions_explorer',
    icon: '💛',
    titleKey: 'badge.emotions_explorer.title',
    descKey: 'badge.emotions_explorer.desc',
  },
  {
    code: 'routines_explorer',
    icon: '⏰',
    titleKey: 'badge.routines_explorer.title',
    descKey: 'badge.routines_explorer.desc',
  },
  {
    code: 'all_rounder',
    icon: '🌈',
    titleKey: 'badge.all_rounder.title',
    descKey: 'badge.all_rounder.desc',
  },
];

export function calculateStars(score, completed = true) {
  if (!completed) return 0;
  if (score >= 0.9) return 3;
  if (score >= 0.5) return 2;
  return 1; // 1 star encouraging reward for finishing with effort
}

export async function evaluateBadges(userId) {
  const attempts = await prisma.attempt.findMany({
    where: { userId, completed: true },
    include: { activity: true },
  });

  const existingBadges = await prisma.badge.findMany({
    where: { userId },
  });
  const existingCodes = new Set(existingBadges.map((b) => b.code));

  const totalCompleted = attempts.length;
  const totalStars = attempts.reduce((sum, a) => sum + (a.starsAwarded || 0), 0);
  const topicsCompleted = new Set(attempts.map((a) => a.activity.topic));

  const eligibleCodes = [];

  if (totalCompleted >= 1) eligibleCodes.push('first_adventure');
  if (totalStars >= 5) eligibleCodes.push('star_gatherer');
  if (totalStars >= 15) eligibleCodes.push('super_star');
  if (topicsCompleted.has('letters')) eligibleCodes.push('letters_explorer');
  if (topicsCompleted.has('numbers')) eligibleCodes.push('numbers_explorer');
  if (topicsCompleted.has('colors') || topicsCompleted.has('shapes')) eligibleCodes.push('shapes_explorer');
  if (topicsCompleted.has('counting')) eligibleCodes.push('counting_explorer');
  if (topicsCompleted.has('animals')) eligibleCodes.push('animals_explorer');
  if (topicsCompleted.has('emotions')) eligibleCodes.push('emotions_explorer');
  if (topicsCompleted.has('routines')) eligibleCodes.push('routines_explorer');
  if (topicsCompleted.size >= 4) eligibleCodes.push('all_rounder');

  const newlyUnlockedBadges = [];

  for (const code of eligibleCodes) {
    if (!existingCodes.has(code)) {
      try {
        const badge = await prisma.badge.upsert({
          where: { userId_code: { userId, code } },
          create: { userId, code },
          update: {},
        });
        const def = BADGE_DEFINITIONS.find((b) => b.code === code);
        if (def) {
          newlyUnlockedBadges.push({
            id: badge.id,
            code: def.code,
            icon: def.icon,
            titleKey: def.titleKey,
            descKey: def.descKey,
            unlockedAt: badge.unlockedAt,
          });
        }
      } catch {
        // Idempotent safeguard: ignore constraint collisions
      }
    }
  }

  return {
    totalStars,
    newlyUnlockedBadges,
  };
}

export async function getUserRewards(userId) {
  const attempts = await prisma.attempt.findMany({
    where: { userId, completed: true },
  });
  const totalStars = attempts.reduce((sum, a) => sum + (a.starsAwarded || 0), 0);

  const earnedBadges = await prisma.badge.findMany({
    where: { userId },
    orderBy: { unlockedAt: 'asc' },
  });
  const earnedMap = new Map(earnedBadges.map((b) => [b.code, b.unlockedAt]));

  const allBadges = BADGE_DEFINITIONS.map((def) => ({
    code: def.code,
    icon: def.icon,
    titleKey: def.titleKey,
    descKey: def.descKey,
    isUnlocked: earnedMap.has(def.code),
    unlockedAt: earnedMap.get(def.code) || null,
  }));

  // Find next milestone
  let nextMilestone = null;
  if (totalStars < 5) {
    nextMilestone = { current: totalStars, target: 5, labelKey: 'badge.star_gatherer.title', icon: '⭐' };
  } else if (totalStars < 15) {
    nextMilestone = { current: totalStars, target: 15, labelKey: 'badge.super_star.title', icon: '🌟' };
  } else {
    const remaining = allBadges.filter((b) => !b.isUnlocked);
    if (remaining.length > 0) {
      nextMilestone = { current: allBadges.length - remaining.length, target: allBadges.length, labelKey: remaining[0].titleKey, icon: remaining[0].icon };
    }
  }

  return {
    totalStars,
    earnedCount: earnedBadges.length,
    totalBadgesCount: BADGE_DEFINITIONS.length,
    badges: allBadges,
    nextMilestone,
  };
}
