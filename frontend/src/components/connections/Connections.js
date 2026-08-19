import React,{useEffect,useState}from'react';
import{
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Divider,
    InputAdornment,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography
}from'@mui/material';
import SearchOutlinedIcon from'@mui/icons-material/SearchOutlined';
import PeopleAltOutlinedIcon from'@mui/icons-material/PeopleAltOutlined';
import PersonAddOutlinedIcon from'@mui/icons-material/PersonAddOutlined';
import PersonAddDisabledOutlinedIcon from'@mui/icons-material/PersonAddDisabledOutlined';
import CheckCircleOutlineOutlinedIcon from'@mui/icons-material/CheckCircleOutlineOutlined';
import {useDispatch,useSelector}from'react-redux';
import {useTranslation}from'react-i18next';
import{
    searchUsers,
    fetchConnections,
    fetchIncomingConnections,
    fetchOutgoingConnections,
    discoverUsers,
    acceptConnectionRequest,
    declineConnectionRequest,
    cancelConnectionRequest
}from'../../redux/actions/connectionActions';
import UserCard from'./UserCard';
import PublicProfile from'./PublicProfile';

const Connections=()=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();

    const{
        users,
        discoveredUsers,
        connections,
        incomingRequests,
        outgoingRequests,
        loading,
        searchLoading,
        discoveryLoading,
        requestLoading,
        error,
        searchError,
        discoveryError
    }=useSelector(
        state=>state.connections||state.connection
    );

    const[tab,setTab]=useState(0);
    const[search,setSearch]=useState('');
    const[actionUserId,setActionUserId]=useState(null);
    const[selectedProfileId,setSelectedProfileId]=useState(null);

    useEffect(()=>{
        dispatch(fetchConnections());
        dispatch(fetchIncomingConnections());
        dispatch(fetchOutgoingConnections());
        dispatch(discoverUsers());
    },[dispatch]);

    useEffect(()=>{
        const value=search.trim();

        if(value.length<2){
            return undefined;
        }

        const timer=setTimeout(()=>{
            dispatch(
                searchUsers(value,1,12)
            );
        },400);

        return()=>clearTimeout(timer);
    },[dispatch,search]);

    const refreshConnections=async()=>{
        await Promise.all([
            dispatch(fetchConnections()),
            dispatch(fetchIncomingConnections()),
            dispatch(fetchOutgoingConnections())
        ]);
    };

    const refreshDiscovery=()=>{
        dispatch(
            discoverUsers()
        );
    };

    const handleTabChange=(event,newValue)=>{
        setTab(newValue);
    };

    const handleAction=async(action,userId)=>{
        if(requestLoading||actionUserId){
            return;
        }

        setActionUserId(userId);

        try{
            const result=await dispatch(
                action(userId)
            );

            if(result?.success){
                await refreshConnections();
                refreshDiscovery();
            }
        }finally{
            setActionUserId(null);
        }
    };

    const getIncomingUser=request=>
        request?.requester||request;

    const getOutgoingUser=request=>
        request?.recipient||request;

