import React from 'react';
import { Container, Grid, Typography } from '@mui/material';
import FarmProject from '../components/farmProjects/FarmProject';
import Marketplace from '../components/marketplace/Marketplace';
import PriceIndex from '../components/priceIndex/PriceIndex';
import Community from '../components/community/Community';
import ThemeSwitcher from '../components/ThemeSwitcher';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Dashboard = () => {
  return (
    <Container>
      <Typography variant="h4">Dashboard</Typography>
      <ThemeSwitcher />
      <LanguageSwitcher />
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <FarmProject />
        </Grid>
        <Grid item xs={12} md={6}>
          <Marketplace />
        </Grid>
        <Grid item xs={12} md={6}>
          <PriceIndex />
        </Grid>
        <Grid item xs={12} md={6}>
          <Community />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;