export const DEFAULT_SENSORY = {
  textSize: 'medium',
  soundEnabled: false,
  animationsEnabled: true,
  reducedMotion: false,
  highContrast: false,
  calmMode: true,
};

export const PERSONAS = [
  { id: 'child', labelKey: 'persona.child', detailKey: 'persona.childDetail' },
  { id: 'teen', labelKey: 'persona.teen', detailKey: 'persona.teenDetail' },
  { id: 'adult', labelKey: 'persona.adult', detailKey: 'persona.adultDetail' },
];

export const LANGUAGES = [
  { id: 'en', labelKey: 'lang.en', dir: 'ltr' },
  { id: 'ur', labelKey: 'lang.ur', dir: 'rtl' },
  { id: 'ur_rm', labelKey: 'lang.urRm', dir: 'ltr' },
];

export function getLanguageDir(languageId) {
  return LANGUAGES.find((l) => l.id === languageId)?.dir || 'ltr';
}

export function applySensoryToDocument(prefs) {
  const root = document.documentElement;
  root.dataset.textSize = prefs.textSize;
  root.dataset.highContrast = prefs.highContrast ? 'true' : 'false';
  root.dataset.calmMode = prefs.calmMode ? 'true' : 'false';
  root.dataset.animations = prefs.animationsEnabled && !prefs.reducedMotion ? 'on' : 'off';
  root.dataset.reducedMotion = prefs.reducedMotion ? 'true' : 'false';
}

export function applyLanguageToDocument(languageId) {
  document.documentElement.lang = languageId === 'ur_rm' ? 'ur' : languageId;
  document.documentElement.dir = getLanguageDir(languageId);
}
