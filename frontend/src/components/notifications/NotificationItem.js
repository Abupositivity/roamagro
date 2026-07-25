import React from 'react';
import {
    Avatar,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from '@mui/material';

const NotificationItem = ({ notification, onClick }) => {

    return (

        <ListItem
            button
            onClick={() => onClick(notification)}
            divider
            sx={{
                alignItems: 'flex-start',
            }}
        >

            <ListItemAvatar>

                <Avatar
                    sx={{
                        bgcolor: notification.color,
                    }}
                >
                    {notification.icon}
                </Avatar>

            </ListItemAvatar>

            <ListItemText

                primary={notification.title}

                secondary={

                    <>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {notification.message}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.disabled"
                        >
                            {notification.time}
                        </Typography>

                    </>

                }

            />

        </ListItem>

    );

};

export default NotificationItem;