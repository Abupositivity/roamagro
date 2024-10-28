// src/pages/Settings.js
import React from 'react';
import { Box, Typography } from '@mui/material';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';

const Settings = ({ darkMode, setDarkMode }) => {
  const { t } = useTranslation();

  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        {t('Settings')}
      </Typography>
      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          {t('Mode')}
        </Typography>
        <ThemeSwitcher darkMode={darkMode} setDarkMode={setDarkMode} />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          {t('Language')}
        </Typography>
        <LanguageSwitcher />
      </Box>
    </Box>
  );
};

export default Settings;