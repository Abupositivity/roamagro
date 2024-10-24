import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      "Welcome to RoamAgro!": "Welcome to RoamAgro",
      "login": "Login",
      "logout": "Logout",
    }
  },
  ha: {
    translation: {
      "Welcome to RoamAgro": "Barka Da Zuwa RoamAgro",
      "Your Agribusiness Companion!": "Abokin Sarrafa Harkokin Noma!",
      "Login": "Shiga",
      "login": "Shiga",
      "login with Google": "shiga ta Google",
      "Login with Email": "Shiga ta Email",
      "Register New User": "Yi Sabuwar Regista",
      "Get Started": "Fara",
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
      escapeValue: true
    }
  });

export default i18n;
