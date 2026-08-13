import React from 'react';

import {
    Avatar,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography,
} from '@mui/material';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import StoreIcon from '@mui/icons-material/Store';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import PeopleIcon from '@mui/icons-material/People';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';

const notificationTypes = {
    like: {
        icon: <FavoriteIcon />,
        color: '#E53935',
    },
    comment: {
        icon: <CommentIcon />,
        color: '#1565C0',
    },
    follow: {
        icon: <PeopleIcon />,
        color: '#6A1B9A',
    },
    marketplace: {
        icon: <StoreIcon />,
        color: '#1565C0',
    },
    price_alert: {
        icon: <PriceChangeIcon />,
        color: '#EF6C00',
    },
    farm: {
        icon: <AgricultureIcon />,
        color: '#2E7D32',
    },
    system: {
        icon: <NotificationsIcon />,
        color: '#616161',
    },
};

const NotificationItem = ({
    notification,
    onClick,
}) => {

    const type =
        notificationTypes[
            notification.type
        ] || notificationTypes.system;

    return (
        <ListItem
            button
            onClick={() =>
                onClick(notification)
            }
            divider
            sx={{
                alignItems: 'flex-start',
                bgcolor: notification.read
                    ? 'transparent'
                    : 'action.hover',
            }}
        >
            <ListItemAvatar>
                <Avatar
                    sx={{
                        bgcolor: type.color,
                    }}
                >
                    {type.icon}
                </Avatar>
            </ListItemAvatar>

            <ListItemText
                primary={
                    <Typography
                        fontWeight={
                            notification.read
                                ? 400
                                : 700
                        }
                    >
                        {notification.title}
                    </Typography>
                }
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
                            {notification.createdAt
                                ? new Date(
                                      notification.createdAt
                                  ).toLocaleString()
                                : ''}
                        </Typography>
                    </>
                }
            />
        </ListItem>
    );
};

export default NotificationItem;