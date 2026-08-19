import React,{useEffect,useState}from'react';

import{
    Alert,
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    IconButton,
    List,
    Paper,
    Snackbar,
    Stack,
    Typography
}from'@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import RefreshIcon from '@mui/icons-material/Refresh';

import{useDispatch,useSelector}from'react-redux';
import{useNavigate}from'react-router-dom';
import{useTranslation}from'react-i18next';

import{
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification
}from'../redux/actions/notificationActions';

import NotificationItem from '../components/notifications/NotificationItem';

const Notifications=()=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();
    const navigate=useNavigate();

    const{
        notifications=[],
        loading=false,
        error=null,
        actionLoading=false,
        actionId=null,
        actionError=null
    }=useSelector(
        state=>state.notifications||{}
    );

    const[snackbar,setSnackbar]=useState({
        open:false,
        message:'',
        severity:'success'
    });

    useEffect(()=>{
        dispatch(fetchNotifications());
    },[dispatch]);

    const unreadCount=notifications.filter(
        notification=>!notification.read
    ).length;

    const showSnackbar=(message,severity='success')=>{
        setSnackbar({
            open:true,
            message,
            severity
        });
    };

    const closeSnackbar=()=>{
        setSnackbar(previous=>({
            ...previous,
            open:false
        }));
    };

    const handleNotificationClick=async notification=>{
        if(!notification?._id){
            return;
        }

        if(!notification.read){
            const result=await dispatch(
                markNotificationAsRead(
                    notification._id
                )
            );

            if(!result?.success){
                showSnackbar(
                    result?.error||
                    t('Unable to update notification.'),
                    'error'
                );
                return;
            }
        }

        if(notification.link){
            navigate(notification.link);
        }
    };

    const handleMarkAllAsRead=async()=>{
        if(actionLoading||unreadCount===0){
            return;
        }

        const result=await dispatch(
            markAllNotificationsAsRead()
        );

        if(result?.success){
            showSnackbar(
                t('All notifications marked as read.')
            );
        }else{
            showSnackbar(
                result?.error||
                t('Unable to update notifications.'),
                'error'
            );
        }
    };

    const handleDelete=async(event,id)=>{
        event.stopPropagation();

        if(!id||actionLoading){
            return;
        }

        const result=await dispatch(
            deleteNotification(id)
        );

        if(result?.success){
            showSnackbar(
                t('Notification deleted.')
            );
        }else{
            showSnackbar(
                result?.error||
                t('Unable to delete notification.'),
                'error'
            );
        }
    };

    const handleRetry=()=>{
        dispatch(fetchNotifications());
    };

    return(
        <Container
            maxWidth="md"
            sx={{
                py:{xs:2,sm:3},
                pb:{xs:10,sm:8}
            }}
        >
            <Stack
                direction={{xs:'column',sm:'row'}}
                alignItems={{
                    xs:'stretch',
                    sm:'center'
                }}
                justifyContent="space-between"
                spacing={2}
                sx={{mb:3}}
            >
                <Box>
                    <Typography
                        variant="h5"
                        fontWeight={800}
                    >
                        {t('Notifications')}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{mt:.5}}
                    >
                        {t(
                            'Stay updated with your connections and community activity.'
                        )}
                    </Typography>
                </Box>

                {unreadCount>0&&(
                    <Button
                        variant="outlined"
                        startIcon={<DoneAllIcon/>}
                        onClick={handleMarkAllAsRead}
                        disabled={actionLoading}
                        fullWidth
                        sx={{
                            width:{
                                xs:'100%',
                                sm:'auto'
                            },
                            minHeight:44,
                            borderRadius:2.5
                        }}
                    >
                        {actionLoading&&actionId==='all'?(
                            <>
                                <CircularProgress
                                    size={17}
                                    color="inherit"
                                    sx={{mr:1}}
                                />
                                {t('Updating...')}
                            </>
                        ):(
                            t('Mark all as read')
                        )}
                    </Button>
                )}
            </Stack>

            {error&&(
                <Alert
                    severity="error"
                    sx={{mb:2}}
                    action={
                        <Button
                            color="inherit"
                            size="small"
                            startIcon={<RefreshIcon/>}
                            onClick={handleRetry}
                        >
                            {t('Retry')}
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {actionError&&(
                <Alert
                    severity="error"
                    sx={{mb:2}}
                >
                    {actionError}
                </Alert>
            )}

            {loading?(
                <Paper
                    elevation={0}
                    sx={{
                        border:'1px solid',
                        borderColor:'divider',
                        borderRadius:3,
                        p:{xs:4,sm:6}
                    }}
                >
                    <Stack
                        alignItems="center"
                        spacing={2}
                    >
                        <CircularProgress/>

                        <Typography
                            color="text.secondary"
                        >
                            {t(
                                'Loading notifications...'
                            )}
                        </Typography>
                    </Stack>
                </Paper>
            ):notifications.length===0?(
                <Paper
                    elevation={0}
                    sx={{
                        p:{xs:4,sm:6},
                        textAlign:'center',
                        border:'1px solid',
                        borderColor:'divider',
                        borderRadius:3
                    }}
                >
                    <Avatar
                        sx={{
                            width:64,
                            height:64,
                            mx:'auto',
                            mb:2,
                            bgcolor:'action.hover',
                            color:'text.secondary'
                        }}
                    >
                        <NotificationsNoneIcon/>
                    </Avatar>

                    <Typography
                        fontWeight={800}
                    >
                        {t('No notifications yet.')}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            mt:1,
                            maxWidth:450,
                            mx:'auto'
                        }}
                    >
                        {t(
                            'Likes, comments, connection requests and connection updates will appear here.'
                        )}
                    </Typography>
                </Paper>
            ):(
                <Paper
                    elevation={0}
                    sx={{
                        border:'1px solid',
                        borderColor:'divider',
                        borderRadius:3,
                        overflow:'hidden'
                    }}
                >
                    <List disablePadding>
                        {notifications.map(
                            (notification,index)=>(
                                <React.Fragment
                                    key={notification._id}
                                >
                                    <NotificationItem
                                        notification={
                                            notification
                                        }
                                        onClick={
                                            handleNotificationClick
                                        }
                                    />

                                    <Box
                                        sx={{
                                            display:'flex',
                                            justifyContent:'flex-end',
                                            px:{
                                                xs:1.5,
                                                sm:2
                                            },
                                            py:.5
                                        }}
                                    >
                                        <IconButton
                                            size="small"
                                            aria-label={t(
                                                'Delete notification'
                                            )}
                                            onClick={event=>
                                                handleDelete(
                                                    event,
                                                    notification._id
                                                )
                                            }
                                            disabled={
                                                actionLoading&&
                                                actionId===
                                                    notification._id
                                            }
                                        >
                                            {actionLoading&&
                                            actionId===
                                                notification._id?(
                                                <CircularProgress
                                                    size={18}
                                                />
                                            ):(
                                                <DeleteOutlineIcon
                                                    fontSize="small"
                                                />
                                            )}
                                        </IconButton>
                                    </Box>

                                    {index<
                                        notifications.length-1&&(
                                        <Divider/>
                                    )}
                                </React.Fragment>
                            )
                        )}
                    </List>
                </Paper>
            )}

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={closeSnackbar}
                anchorOrigin={{
                    vertical:'bottom',
                    horizontal:'center'
                }}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={closeSnackbar}
                    sx={{width:'100%'}}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Notifications;