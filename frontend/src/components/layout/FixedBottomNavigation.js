import React from 'react';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import StoreIcon from '@mui/icons-material/Store';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import PeopleIcon from '@mui/icons-material/People';
import roamagroLogo from '../../assets/images/logo.svg';
import { useTranslation } from 'react-i18next';

const FixedBottomNavigation = () => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      display="flex"
      justifyContent="space-around"
      alignItems="center"
      bgcolor={theme.palette.background.default}
      boxShadow={3}
      padding="10px 0"
    >
      <Link to="/dashboard" style={{ textDecoration: 'none', textAlign: 'center' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <img src={roamagroLogo} alt="Scroll to Top" width="30" height="30" />
          <Typography variant="caption" color={theme.palette.text.primary}>{t('Home')}</Typography>
        </Box>
      </Link>

      <Link to="/farm-projects" style={{ textDecoration: 'none', textAlign: 'center' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton color="primary">
            <AgricultureIcon />
          </IconButton>
          <Typography variant="caption" color={theme.palette.text.primary}>{t('Farm Projects')}</Typography>
        </Box>
      </Link>

      <Link to="/marketplace" style={{ textDecoration: 'none', textAlign: 'center' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton color="primary">
            <StoreIcon />
          </IconButton>
          <Typography variant="caption" color={theme.palette.text.primary}>{t('Marketplace')}</Typography>
        </Box>
      </Link>

      <Link to="/price-index" style={{ textDecoration: 'none', textAlign: 'center' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton color="primary">
            <PriceChangeIcon />
          </IconButton>
          <Typography variant="caption" color={theme.palette.text.primary}>{t('Price Index')}</Typography>
        </Box>
      </Link>

      <Link to="/community" style={{ textDecoration: 'none', textAlign: 'center' }}>
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton color="primary">
            <PeopleIcon />
          </IconButton>
          <Typography variant="caption" color={theme.palette.text.primary}>{t('Community')}</Typography>
        </Box>
      </Link>
    </Box>
  );
};

export default FixedBottomNavigation;