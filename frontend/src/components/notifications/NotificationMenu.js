import React from 'react';
import {
    Box,
    Divider,
    List,
    Menu,
    Typography,
} from '@mui/material';

import NotificationItem from './NotificationItem';

const NotificationMenu = ({
    anchorEl,
    open,
    onClose,
    notifications,
}) => {

    const handleNotificationClick = () => {

        onClose();

    };

    return (

        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    width: 360,
                    maxHeight: 500,
                },
            }}
        >

            <Box p={2}>

                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    Notifications
                </Typography>

            </Box>

            <Divider />

            {

                notifications.length === 0 ? (

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

                        {

                            notifications.map((notification) => (

                                <NotificationItem

                                    key={notification.id}

                                    notification={notification}

                                    onClick={handleNotificationClick}

                                />

                            ))

                        }

                    </List>

                )

            }

        </Menu>

    );

};

export default NotificationMenu;