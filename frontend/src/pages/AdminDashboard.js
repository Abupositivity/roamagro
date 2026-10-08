import React,{useCallback,useEffect,useRef,useState}from'react';
import{
    Alert,Box,Button,Card,CardContent,CircularProgress,FormControl,
    Grid,InputLabel,MenuItem,Select,Snackbar,Stack,TextField,Typography
}from'@mui/material';
import PeopleOutlinedIcon from'@mui/icons-material/PeopleOutlined';
import AgricultureOutlinedIcon from'@mui/icons-material/AgricultureOutlined';
import StorefrontOutlinedIcon from'@mui/icons-material/StorefrontOutlined';
import GroupsOutlinedIcon from'@mui/icons-material/GroupsOutlined';
import LightbulbOutlinedIcon from'@mui/icons-material/LightbulbOutlined';
import ReportProblemOutlinedIcon from'@mui/icons-material/ReportProblemOutlined';
import ArrowForwardIosIcon from'@mui/icons-material/ArrowForwardIos';
import SearchOutlinedIcon from'@mui/icons-material/SearchOutlined';
import{useDispatch,useSelector}from'react-redux';
import{useTranslation}from'react-i18next';
import{useNavigate}from'react-router-dom';

import PageLayout from'../components/layout/PageLayout';
import DashboardHeader from'../components/dashboard/DashboardHeader';
import SummaryCards from'../components/dashboard/SummaryCards';
import QuickActions from'../components/dashboard/QuickActions';
import RecentProjects from'../components/dashboard/RecentProjects';
import MarketplacePreview from'../components/dashboard/MarketplacePreview';
import PriceTicker from'../components/dashboard/PriceTicker';
import AgriFeed from'../components/community/AgriFeed';
import ExtensionTipForm from'../components/community/ExtensionTipForm';
import{refreshDashboard}from'../redux/actions/dashboardActions';
import api from'../services/api';

const REFRESH_INTERVAL=60*1000;
const STALE_TIME=30*1000;

const ROLE_OPTIONS=[
    {value:'farmer',label:'Farmer'},
    {value:'buyer',label:'Buyer'},
    {value:'extension_officer',label:'Extension Officer'},
    {value:'admin',label:'Administrator'},
];

