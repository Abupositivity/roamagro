import React from 'react';
import { Box, Typography } from '@mui/material';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Settings = ({ darkMode, setDarkMode }) => {
  return (
    <Box sx={{ padding: '20px' }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="h6" gutterBottom>
          Dark Mode
        </Typography>
        <ThemeSwitcher darkMode={darkMode} setDarkMode={setDarkMode} />
      </Box>
      <Box>
        <Typography variant="h6" gutterBottom>
          Language
        </Typography>
        <LanguageSwitcher />
      </Box>
    </Box>
  );
};

export default Settings;