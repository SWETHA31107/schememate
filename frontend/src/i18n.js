import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import taTranslations from './locales/ta.json';
import hiTranslations from './locales/hi.json';
import teTranslations from './locales/te.json';
import mlTranslations from './locales/ml.json';

const savedLanguage = localStorage.getItem('appLanguage') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      hi: { translation: hiTranslations },
      ta: { translation: taTranslations },
      te: { translation: teTranslations },
      ml: { translation: mlTranslations }
    },
    lng: savedLanguage, // default language
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
