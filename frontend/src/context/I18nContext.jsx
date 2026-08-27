import { createContext, useContext, useMemo } from 'react';
import translations from '../data/translations.json';

const I18nContext = createContext(null);

export function I18nProvider({ language, children }) {
  const lang = translations[language] ? language : 'en';

  const value = useMemo(() => ({
    language: lang,
    t: (key) => translations[lang][key] || translations.en[key] || key,
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
