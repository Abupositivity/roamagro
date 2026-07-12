import React, { useEffect, useState } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(savedLanguage);
    setCurrentLanguage(savedLanguage);
  }, [i18n]);

  const toggleLanguage = () => {
    const newLanguage = currentLanguage === 'en' ? 'ha' : 'en';
    i18n.changeLanguage(newLanguage);
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  return (
    <Button variant="contained" onClick={toggleLanguage}>
      {currentLanguage === 'en' ? 'Koma Hausa' : 'Switch to English'}
    </Button>
  );
};

export default LanguageSwitcher;