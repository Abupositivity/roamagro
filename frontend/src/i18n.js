import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "welcome": "Welcome to RoamAgro",
      "login": "Login",
      "logout": "Logout",
    }
  },
  ha: {
    translation: {
      "welcome": "Barka da zuwa RoamAgro",
      "login": "Shiga",
      "logout": "Fita",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
