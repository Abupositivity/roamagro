import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@material-ui/core';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div>
      <Button onClick={() => changeLanguage('en')}>English</Button>
      <Button onClick={() => changeLanguage('ha')}>Hausa</Button>
    </div>
  );
};

export default LanguageSwitcher;
