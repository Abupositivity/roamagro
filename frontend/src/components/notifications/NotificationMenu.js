import React from 'react';
import {
    Box,
    Button,
    Divider,
    List,
    Menu,
    Stack,
    Typography,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import NotificationItem from './NotificationItem';

import {
    markNotificationAsRead,
    markAllNotificationsAsRead,
} from '../../redux/actions/notificationActions';

const NotificationMenu = ({
    anchorEl,
    open,
    onClose,
    notifications = [],
}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleNotificationClick = (
        notification
    ) => {
        if (!notification.read) {
            dispatch(
                markNotificationAsRead(
                    notification._id
                )
            );
        }

        onClose();

        if (notification.link) {
            navigate(notification.link);
        }
    };

    const handleMarkAllRead = () => {
        dispatch(
            markAllNotificationsAsRead()
        );
    };

    const unreadCount = notifications.filter(
        notification => !notification.read
    ).length;

    return (
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: {
                        xs: 320,
                        sm: 380,
                    },
                    maxHeight: 520,
                },
            }}
        >
            <Box px={2} py={1.5}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        Notifications
                    </Typography>

                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={handleMarkAllRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </Stack>
            </Box>

            <Divider />

            {notifications.length === 0 ? (
                <Box p={3}>
                    <Typography
                        color="text.secondary"
                        align="center"
                    >
                        No notifications
                    </Typography>
                </Box>
            ) : (
                <List disablePadding>
                    {notifications.map(
                        notification => (
                            <NotificationItem
                                key={
                                    notification._id
                                }
                                notification={
                                    notification
                                }
                                onClick={
                                    handleNotificationClick
                                }
                            />
                        )
                    )}
                </List>
            )}
        </Menu>
    );
};

export default NotificationMenu;