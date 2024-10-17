import React from 'react';
import { Container, Typography, Switch, FormControlLabel } from '@material-ui/core';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeSwitcher from '../components/ThemeSwitcher';

const Settings = () => {
  return (
    <Container>
      <Typography variant="h4">Settings</Typography>
      <FormControlLabel
        control={<ThemeSwitcher />}
        label="Dark Mode"
      />
      <LanguageSwitcher />
    </Container>
  );
};

export default Settings;