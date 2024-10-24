import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';

const ThemeSwitcher = ({ darkMode, setDarkMode }) => {
  const handleToggle = () => {
    setDarkMode(!darkMode);
  };

  return (
    <FormControlLabel
      control={<Switch checked={darkMode} onChange={handleToggle} />}
      label={darkMode ? 'Dark Mode' : 'Light Mode'}
    />
  );
};

export default ThemeSwitcher;