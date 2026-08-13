import React, { useEffect, useState } from 'react';

import {
    Badge,
    IconButton,
} from '@mui/material';

import NotificationsIcon from '@mui/icons-material/Notifications';

import { useDispatch, useSelector } from 'react-redux';

import {
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '../../redux/actions/notificationActions';

import NotificationMenu from './NotificationMenu';

const NotificationBell = () => {
    const dispatch = useDispatch();

    const {
        notifications,
        loading,
        actionLoading,
    } = useSelector(
        (state) => state.notifications
    );

    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        dispatch(fetchNotifications());
    }, [dispatch]);

    const unreadCount = notifications.filter(
        (notification) => !notification.read
    ).length;

    const handleNotificationClick = (notification) => {
        if (!notification.read) {
            dispatch(
                markNotificationAsRead(
                    notification._id
                )
            );
        }

        setAnchorEl(null);
    };

    const handleMarkAllAsRead = () => {
        if (unreadCount > 0) {
            dispatch(markAllNotificationsAsRead());
        }
    };

    return (
        <>
            <IconButton
                color="inherit"
                onClick={(e) =>
                    setAnchorEl(e.currentTarget)
                }
                aria-label="notifications"
            >
                <Badge
                    badgeContent={
                        unreadCount > 99
                            ? '99+'
                            : unreadCount
                    }
                    color="error"
                >
                    <NotificationsIcon />
                </Badge>
            </IconButton>

            <NotificationMenu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                notifications={notifications}
                loading={loading}
                actionLoading={actionLoading}
                onNotificationClick={
                    handleNotificationClick
                }
                onMarkAllAsRead={
                    handleMarkAllAsRead
                }
            />
        </>
    );
};

export default NotificationBell;