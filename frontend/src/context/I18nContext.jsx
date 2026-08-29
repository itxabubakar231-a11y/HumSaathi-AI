import { createContext, useContext, useMemo } from 'react';
import translations from '../data/translations.json';

const I18nContext = createContext(null);

export function I18nProvider({ language, children }) {
  const lang = translations[language] ? language : 'en';

  const value = useMemo(() => ({
    language: lang,
    t: (key, paramsOrFallback = null) => {
      let val = translations[lang]?.[key] ?? translations.en?.[key];
      if (val === undefined || val === null) {
        if (typeof paramsOrFallback === 'string') return paramsOrFallback;
        return key;
      }
      if (paramsOrFallback && typeof paramsOrFallback === 'object') {
        let text = String(val);
        for (const [k, v] of Object.entries(paramsOrFallback)) {
          text = text.replaceAll(`{${k}}`, String(v));
        }
        return text;
      }
      return val;
    },
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}
