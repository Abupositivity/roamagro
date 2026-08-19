import React,{useState}from'react';
import{
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    Stack
}from'@mui/material';
import PersonAddOutlinedIcon from'@mui/icons-material/PersonAddOutlined';
import CheckOutlinedIcon from'@mui/icons-material/CheckOutlined';
import HourglassEmptyOutlinedIcon from'@mui/icons-material/HourglassEmptyOutlined';
import CloseOutlinedIcon from'@mui/icons-material/CloseOutlined';
import MoreVertOutlinedIcon from'@mui/icons-material/MoreVertOutlined';
import DeleteOutlineOutlinedIcon from'@mui/icons-material/DeleteOutlineOutlined';
import {useDispatch}from'react-redux';
import {useTranslation}from'react-i18next';
import{
    sendConnectionRequest,
    cancelConnectionRequest,
    removeConnection
}from'../../redux/actions/connectionActions';

const ConnectionButton=({
    userId,
    status='none',
    fullWidth=false,
    onChange,
    userName=''
})=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();
    const[loading,setLoading]=useState(false);
    const[menuAnchor,setMenuAnchor]=useState(null);
    const[confirmOpen,setConfirmOpen]=useState(false);

    const menuOpen=Boolean(menuAnchor);

    const handleAction=async action=>{
        if(loading){
            return;
        }

        setLoading(true);

        try{
            const result=await dispatch(
                action(userId)
            );

            if(result?.success&&onChange){
                onChange(result);
            }
        }finally{
            setLoading(false);
        }
    };

    const handleOpenMenu=event=>{
        if(loading){
            return;
        }

        setMenuAnchor(event.currentTarget);
    };

    const handleCloseMenu=()=>{
        setMenuAnchor(null);
    };

    const handleOpenRemoveConfirmation=()=>{
        handleCloseMenu();
        setConfirmOpen(true);
    };

    const handleCloseRemoveConfirmation=()=>{
        if(loading){
            return;
        }

        setConfirmOpen(false);
    };

    const handleRemoveConnection=async()=>{
        if(loading){
            return;
        }

        setLoading(true);

        try{
            const result=await dispatch(
                removeConnection(userId)
            );

            if(result?.success){
                setConfirmOpen(false);

                if(onChange){
                    onChange(result);
                }
            }
        }finally{
            setLoading(false);
        }
    };

    if(status==='self'){
        return null;
    }

    if(status==='connected'){
        return(
            <>
                <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                        width:fullWidth?
                            '100%':
                            'auto'
                    }}
                >
                    <Button
                        variant="outlined"
                        color="success"
                        startIcon={
                            <CheckOutlinedIcon/>
                        }
                        disabled
                        fullWidth={fullWidth}
                        sx={{
                            borderRadius:2.5,
                            flex:1,
                            '&.Mui-disabled':{
                                color:'success.main',
                                borderColor:'success.main',
                                opacity:1
                            }
                        }}
                    >
                        {t('Connected')}
                    </Button>

                    <IconButton
                        onClick={handleOpenMenu}
                        disabled={loading}
                        aria-label={
                            t('Connection options')
                        }
                        aria-haspopup="menu"
                        aria-expanded={
                            menuOpen?
                                'true':
                                undefined
                        }
                        sx={{
                            border:1,
                            borderColor:'divider',
                            borderRadius:2.5
                        }}
                    >
                        <MoreVertOutlinedIcon/>
                    </IconButton>
                </Stack>

                <Menu
                    anchorEl={menuAnchor}
                    open={menuOpen}
                    onClose={handleCloseMenu}
                    anchorOrigin={{
                        vertical:'bottom',
                        horizontal:'right'
                    }}
                    transformOrigin={{
                        vertical:'top',
                        horizontal:'right'
                    }}
                >
                    <MenuItem
                        onClick={
                            handleOpenRemoveConfirmation
                        }
                        sx={{
                            color:'error.main'
                        }}
                    >
                        <DeleteOutlineOutlinedIcon
                            fontSize="small"
                            sx={{mr:1}}
                        />
                        {t('Remove Connection')}
                    </MenuItem>
                </Menu>

                <Dialog
                    open={confirmOpen}
                    onClose={
                        handleCloseRemoveConfirmation
                    }
                    fullWidth
                    maxWidth="xs"
                >
                    <DialogTitle
                        sx={{
                            fontWeight:800
                        }}
                    >
                        {t('Remove Connection?')}
                    </DialogTitle>

                    <DialogContent>
                        <DialogContentText>
                            {userName?
                                t(
                                    'Are you sure you want to remove {{name}} from your connections?',
                                    {
                                        name:userName
                                    }
                                ):
                                t(
                                    'Are you sure you want to remove this user from your connections?'
                                )}
                        </DialogContentText>
                    </DialogContent>

                    <DialogActions
                        sx={{
                            p:2,
                            gap:1
                        }}
                    >
                        <Button
                            onClick={
                                handleCloseRemoveConfirmation
                            }
                            disabled={loading}
                            sx={{
                                borderRadius:2.5
                            }}
                        >
                            {t('Cancel')}
                        </Button>

                        <Button
                            variant="contained"
                            color="error"
                            onClick={
                                handleRemoveConnection
                            }
                            disabled={loading}
                            startIcon={
                                loading?
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />:
                                    <DeleteOutlineOutlinedIcon/>
                            }
                            sx={{
                                borderRadius:2.5
                            }}
                        >
                            {loading?
                                t('Removing...'):
                                t('Remove')}
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }

    if(status==='outgoing_pending'){
        return(
            <Button
                variant="outlined"
                startIcon={
                    loading?
                        <CircularProgress size={18}/>:
                        <HourglassEmptyOutlinedIcon/>
                }
                onClick={()=>
                    handleAction(
                        cancelConnectionRequest
                    )
                }
                disabled={loading}
                fullWidth={fullWidth}
                sx={{borderRadius:2.5}}
            >
                {loading?
                    t('Cancelling...'):
                    t('Request Sent')}
            </Button>
        );
    }

    if(status==='incoming_pending'){
        return(
            <Button
                variant="outlined"
                startIcon={
                    <CloseOutlinedIcon/>
                }
                disabled
                fullWidth={fullWidth}
                sx={{borderRadius:2.5}}
            >
                {t('Respond in Connections')}
            </Button>
        );
    }

    return(
        <Button
            variant="contained"
            startIcon={
                loading?
                    <CircularProgress
                        size={18}
                        color="inherit"
                    />:
                    <PersonAddOutlinedIcon/>
            }
            onClick={()=>
                handleAction(
                    sendConnectionRequest
                )
            }
            disabled={loading}
            fullWidth={fullWidth}
            sx={{borderRadius:2.5}}
        >
            {loading?
                t('Connecting...'):
                t('Connect')}
        </Button>
    );
};

export default ConnectionButton;