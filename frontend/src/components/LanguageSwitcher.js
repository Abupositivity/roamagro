import React, { useEffect } from 'react';
import { Button } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang); // Persist language
  };

  return (
    <div>
      <Button onClick={() => changeLanguage('en')}>English</Button>
      <Button onClick={() => changeLanguage('ha')}>Hausa</Button>
    </div>
  );
};

export default LanguageSwitcher;