export const DIFFICULTY_ORDER = ['beginner', 'easy', 'medium', 'hard', 'advanced'];

export const DEFAULT_SENSORY = {
  textSize: 'medium',
  soundEnabled: false,
  animationsEnabled: true,
  reducedMotion: false,
  highContrast: false,
  calmMode: true,
};

export const SKILLS = [
  'letters',
  'numbers',
  'colors',
  'shapes',
  'counting',
  'animals',
  'emotions',
  'routines',
  'vocabulary',
  'reading',
  'problem_solving',
];

export function parseJson(value, fallback = {}) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function stringifyJson(value) {
  return JSON.stringify(value);
}

export function difficultyIndex(level) {
  return DIFFICULTY_ORDER.indexOf(level);
}

export function clampDifficulty(level, delta = 0) {
  const idx = difficultyIndex(level);
  if (idx === -1) return 'easy';
  const next = Math.max(0, Math.min(DIFFICULTY_ORDER.length - 1, idx + delta));
  return DIFFICULTY_ORDER[next];
}

export function scoreBand(score) {
  if (score >= 1) return 'perfect';
  if (score >= 0.8) return 'strong';
  if (score >= 0.4) return 'moderate';
  return 'struggling';
}
