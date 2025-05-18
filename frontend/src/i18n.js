import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationRU from './locales/ru/translation.json';

i18n
  .use(initReactI18next)
  .init({
    lng: 'ru', 
    fallbackLng: 'ru',
    resources: {
      ru: {
        translation: translationRU,
      },
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
