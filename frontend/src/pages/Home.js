import React from 'react';
import { Container, Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Home.css';
import logo from '../assets/images/logo.svg';

const Home = () => {
  const { t } = useTranslation();

  return (
    <Container className="home-container" maxWidth="sm" sx={{ textAlign: 'center', mt: 4 }}>
      {/* Logo Display */}
      <Box sx={{ mb: 4 }}>
        <img src={logo} alt="RoamAgro Logo" className="home-logo" />
      </Box>

      {/* Welcome Text */}
      <Typography variant="h4" gutterBottom>
        {t('Welcome to RoamAgro')}
      </Typography>
      <Typography variant="h5" gutterBottom>
        {t('Your Agribusiness Companion!')}
      </Typography>

      {/* Email Login */}
      <Button
        component={Link}
        to="/login"
        color="primary"
        variant="contained"
        sx={{ mb: 2, width: '100%' }}
      >
        {t('Login')}
      </Button>

      {/* Register New User */}
      <Button
        component={Link}
        to="/register"
        color="primary"
        variant="outlined"
        sx={{ mb: 2, width: '100%' }}
      >
        {t('Register New User')}
      </Button>
    </Container>
  );
};

export default Home;