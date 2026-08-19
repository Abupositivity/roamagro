import React,{useEffect,useState}from'react';
import{
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
}from'@mui/material';
import NotificationsNoneIcon from'@mui/icons-material/NotificationsNone';
import AccountCircleIcon from'@mui/icons-material/AccountCircle';
import SettingsIcon from'@mui/icons-material/Settings';
import LogoutIcon from'@mui/icons-material/Logout';
import AccountBalanceWalletIcon from'@mui/icons-material/AccountBalanceWallet';
import {useNavigate}from'react-router-dom';
import {useTranslation}from'react-i18next';
import {useDispatch,useSelector}from'react-redux';
import {logout}from'../../redux/actions/authActions';
import {fetchUnreadCount}from'../../redux/actions/notificationActions';

const TopAppBar=()=>{
    const{t}=useTranslation();
    const navigate=useNavigate();
    const dispatch=useDispatch();
    const[anchorEl,setAnchorEl]=useState(null);
    const[logoutDialogOpen,setLogoutDialogOpen]=useState(false);

    const open=Boolean(anchorEl);

    const{user}=useSelector(
        state=>state.auth
    );

    const unreadCount=useSelector(
        state=>state.notifications?.unreadCount||0
    );

    useEffect(()=>{
        if(!user){
            return undefined;
        }

        dispatch(fetchUnreadCount());

        const interval=setInterval(()=>{
            dispatch(fetchUnreadCount());
        },60000);

        return()=>{
            clearInterval(interval);
        };
    },[dispatch,user]);

    const handleOpen=event=>{
        setAnchorEl(event.currentTarget);
    };

    const handleClose=()=>{
        setAnchorEl(null);
    };

    const handleLogoutOpen=()=>{
        handleClose();
        setLogoutDialogOpen(true);
    };

    const handleLogoutCancel=()=>{
        setLogoutDialogOpen(false);
    };

    const handleLogoutConfirm=()=>{
        setLogoutDialogOpen(false);
        dispatch(logout());
        navigate('/');
    };

    const handleNotifications=()=>{
        navigate('/notifications');
    };

    return(
        <>
            <AppBar
                position="fixed"
                elevation={1}
                color="inherit"
                sx={{
                    borderBottom:'1px solid',
                    borderColor:'divider',
                    zIndex:theme=>
                        theme.zIndex.drawer+1
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        sx={{
                            flexGrow:1,
                            fontWeight:700,
                            color:'primary.main'
                        }}
                    >
                        RoamAgro
                    </Typography>

                    <Tooltip
                        title={t('Notifications')}
                    >
                        <IconButton
                            color="inherit"
                            onClick={handleNotifications}
                            aria-label={t(
                                'Notifications'
                            )}
                        >
                            <Badge
                                badgeContent={
                                    unreadCount>99
                                        ?'99+'
                                        :unreadCount
                                }
                                color="error"
                                invisible={
                                    unreadCount===0
                                }
                            >
                                <NotificationsNoneIcon/>
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Tooltip
                        title={t('Account')}
                    >
                        <IconButton
                            onClick={handleOpen}
                            aria-label={t('Account')}
                            aria-controls={
                                open
                                    ?'account-menu'
                                    :undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={
                                open
                                    ?'true'
                                    :undefined
                            }
                        >
                            <Avatar
                                src={
                                    user?.profilePhoto||
                                    undefined
                                }
                                sx={{
                                    width:36,
                                    height:36,
                                    bgcolor:
                                        'primary.main'
                                }}
                            >
                                {user?.name?(
                                    user.name
                                        .charAt(0)
                                        .toUpperCase()
                                ):(
                                    <AccountCircleIcon/>
                                )}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        id="account-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        MenuListProps={{
                            'aria-labelledby':
                                'account-menu-button'
                        }}
                    >
                        <MenuItem
                            disabled
                            sx={{
                                fontWeight:600,
                                opacity:1
                            }}
                        >
                            {user?.name||
                                t('Profile')}
                        </MenuItem>

                        <MenuItem
                            onClick={()=>{
                                handleClose();
                                navigate('/profile');
                            }}
                        >
                            {t('Profile')}
                        </MenuItem>

                        <MenuItem
                            onClick={()=>{
                                handleClose();
                                navigate('/financial');
                            }}
                        >
                            <AccountBalanceWalletIcon
                                fontSize="small"
                                sx={{mr:1}}
                            />
                            {t(
                                'Financial Tracking'
                            )}
                        </MenuItem>

                        <MenuItem
                            onClick={()=>{
                                handleClose();
                                navigate('/settings');
                            }}
                        >
                            <SettingsIcon
                                fontSize="small"
                                sx={{mr:1}}
                            />
                            {t('Settings')}
                        </MenuItem>

                        <MenuItem
                            onClick={handleLogoutOpen}
                        >
                            <LogoutIcon
                                fontSize="small"
                                sx={{mr:1}}
                            />
                            {t('Logout')}
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle
                    sx={{fontWeight:700}}
                >
                    {t('Logout')}
                </DialogTitle>

                <DialogContent>
                    <Typography
                        color="text.secondary"
                    >
                        {t(
                            'Are you sure you want to log out of your RoamAgro account?'
                        )}
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        p:2,
                        gap:1
                    }}
                >
                    <Button
                        onClick={handleLogoutCancel}
                        variant="outlined"
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                        startIcon={
                            <LogoutIcon/>
                        }
                    >
                        {t('Logout')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default TopAppBar;