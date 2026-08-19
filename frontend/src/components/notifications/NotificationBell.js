import React, { useEffect, useState } from 'react';
import {
    Badge,
    IconButton,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useDispatch, useSelector } from 'react-redux';

import {
    fetchNotifications,
    fetchUnreadCount,
} from '../../redux/actions/notificationActions';

import NotificationMenu from './NotificationMenu';

const NotificationBell = () => {
    const dispatch = useDispatch();

    const {
        notifications,
        unreadCount,
    } = useSelector(
        state => state.notifications
    );

    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        dispatch(fetchNotifications());
        dispatch(fetchUnreadCount());
    }, [dispatch]);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={handleOpen}
            >
                <Badge
                    badgeContent={unreadCount}
                    color="error"
                    max={99}
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <NotificationMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                notifications={notifications}
            />
        </>
    );
};

export default NotificationBell;