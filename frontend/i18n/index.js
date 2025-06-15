import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import ar from './locales/ar/common.json';
import en from './locales/en/common.json';
import es from './locales/es/common.json';
import fr from './locales/fr/common.json';
import hi from './locales/hi/common.json';
import tl from './locales/tl/common.json';
import zh from './locales/zh/common.json';

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    resources: {
      ar: { translation: ar },
      en: { translation: en },
      es: { translation: es },
      fr: { translation: fr },
      hi: { translation: hi },
      tl: { translation: tl },
      zh: { translation: zh },
    },
  });

export default i18n;