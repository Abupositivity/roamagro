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
    Tooltip,
} from '@mui/material';

import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../redux/actions/authActions';

const TopAppBar = () => {

    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Authentication
    const { user } = useSelector((state) => state.auth);

    // Placeholder until Notification module is built
    const unreadCount =
        useSelector((state) => state.notifications?.unreadCount) || 0;
    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const handleLogout = () => {
        dispatch(logout());
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
                zIndex: (theme) => theme.zIndex.drawer + 1,
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

                {/* Notifications */}
                <Tooltip title={t('Notifications')}>
                    <IconButton
                        color="inherit"
                        onClick={() => navigate('/notifications')}
                    >
                        <Badge
                            badgeContent={unreadCount}
                            color="error"
                            invisible={unreadCount === 0}
                        >
                            <NotificationsNoneIcon />
                        </Badge>
                    </IconButton>
                </Tooltip>

                {/* User */}
                <Tooltip title={t('Account')}>
                    <IconButton onClick={handleOpen}>
                        <Avatar
                            sx={{
                                width: 36,
                                height: 36,
                                bgcolor: 'primary.main',
                            }}
                        >
                            {user?.name
                                ? user.name.charAt(0).toUpperCase()
                                : <AccountCircleIcon />}
                        </Avatar>
                    </IconButton>
                </Tooltip>
                <Menu
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                >
                    <MenuItem
                        disabled
                        sx={{
                            fontWeight: 600,
                            opacity: 1,
                        }}
                    >
                        {user?.name || t('Profile')}
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            navigate('/profile');
                            handleClose();
                        }}
                    >
                        {t('Profile')}
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            navigate('/settings');
                            handleClose();
                        }}
                    >
                        <SettingsIcon
                            fontSize="small"
                            sx={{ mr: 1 }}
                        />
                        {t('Settings')}
                    </MenuItem>
                    <MenuItem
                        onClick={handleLogout}
                    >
                        <LogoutIcon
                            fontSize="small"
                            sx={{ mr: 1 }}
                        />
                        {t('Logout')}
                    </MenuItem>
                </Menu>
            </Toolbar>
        </AppBar>
    );
};

export default TopAppBar;