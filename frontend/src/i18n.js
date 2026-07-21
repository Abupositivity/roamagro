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
      "Good Morning": "Barka da Safiya",
      "Good Afternoon": "Barka da Rana",
      "Good Evening": "Barka da Yamma",
      "Welcome back": "Barka da dawowa",
      "Northern Nigeria": "Arewacin Najeriya",
      "Weather integration coming soon": "Za a haɗa bayanan yanayi nan gaba",
      "Market updates available": "Sabbin bayanan kasuwa suna samuwa",
      "Quick Actions": "Ayyuka Masu Sauri",
      "New Farm": "Sabon Aikin Gona",
      "Sell Produce": "Sayar da Amfanin Gona",
      "Price Updates": "Sabbin Farashi",
      "Revenue": "Kudin Shiga",
      "Recent Projects":"Ayyukan Gona na Kwanan Nan",
      "Create Project":"Kirkiri Aikin Gona",
      "No farm projects yet":"Ba a ƙirƙiri aikin gona ba tukuna",
      "No marketplace listings":"Babu kayan sayarwa",
      "See All":"Duba Duka",
      "Today's Prices":"Farashin Yau",
      "No market prices available":"Babu bayanan farashi",
      "Active":"Mai Gudana",
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
