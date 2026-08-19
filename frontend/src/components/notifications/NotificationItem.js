import React from 'react';

import{
    Avatar,
    Box,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
}from'@mui/material';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import StoreIcon from '@mui/icons-material/Store';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import PeopleIcon from '@mui/icons-material/People';
import CommentIcon from '@mui/icons-material/Comment';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import NotificationsIcon from '@mui/icons-material/Notifications';

import{useTranslation}from'react-i18next';

const NotificationItem=({notification,onClick})=>{
    const{t}=useTranslation();

    const getIcon=()=>{
        switch(notification.type){
            case'like':
                return<FavoriteIcon fontSize="small"/>;
            case'comment':
                return<CommentIcon fontSize="small"/>;
            case'connection_request':
                return<PersonAddIcon fontSize="small"/>;
            case'connection_accepted':
                return<CheckCircleIcon fontSize="small"/>;
            case'connection_rejected':
                return<CancelIcon fontSize="small"/>;
            case'follow':
                return<PeopleIcon fontSize="small"/>;
            case'marketplace':
                return<StoreIcon fontSize="small"/>;
            case'price_alert':
                return<PriceChangeIcon fontSize="small"/>;
            case'farm':
                return<AgricultureIcon fontSize="small"/>;
            default:
                return<NotificationsIcon fontSize="small"/>;
        }
    };

    const getColor=()=>{
        switch(notification.type){
            case'like':
                return'#E53935';
            case'comment':
                return'#1565C0';
            case'connection_request':
                return'#00BF63';
            case'connection_accepted':
                return'#2E7D32';
            case'connection_rejected':
                return'#C62828';
            case'follow':
                return'#6A1B9A';
            case'marketplace':
                return'#1565C0';
            case'price_alert':
                return'#EF6C00';
            case'farm':
                return'#2E7D32';
            default:
                return'#757575';
        }
    };

    const senderName=
        notification.sender?.name||
        t('Someone');

    return(
        <ListItem
            button
            onClick={()=>onClick(notification)}
            divider
            sx={{
                alignItems:'flex-start',
                px:{xs:1.5,sm:2},
                py:{xs:1.5,sm:2},
                backgroundColor:notification.read
                    ?'transparent'
                    :'action.hover'
            }}
        >
            <ListItemAvatar>
                <Avatar
                    src={notification.sender?.profilePhoto||undefined}
                    alt={senderName}
                    sx={{
                        bgcolor:getColor(),
                        width:{xs:42,sm:46},
                        height:{xs:42,sm:46}
                    }}
                >
                    {notification.sender?.name?.charAt(0)?.toUpperCase()||
                        getIcon()}
                </Avatar>
            </ListItemAvatar>

            <ListItemText
                sx={{minWidth:0}}
                primary={
                    <Box
                        sx={{
                            display:'flex',
                            alignItems:'flex-start',
                            gap:1
                        }}
                    >
                        <Typography
                            fontWeight={notification.read?500:700}
                            sx={{
                                flex:1,
                                minWidth:0,
                                overflowWrap:'anywhere'
                            }}
                        >
                            {notification.title}
                        </Typography>

                        {!notification.read&&(
                            <Box
                                sx={{
                                    width:8,
                                    height:8,
                                    borderRadius:'50%',
                                    bgcolor:'primary.main',
                                    mt:1,
                                    flexShrink:0
                                }}
                            />
                        )}
                    </Box>
                }
                secondary={
                    <>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mt:.5,
                                overflowWrap:'anywhere'
                            }}
                        >
                            {notification.message}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{
                                display:'block',
                                mt:.75
                            }}
                        >
                            {notification.createdAt
                                ?new Date(notification.createdAt).toLocaleString()
                                :''}
                        </Typography>
                    </>
                }
            />
        </ListItem>
    );
};

export default NotificationItem;