//    const displayedUsers=
//        search.trim().length>=2
//            ?users
//            :tab===0
//                ?connections
//                :tab===1
//                   ?incomingRequests
//                    :outgoingRequests;

    const displayedLoading=
        search.trim().length>=2
            ?searchLoading
            :loading;

    if(selectedProfileId){
        return(
            <PublicProfile
                userId={selectedProfileId}
                onBack={()=>setSelectedProfileId(null)}
            />
        );
    }

    const renderSearchResults=()=>{
        if(!users.length){
            return(
                <Alert severity="info">
                    {t('No RoamAgro users were found.')}
                </Alert>
            );
        }

        return(
            <Stack spacing={1.5}>
                {users.map(user=>(
                    <UserCard
                        key={user._id}
                        user={user}
                        connectionStatus={
                            user.connectionStatus||
                            'none'
                        }
                        onOpenProfile={setSelectedProfileId}
                        onConnectionChange={()=>{
                            dispatch(
                                searchUsers(
                                    search.trim(),
                                    1,
                                    12
                                )
                            );
                        }}
                    />
                ))}
            </Stack>
        );
    };

    const renderConnections=()=>{
        if(!connections.length){
            return(
                <Alert severity="info">
                    {t('You do not have any connections yet. Search for farmers, buyers and agricultural professionals to connect with them.')}
                </Alert>
            );
        }

        return(
            <Stack spacing={1.5}>
                {connections.map(user=>(
                    <UserCard
                        key={user._id}
                        user={user}
                        connectionStatus="connected"
                        onOpenProfile={setSelectedProfileId}
                        onConnectionChange={
                            refreshConnections
                        }
                    />
                ))}
            </Stack>
        );
    };

    const renderIncomingRequests=()=>{
        if(!incomingRequests.length){
            return(
                <Alert severity="info">
                    {t('You do not have any incoming connection requests.')}
                </Alert>
            );
        }

        return(
            <Stack spacing={1.5}>
                {incomingRequests.map(request=>{
                    const user=getIncomingUser(request);
                    const isLoading=
                        actionUserId===user?._id;

                    return(
                        <Box
                            key={
                                request._id||
                                user._id
                            }
                            sx={{
                                p:{xs:1.5,sm:2},
                                border:1,
                                borderColor:'divider',
                                borderRadius:3,
                                bgcolor:'background.paper'
                            }}
                        >
                            <Stack
                                direction={{
                                    xs:'column',
                                    sm:'row'
                                }}
                                spacing={2}
                                alignItems={{
                                    xs:'stretch',
                                    sm:'center'
                                }}
                            >
                                <Box
                                    sx={{
                                        flex:1,
                                        minWidth:0
                                    }}
                                >
                                    <UserCard
                                        user={user}
                                        connectionStatus={
                                            'incoming_pending'
                                        }
                                        onOpenProfile={setSelectedProfileId}
                                    />
                                </Box>

                                <Stack
                                    direction={{
                                        xs:'column',
                                        sm:'row'
                                    }}
                                    spacing={1}
                                    sx={{
                                        minWidth:{
                                            xs:'100%',
                                            sm:230
                                        }
                                    }}
                                >
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={
                                            isLoading?
                                                <CircularProgress
                                                    size={18}
                                                    color="inherit"
                                                />:
                                                <CheckCircleOutlineOutlinedIcon/>
                                        }
                                        disabled={
                                            requestLoading||
                                            isLoading
                                        }
                                        onClick={()=>
                                            handleAction(
                                                acceptConnectionRequest,
                                                user._id
                                            )
                                        }
                                        fullWidth
                                        sx={{
                                            borderRadius:2.5
                                        }}
                                    >
                                        {isLoading?
                                            t('Accepting...'):
                                            t('Accept')}
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={
                                            isLoading?
                                                <CircularProgress
                                                    size={18}
                                                    color="inherit"
                                                />:
                                                <PersonAddDisabledOutlinedIcon/>
                                        }
                                        disabled={
                                            requestLoading||
                                            isLoading
                                        }
                                        onClick={()=>
                                            handleAction(
                                                declineConnectionRequest,
                                                user._id
                                            )
                                        }
                                        fullWidth
                                        sx={{
                                            borderRadius:2.5
                                        }}
                                    >
                                        {isLoading?
                                            t('Processing...'):
                                            t('Decline')}
                                    </Button>
                                </Stack>
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>
        );
    };

    const renderOutgoingRequests=()=>{
        if(!outgoingRequests.length){
            return(
                <Alert severity="info">
                    {t('You do not have any outgoing connection requests.')}
                </Alert>
            );
        }

        return(
            <Stack spacing={1.5}>
                {outgoingRequests.map(request=>{
                    const user=getOutgoingUser(request);
                    const isLoading=
                        actionUserId===user?._id;

                    return(
                        <Box
                            key={
                                request._id||
                                user._id
                            }
                            sx={{
                                p:{xs:1.5,sm:2},
                                border:1,
                                borderColor:'divider',
                                borderRadius:3,
                                bgcolor:'background.paper'
                            }}
                        >
                            <Stack
                                direction={{
                                    xs:'column',
                                    sm:'row'
                                }}
                                spacing={2}
                                alignItems={{
                                    xs:'stretch',
                                    sm:'center'
                                }}
                            >
                                <Box
                                    sx={{
                                        flex:1,
                                        minWidth:0
                                    }}
                                >
                                    <UserCard
                                        user={user}
                                        connectionStatus={
                                            'outgoing_pending'
                                        }
                                        onOpenProfile={setSelectedProfileId}
                                    />
                                </Box>

                                <Button
                                    variant="outlined"
                                    color="warning"
                                    startIcon={
                                        isLoading?
                                            <CircularProgress
                                                size={18}
                                            />:
                                            <PersonAddDisabledOutlinedIcon/>
                                    }
                                    disabled={
                                        requestLoading||
                                        isLoading
                                    }
                                    onClick={()=>
                                        handleAction(
                                            cancelConnectionRequest,
                                            user._id
                                        )
                                    }
                                    fullWidth
                                    sx={{
                                        borderRadius:2.5,
                                        minWidth:{
                                            sm:200
                                        }
                                    }}
                                >
                                    {isLoading?
                                        t('Cancelling...'):
                                        t('Cancel Request')}
                                </Button>
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>
        );
    };

    const renderCurrentTab=()=>{
        if(tab===0){
            return renderConnections();
        }

        if(tab===1){
            return renderIncomingRequests();
        }

        return renderOutgoingRequests();
    };

    return(
        <Container
            maxWidth="md"
            sx={{
                py:{xs:2,sm:4},
                pb:{xs:10,sm:6}
            }}
        >
            <Stack spacing={2.5}>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{
                            fontSize:{
                                xs:'1.8rem',
                                sm:'2.2rem'
                            }
                        }}
                    >
                        {t('Connections')}
                    </Typography>

                    <Typography
                        color="text.secondary"
                        sx={{mt:.5}}
                    >
                        {t('Connect with farmers, buyers and agricultural professionals across RoamAgro.')}
                    </Typography>
                </Box>

                <TextField
                    fullWidth
                    value={search}
                    onChange={event=>
                        setSearch(
                            event.target.value
                        )
                    }
                    placeholder={t(
                        'Search users by name, location or email'
                    )}
                    InputProps={{
                        startAdornment:(
                            <InputAdornment position="start">
                                <SearchOutlinedIcon/>
                            </InputAdornment>
                        )
                    }}
                    helperText={
                        search.trim().length===1
                            ?t('Enter at least 2 characters to search.')
                            :undefined
                    }
                />

                {search.trim().length>=2?(
                    <>
                        {searchError&&(
                            <Alert severity="error">
                                {searchError}
                            </Alert>
                        )}

                        {displayedLoading?(
                            <Box
                                display="flex"
                                justifyContent="center"
                                py={6}
                            >
                                <CircularProgress/>
                            </Box>
                        ):(
                            renderSearchResults()
                        )}
                    </>
                ):(
                    <>
                        <Stack
                            direction={{
                                xs:'column',
                                sm:'row'
                            }}
                            spacing={1}
                        >
                            <Button
                                variant={
                                    tab===0?
                                        'contained':
                                        'outlined'
                                }
                                startIcon={
                                    <PeopleAltOutlinedIcon/>
                                }
                                onClick={()=>
                                    setTab(0)
                                }
                                fullWidth
                            >
                                {t('Connections')} ({
                                    connections.length
                                })
                            </Button>

                            <Button
                                variant={
                                    tab===1?
                                        'contained':
                                        'outlined'
                                }
                                startIcon={
                                    <PersonAddOutlinedIcon/>
                                }
                                onClick={()=>
                                    setTab(1)
                                }
                                fullWidth
                            >
                                {t('Incoming')} ({
                                    incomingRequests.length
                                })
                            </Button>

                            <Button
                                variant={
                                    tab===2?
                                        'contained':
                                        'outlined'
                                }
                                startIcon={
                                    <PersonAddOutlinedIcon/>
                                }
                                onClick={()=>
                                    setTab(2)
                                }
                                fullWidth
                            >
                                {t('Outgoing')} ({
                                    outgoingRequests.length
                                })
                            </Button>
                        </Stack>

                        <Box>
                            <Tabs
                                value={tab}
                                onChange={
                                    handleTabChange
                                }
                                variant="fullWidth"
                            >
                                <Tab
                                    label={
                                        t('Connections')
                                    }
                                />
                                <Tab
                                    label={
                                        t('Incoming Requests')
                                    }
                                />
                                <Tab
                                    label={
                                        t('Outgoing Requests')
                                    }
                                />
                            </Tabs>
                        </Box>

                        {error&&(
                            <Alert severity="error">
                                {error}
                            </Alert>
                        )}

                        <Divider/>

                        {displayedLoading?(
                            <Box
                                display="flex"
                                justifyContent="center"
                                py={6}
                            >
                                <CircularProgress/>
                            </Box>
                        ):(
                            renderCurrentTab()
                        )}

                        <Divider
                            sx={{my:2}}
                        />

                        <Box>
                            <Stack
                                spacing={.5}
                                sx={{mb:2}}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                >
                                    {t('People You May Know')}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('Discover other RoamAgro users you may want to connect with.')}
                                </Typography>
                            </Stack>

                            {discoveryError&&(
                                <Alert
                                    severity="error"
                                    sx={{mb:2}}
                                >
                                    {discoveryError}
                                </Alert>
                            )}

                            {discoveryLoading?(
                                <Box
                                    display="flex"
                                    justifyContent="center"
                                    py={4}
                                >
                                    <CircularProgress/>
                                </Box>
                            ):discoveredUsers.length?(
                                <Stack spacing={1.5}>
                                    {discoveredUsers.map(user=>(
                                        <UserCard
                                            key={user._id}
                                            user={user}
                                            connectionStatus={
                                                user.connectionStatus||'none'
                                            }
                                            onOpenProfile={setSelectedProfileId}
                                            onConnectionChange={()=>{
                                                refreshDiscovery();
                                                refreshConnections();
                                            }}
                                        />
                                    ))}
                                </Stack>
                            ):(
                                <Alert severity="info">
                                    {t('We do not have any new user suggestions right now.')}
                                </Alert>
                            )}
                        </Box>
                    </>
                )}
            </Stack>
        </Container>
    );
};

export default Connections;