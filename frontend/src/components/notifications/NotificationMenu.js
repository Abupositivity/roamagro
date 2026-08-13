import React from 'react';

import {
    Box,
    Button,
    CircularProgress,
    Divider,
    List,
    Menu,
    Stack,
    Typography,
} from '@mui/material';

import NotificationItem from './NotificationItem';

const NotificationMenu = ({
    anchorEl,
    open,
    onClose,
    notifications = [],
    loading = false,
    actionLoading = false,
    onNotificationClick,
    onMarkAllAsRead,
}) => {
    const unreadCount = notifications.filter(
        (notification) => !notification.read
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
                    maxWidth: 'calc(100vw - 24px)',
                    maxHeight: 520,
                },
            }}
        >
            <Box px={2} py={1.5}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            Notifications
                        </Typography>

                        {unreadCount > 0 && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {unreadCount} unread
                            </Typography>
                        )}
                    </Box>

                    {unreadCount > 0 && (
                        <Button
                            size="small"
                            onClick={onMarkAllAsRead}
                            disabled={actionLoading}
                        >
                            Mark all read
                        </Button>
                    )}
                </Stack>
            </Box>

            <Divider />

            {loading ? (
                <Box
                    py={5}
                    display="flex"
                    justifyContent="center"
                >
                    <CircularProgress size={28} />
                </Box>
            ) : notifications.length === 0 ? (
                <Box px={3} py={5}>
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
                        (notification) => (
                            <NotificationItem
                                key={notification._id}
                                notification={
                                    notification
                                }
                                onClick={
                                    onNotificationClick
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