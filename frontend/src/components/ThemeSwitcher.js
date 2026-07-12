import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';

const ThemeSwitcher = ({ darkMode, setDarkMode }) => {
  const { t } = useTranslation();

  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <FormControlLabel
      control={<Switch checked={darkMode} onChange={handleToggle} />}
      label={darkMode ? t('Dark Mode') : t('Light Mode')}
    />
  );
};

export default ThemeSwitcher;