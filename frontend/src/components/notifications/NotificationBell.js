import React, { useState } from 'react';

import {
    Badge,
    IconButton,
} from '@mui/material';

import NotificationsIcon from '@mui/icons-material/Notifications';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import StoreIcon from '@mui/icons-material/Store';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import PeopleIcon from '@mui/icons-material/People';

import NotificationMenu from './NotificationMenu';

const NotificationBell = () => {

    const [anchorEl, setAnchorEl] = useState(null);

    const notifications = [

        {

            id: 1,

            title: 'Farm Reminder',

            message: 'Irrigation for Maize Project is due today.',

            time: '5 mins ago',

            icon: <AgricultureIcon />,

            color: '#2E7D32',

        },

        {

            id: 2,

            title: 'Marketplace',

            message: 'Your Soybeans listing received an enquiry.',

            time: '20 mins ago',

            icon: <StoreIcon />,

            color: '#1565C0',

        },

        {

            id: 3,

            title: 'Price Update',

            message: 'Maize price increased in Kano market.',

            time: '1 hour ago',

            icon: <PriceChangeIcon />,

            color: '#EF6C00',

        },

        {

            id: 4,

            title: 'Community',

            message: 'Someone replied to your discussion.',

            time: 'Yesterday',

            icon: <PeopleIcon />,

            color: '#6A1B9A',

        },

    ];

    return (

        <>

            <IconButton
                color="inherit"
                onClick={(e) => setAnchorEl(e.currentTarget)}
            >

                <Badge
                    badgeContent={notifications.length}
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

            />

        </>

    );

};

export default NotificationBell;