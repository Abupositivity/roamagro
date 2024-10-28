import React, { useState } from 'react';
import { AppBar, Toolbar, IconButton, Typography, Menu, MenuItem } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';

const TopAppBar = () => {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleNavigateToSettings = () => {
    navigate('/settings');
    handleMenuClose();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" style={{ flexGrow: 1 }}>
          RoamAgro
        </Typography>
        <IconButton edge="end" color="inherit" onClick={handleMenuOpen}>
          <AccountCircle />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleMenuClose}>{t('Profile')}</MenuItem>
          <MenuItem onClick={handleNavigateToSettings}>
            <SettingsIcon fontSize="small" />
            {t('Settings')}
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <LogoutIcon fontSize="small" />
            {t('Logout')}
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default TopAppBar;