const AdminDashboard=()=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const{loading,error,dashboard,lastUpdated}=useSelector(state=>state.dashboard);
    const authUser=useSelector(state=>state.auth?.user);

    const refreshInProgress=useRef(false);
    const mountedRef=useRef(true);

    const[feedRefreshKey,setFeedRefreshKey]=useState(0);
    const[roleDrafts,setRoleDrafts]=useState({});
    const[roleUpdatingId,setRoleUpdatingId]=useState(null);
    const[userSearch,setUserSearch]=useState('');
    const[searchResults,setSearchResults]=useState([]);
    const[searchLoading,setSearchLoading]=useState(false);
    const[searchError,setSearchError]=useState('');
    const[hasSearched,setHasSearched]=useState(false);
    const[snackbar,setSnackbar]=useState({
        open:false,message:'',severity:'success'
    });

    const refresh=useCallback(async(silent=true)=>{
        if(refreshInProgress.current||document.visibilityState!=='visible')return;
        refreshInProgress.current=true;
        try{
            await dispatch(refreshDashboard({type:'/admin',silent}));
        }finally{
            if(mountedRef.current)refreshInProgress.current=false;
        }
    },[dispatch]);

    useEffect(()=>{
        mountedRef.current=true;

        const loadDashboard=async()=>{
            if(refreshInProgress.current)return;
            refreshInProgress.current=true;
            try{
                await dispatch(refreshDashboard({type:'/admin',silent:false}));
            }finally{
                if(mountedRef.current)refreshInProgress.current=false;
            }
        };

        loadDashboard();
        return()=>{mountedRef.current=false};
    },[dispatch]);

    useEffect(()=>{
        const interval=window.setInterval(()=>refresh(true),REFRESH_INTERVAL);
        return()=>window.clearInterval(interval);
    },[refresh]);

    useEffect(()=>{
        const handleVisibilityChange=()=>{
            if(document.visibilityState!=='visible')return;
            const updatedAt=lastUpdated||0;
            if(!updatedAt||Date.now()-updatedAt>=STALE_TIME)refresh(true);
        };

        document.addEventListener('visibilitychange',handleVisibilityChange);
        return()=>document.removeEventListener('visibilitychange',handleVisibilityChange);
    },[lastUpdated,refresh]);

    useEffect(()=>{
        const handleRefresh=event=>{
            if(event.detail?.route==='/admin/dashboard')refresh(true);
        };

        window.addEventListener('roamagro:refresh-page',handleRefresh);
        return()=>window.removeEventListener('roamagro:refresh-page',handleRefresh);
    },[refresh]);

    useEffect(()=>{
        const latestUsers=dashboard?.admin?.latestUsers||[];
        const drafts={};
        latestUsers.forEach(user=>{drafts[user._id]=user.role||'farmer'});
        setRoleDrafts(previous=>({...drafts,...previous}));
    },[dashboard?.admin?.latestUsers]);

    const showSnackbar=(message,severity='success')=>
        setSnackbar({open:true,message,severity});

    const closeSnackbar=()=>
        setSnackbar(previous=>({...previous,open:false}));

    const handleUserSearch=async()=>{
        const search=userSearch.trim();
        setSearchError('');

        if(!search){
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        if(search.length<2){
            setSearchError(t('Enter at least 2 characters to search.'));
            setSearchResults([]);
            setHasSearched(false);
            return;
        }

        setSearchLoading(true);
        setHasSearched(true);

        try{
            const response=await api.get(
                `/users/admin/search?search=${encodeURIComponent(search)}`
            );
            const users=response?.data?.data;
            setSearchResults(Array.isArray(users)?users:[]);
        }catch(requestError){
            setSearchResults([]);
            setSearchError(
                requestError?.response?.data?.message||
                t('Unable to search users. Please try again.')
            );
        }finally{
            if(mountedRef.current)setSearchLoading(false);
        }
    };

    const handleSearchKeyDown=event=>{
        if(event.key==='Enter')handleUserSearch();
    };

    const handleRoleChange=(userId,role)=>
        setRoleDrafts(previous=>({...previous,[userId]:role}));

    const handleRoleSave=async user=>{
        const newRole=roleDrafts[user._id]||user.role||'farmer';

        if(newRole===user.role)return;

        if(String(user._id)===String(authUser?._id)){
            showSnackbar(t('You cannot change your own role.'),'error');
            return;
        }

        setRoleUpdatingId(user._id);

        try{
            const response=await api.patch(
                `/users/admin/${user._id}/role`,
                {role:newRole}
            );

            setSearchResults(previous=>previous.map(item=>
                String(item._id)===String(user._id)
                    ?{...item,role:newRole}
                    :item
            ));

            showSnackbar(
                response?.data?.message||
                t('User role updated successfully.')
            );

            await refresh(true);
        }catch(requestError){
            setRoleDrafts(previous=>({
                ...previous,
                [user._id]:user.role
            }));

            showSnackbar(
                requestError?.response?.data?.message||
                t('Unable to update the user role. Please try again.'),
                'error'
            );
        }finally{
            if(mountedRef.current)setRoleUpdatingId(null);
        }
    };

    const renderRoleEditor=user=>{
        const isSelf=String(user._id)===String(authUser?._id);
        const currentRole=user.role||'farmer';
        const selectedRole=roleDrafts[user._id]||currentRole;
        const changed=selectedRole!==currentRole;
        const updating=roleUpdatingId===user._id;

        return(
            <Stack
                direction={{xs:'column',sm:'row'}}
                spacing={1}
                alignItems={{xs:'stretch',sm:'center'}}
            >
                <FormControl
                    size="small"
                    sx={{minWidth:{xs:'100%',sm:190}}}
                >
                    <InputLabel>{t('Role')}</InputLabel>
                    <Select
                        value={selectedRole}
                        label={t('Role')}
                        disabled={isSelf||updating}
                        onChange={event=>
                            handleRoleChange(user._id,event.target.value)
                        }
                    >
                        {ROLE_OPTIONS.map(option=>(
                            <MenuItem key={option.value} value={option.value}>
                                {t(option.label)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <Button
                    variant="contained"
                    size="small"
                    disabled={isSelf||!changed||updating}
                    onClick={()=>handleRoleSave(user)}
                    sx={{minWidth:90,borderRadius:2}}
                >
                    {updating?
                        <CircularProgress size={20} color="inherit"/>:
                        t('Save')
                    }
                </Button>
            </Stack>
        );
    };

    const renderUserItem=user=>{
        const isSelf=String(user._id)===String(authUser?._id);

        return(
            <Box
                key={user._id}
                sx={{
                    p:2,
                    border:'1px solid',
                    borderColor:'divider',
                    borderRadius:2.5
                }}
            >
                <Stack
                    direction={{xs:'column',md:'row'}}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{xs:'stretch',md:'center'}}
                >
                    <Box sx={{minWidth:0,flex:1}}>
                        <Typography
                            fontWeight={600}
                            sx={{wordBreak:'break-word'}}
                        >
                            {user.name}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{wordBreak:'break-word'}}
                        >
                            {user.email}
                        </Typography>

                        {user.accountStatus&&(
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                            >
                                {t('Status')}: {user.accountStatus}
                            </Typography>
                        )}

                        {isSelf&&(
                            <Typography
                                variant="caption"
                                color="primary.main"
                                display="block"
                            >
                                {t('Current administrator')}
                            </Typography>
                        )}
                    </Box>

                    {renderRoleEditor(user)}
                </Stack>
            </Box>
        );
    };

    if(loading&&!dashboard){
        return(
            <PageLayout>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                >
                    <CircularProgress/>
                </Box>
            </PageLayout>
        );
    }

    if(error&&!dashboard){
        return(
            <PageLayout>
                <Alert severity="error">{error}</Alert>
            </PageLayout>
        );
    }

    const summary=dashboard?.admin?.summary||dashboard?.summary||{};
    const latestUsers=dashboard?.admin?.latestUsers||[];

    const cards=[
        {title:t('Total Users'),value:summary.totalUsers||0,icon:<PeopleOutlinedIcon/>},
        {title:t('Farmers'),value:summary.farmers||0,icon:<AgricultureOutlinedIcon/>},
        {title:t('Extension Officers'),value:summary.extensionOfficers||0,icon:<GroupsOutlinedIcon/>},
        {title:t('Farm Projects'),value:summary.totalProjects||0,icon:<AgricultureOutlinedIcon/>},
        {title:t('Marketplace Listings'),value:summary.totalListings||0,icon:<StorefrontOutlinedIcon/>},
        {title:t('Community Posts'),value:summary.communityPosts||0,icon:<GroupsOutlinedIcon/>},
        {title:t('Published Tips'),value:summary.publishedTips||0,icon:<LightbulbOutlinedIcon/>},
    ];

    const handleTipPublished=async()=>{
        setFeedRefreshKey(previous=>previous+1);
        await refresh(true);
    };

    return(
        <PageLayout>
            <Stack spacing={3}>
                <DashboardHeader/>
                <SummaryCards/>
                <QuickActions/>
                <RecentProjects/>
                <MarketplacePreview/>
                <PriceTicker/>

                <Box>
                    <Typography variant="h4" fontWeight={700}>
                        {t('Admin Dashboard')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={1}>
                        {t('Manage and monitor RoamAgro activity.')}
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {cards.map(card=>(
                        <Grid item xs={12} sm={6} md={4} key={card.title}>
                            <Card elevation={2} sx={{height:'100%',borderRadius:3}}>
                                <CardContent>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box
                                            sx={{
                                                display:'flex',
                                                alignItems:'center',
                                                justifyContent:'center',
                                                width:45,
                                                height:45,
                                                borderRadius:2,
                                                bgcolor:'primary.main',
                                                color:'white'
                                            }}
                                        >
                                            {card.icon}
                                        </Box>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary">
                                                {card.title}
                                            </Typography>
                                            <Typography variant="h5" fontWeight={700}>
                                                {card.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Card
                    elevation={2}
                    sx={{
                        borderRadius:3,
                        borderLeft:'5px solid',
                        borderColor:'warning.main'
                    }}
                >
                    <CardContent>
                        <Stack
                            direction={{xs:'column',sm:'row'}}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{xs:'stretch',sm:'center'}}
                        >
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Box
                                    sx={{
                                        display:'flex',
                                        alignItems:'center',
                                        justifyContent:'center',
                                        width:48,
                                        height:48,
                                        borderRadius:2,
                                        bgcolor:'warning.light',
                                        color:'warning.dark',
                                        flexShrink:0
                                    }}
                                >
                                    <ReportProblemOutlinedIcon/>
                                </Box>

                                <Box>
                                    <Typography variant="h6" fontWeight={800}>
                                        {t('User Reports')}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{mt:.25}}>
                                        {t('Review reports, add admin notes and manage reported accounts.')}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="contained"
                                endIcon={<ArrowForwardIosIcon sx={{fontSize:'12px!important'}}/>}
                                onClick={()=>navigate('/admin/reports')}
                                sx={{
                                    borderRadius:2.5,
                                    alignSelf:{xs:'flex-start',sm:'auto'}
                                }}
                            >
                                {t('Manage Reports')}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                <Card elevation={2} sx={{borderRadius:3}}>
                    <CardContent>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {t('Search Users')}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{mt:.5}}>
                                    {t('Search for a user by name or email to update their role.')}
                                </Typography>
                            </Box>

                            <Stack direction={{xs:'column',sm:'row'}} spacing={1}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={userSearch}
                                    onChange={event=>{
                                        setUserSearch(event.target.value);
                                        setSearchError('');
                                    }}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder={t('Enter name or email')}
                                    label={t('Search users')}
                                    InputProps={{
                                        startAdornment:<SearchOutlinedIcon sx={{mr:1,color:'text.secondary'}}/>
                                    }}
                                />

                                <Button
                                    variant="contained"
                                    onClick={handleUserSearch}
                                    disabled={searchLoading}
                                    sx={{
                                        minWidth:{xs:'100%',sm:120},
                                        borderRadius:2
                                    }}
                                >
                                    {searchLoading?
                                        <CircularProgress size={20} color="inherit"/>:
                                        t('Search')
                                    }
                                </Button>
                            </Stack>

                            {searchError&&<Alert severity="error">{searchError}</Alert>}

                            {hasSearched&&!searchLoading&&!searchResults.length&&!searchError&&(
                                <Alert severity="info">{t('No users found.')}</Alert>
                            )}

                            {searchResults.length>0&&(
                                <Stack spacing={1.5}>
                                    {searchResults.map(renderUserItem)}
                                </Stack>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <Card elevation={2} sx={{borderRadius:3}}>
                    <CardContent>
                        <Stack spacing={.5} sx={{mb:2}}>
                            <Typography variant="h6" fontWeight={700}>
                                {t('User Management')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('Manage roles for recently registered users.')}
                            </Typography>
                        </Stack>

                        <Stack spacing={1.5}>
                            {latestUsers.length?
                                latestUsers.map(renderUserItem):
                                <Typography color="text.secondary">
                                    {t('No users available.')}
                                </Typography>
                            }
                        </Stack>
                    </CardContent>
                </Card>

                <ExtensionTipForm onPublished={handleTipPublished}/>

                <Box>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
                        {t('Agri-Feed')}🌱
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        {t('Daily agricultural tips and best practices shared by agricultural experts.')}
                    </Typography>
                    <AgriFeed refreshKey={feedRefreshKey}/>
                </Box>
            </Stack>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={3500}
                onClose={closeSnackbar}
                anchorOrigin={{vertical:'bottom',horizontal:'center'}}
            >
                <Alert
                    severity={snackbar.severity}
                    variant="filled"
                    onClose={closeSnackbar}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </PageLayout>
    );
};

export default AdminDashboard;