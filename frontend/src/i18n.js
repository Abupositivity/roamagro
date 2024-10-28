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
      "Mode": "Yanayi",
      "Email Address": "Adreshin Email",
      "Password": "Sirri",
      "SIGN IN": "SHIGA",
      "Light Mode": "Yanayin Haske",
      "Dark Mode": "Yanayin Duhu",
      "Home": "Gida",
      "Farm Projects": "Ayyukan Gona",
      "Marketplace": "Kasuwa",
      "Price Index": "Farashin Kaya",
      "Community": "Dandali",
      "Logout": "Fita",
      "Agri-Feed": "Shawarwarin Noma",
      "Post": "Aika",
      "Create New Post": "Kirkira Sabon Sako",
      "Profile": "Bayani na",
      "Share tips or insights on agribusiness...": "Bada shawarwari akan harkan gona...",
      "Create New Project": "Kirkira Sabon Aikin Noma",
      "Project Name": "Sunan Aiki",
      "Description": " Bayanin Aiki",
      "Start Date": "Ranar Farawa",
      "End Date": "Ranar Gamawa",
      "Budget": "Kasafin Kudi",
      "CREATE PROJECT": "KIRKIRA AIKI",
      "EDIT": "GYARA",
      "Create New Listing": "Kirkira Sabon Kayan Siyarwa",
      "Title": "Take",
      "Category": "Bangare",
      "Price": "Farashi",
      "Location": "Wuri",
      "Create Listing": "Kirkira",
      "Update Price": "Sabunta Farashi",
      "Product": "Kayan Masarufi",
      "UPDATE PRICE": "SABUNTA FARASHI",
      "Local Price Index": "Farashin Gida na Kaya",
      "Community Interaction": "Tataunawa A Dandali",
      "Topic Title": "Taken Tataunawa",
      "Content": "Tataunawa",
      "Create Topic": "Kirkira Tataunawa",
      "Settings": "Saituna",
      "Language": "Yare",
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
