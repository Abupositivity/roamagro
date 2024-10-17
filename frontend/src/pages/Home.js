import React from 'react';
import { Container, Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Home = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <Typography variant="h3">{t('Welcome to RoamAgro')}</Typography>
      <Typography variant="h6">{t('Manage your farm projects, track prices, and more!')}</Typography>
      <Button component={Link} to="/dashboard" color="primary" variant="contained">
        {t('Get Started')}
      </Button>
    </Container>
  );
};

export default Home;
