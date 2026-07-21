import React, { useState } from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Badge,
} from '@mui/material';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const TopAppBar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);
    const handleOpen = (e) => setAnchorEl(e.currentTarget);
    const handleClose = () => setAnchorEl(null);

    const logout = () => {
        localStorage.removeItem('token');
        navigate('/');
    };
    return (
        <AppBar
            position="fixed"
            elevation={1}
            color="inherit"
            sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: 1300,
            }}
        >
            <Toolbar>
                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1,
                        fontWeight: 700,
                        color: 'primary.main',
                    }}
                >
                    RoamAgro
                </Typography>
                <IconButton color="inherit">
                    <Badge
                        color="error"
                        variant="dot"
                    >
                        <NotificationsNoneIcon />
                    </Badge>
                </IconButton>
                <IconButton onClick={handleOpen}>
                    <Avatar
                        sx={{
                            width: 34,
                            height: 34,
                            bgcolor: 'primary.main',
                        }}
                    >
                        <AccountCircleIcon />
                    </Avatar>
                </IconButton>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem onClick={handleClose}>
                        {t('Profile')}
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            navigate('/settings');
                            handleClose();
                        }}
                    >
                        <SettingsIcon
                            sx={{ mr: 1 }}
                            fontSize="small"
                        />
                        {t('Settings')}
                    </MenuItem>
                    <MenuItem onClick={logout}>
                        <LogoutIcon
                            sx={{ mr: 1 }}
                            fontSize="small"
                        />
                        {t('Logout')}
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};
export default TopAppBar;