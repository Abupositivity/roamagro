import React,{useEffect}from'react';
import{Alert,Avatar,Box,Button,Card,CardContent,Chip,CircularProgress,Container,Divider,Grid,Stack,Typography}from'@mui/material';
import ArrowBackIcon from'@mui/icons-material/ArrowBack';
import PeopleAltOutlinedIcon from'@mui/icons-material/PeopleAltOutlined';
import StorefrontOutlinedIcon from'@mui/icons-material/StorefrontOutlined';
import ForumOutlinedIcon from'@mui/icons-material/ForumOutlined';
import BadgeOutlinedIcon from'@mui/icons-material/BadgeOutlined';
import LocationOnOutlinedIcon from'@mui/icons-material/LocationOnOutlined';
import {useDispatch,useSelector}from'react-redux';
import{useTranslation}from'react-i18next';
import{getPublicProfile}from'../../redux/actions/connectionActions';
import ConnectionButton from'./ConnectionButton';

const getInitials=name=>name?.split(' ').filter(Boolean).slice(0,2).map(part=>part.charAt(0).toUpperCase()).join('')||'U';
const getRoleLabel=role=>({farmer:'Farmer',buyer:'Buyer',extension_officer:'Extension Officer',admin:'Administrator'}[role]||'User');

const PublicProfile=({userId,onBack})=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();
    const{publicProfile,loading,error}=useSelector(state=>state.connections||state.connection);
    const profile=publicProfile?.user;
    const status=publicProfile?.connectionStatus||'none';

    useEffect(()=>{
        if(userId)dispatch(getPublicProfile(userId));
    },[dispatch,userId]);

    const handleConnectionChange=()=>dispatch(getPublicProfile(userId));

    if(loading&&!profile)return <Container sx={{py:6,display:'flex',justifyContent:'center'}}><CircularProgress/></Container>;
    if(error&&!profile)return <Container sx={{py:3}}><Button startIcon={<ArrowBackIcon/>} onClick={onBack}>{t('Back')}</Button><Alert severity="error" sx={{mt:2}}>{error}</Alert></Container>;
    if(!profile)return null;

    const initials=getInitials(profile.name);
    const stats=publicProfile.stats||{};
    const marketplaceListings=publicProfile.marketplaceListings||[];
    const communityPosts=publicProfile.communityPosts||[];

    return(
        <Container maxWidth="md" sx={{py:{xs:2,sm:4},pb:{xs:10,sm:6}}}>
            <Stack spacing={2.5}>
                <Button startIcon={<ArrowBackIcon/>} onClick={onBack} sx={{alignSelf:'flex-start'}}>{t('Back to Connections')}</Button>
                <Card elevation={2} sx={{borderRadius:4,overflow:'hidden'}}>
                    <Box sx={{height:{xs:90,sm:130},background:'linear-gradient(135deg,#00BF63 0%,#008f4a 100%)'}}/>
                    <CardContent sx={{mt:{xs:-6,sm:-7},px:{xs:2,sm:4},pb:3}}>
                        <Stack direction={{xs:'column',sm:'row'}} spacing={2} alignItems={{xs:'center',sm:'flex-end'}}>
                            <Avatar src={profile.profilePhoto||undefined} sx={{width:{xs:104,sm:124},height:{xs:104,sm:124},border:'5px solid',borderColor:'background.paper',bgcolor:'primary.main',fontSize:38,fontWeight:700}}>{!profile.profilePhoto&&initials}</Avatar>
                            <Box sx={{flex:1,minWidth:0,textAlign:{xs:'center',sm:'left'}}}>
                                <Typography variant="h5" fontWeight={800}>{profile.name}</Typography>
                                <Chip icon={<BadgeOutlinedIcon/>} label={getRoleLabel(profile.role)} size="small" color="success" variant="outlined" sx={{mt:1}}/>
                                {(profile.state||profile.location)&&<Stack direction="row" spacing={.5} justifyContent={{xs:'center',sm:'flex-start'}} alignItems="center" sx={{mt:1}}><LocationOnOutlinedIcon fontSize="small" color="action"/><Typography variant="body2" color="text.secondary">{[profile.location,profile.state].filter(Boolean).join(', ')}</Typography></Stack>}
                            </Box>
                            <ConnectionButton userId={profile._id} userName={profile.name} status={status} onChange={handleConnectionChange} fullWidth/>
                        </Stack>
                    </CardContent>
                </Card>

                {profile.bio&&<Card elevation={1} sx={{borderRadius:4}}><CardContent><Typography variant="h6" fontWeight={800} mb={1}>{t('About')}</Typography><Typography color="text.secondary" sx={{whiteSpace:'pre-wrap'}}>{profile.bio}</Typography></CardContent></Card>}

                <Grid container spacing={1.5}>
                    <Grid item xs={4}><Card sx={{borderRadius:3}}><CardContent sx={{textAlign:'center'}}><PeopleAltOutlinedIcon color="primary"/><Typography variant="h6" fontWeight={800}>{stats.connections||0}</Typography><Typography variant="caption" color="text.secondary">{t('Connections')}</Typography></CardContent></Card></Grid>
                    <Grid item xs={4}><Card sx={{borderRadius:3}}><CardContent sx={{textAlign:'center'}}><StorefrontOutlinedIcon color="primary"/><Typography variant="h6" fontWeight={800}>{stats.marketplaceListings||0}</Typography><Typography variant="caption" color="text.secondary">{t('Listings')}</Typography></CardContent></Card></Grid>
                    <Grid item xs={4}><Card sx={{borderRadius:3}}><CardContent sx={{textAlign:'center'}}><ForumOutlinedIcon color="primary"/><Typography variant="h6" fontWeight={800}>{stats.communityPosts||0}</Typography><Typography variant="caption" color="text.secondary">{t('Posts')}</Typography></CardContent></Card></Grid>
                </Grid>

                <Card elevation={1} sx={{borderRadius:4}}><CardContent><Typography variant="h6" fontWeight={800}>{t('Marketplace Listings')}</Typography><Divider sx={{my:1.5}}/>{marketplaceListings.length?<Stack spacing={1.5}>{marketplaceListings.map(item=><Box key={item._id}><Typography fontWeight={700}>{item.title}</Typography><Typography variant="body2" color="text.secondary">{item.category} · ₦{Number(item.price||0).toLocaleString()} · {item.available?t('Available'):t('Sold')}</Typography></Box>)}</Stack>:<Typography color="text.secondary">{t('No marketplace listings yet.')}</Typography>}</CardContent></Card>

                <Card elevation={1} sx={{borderRadius:4}}><CardContent><Typography variant="h6" fontWeight={800}>{t('Community Posts')}</Typography><Divider sx={{my:1.5}}/>{communityPosts.length?<Stack spacing={2}>{communityPosts.map(post=><Box key={post._id}><Typography fontWeight={700}>{post.title}</Typography><Typography variant="body2" color="text.secondary" sx={{display:'-webkit-box',WebkitLineClamp:3,WebkitBoxOrient:'vertical',overflow:'hidden'}}>{post.content}</Typography><Chip size="small" label={post.category} variant="outlined" sx={{mt:1}}/></Box>)}</Stack>:<Typography color="text.secondary">{t('No community posts yet.')}</Typography>}</CardContent></Card>
            </Stack>
        </Container>
    );
};

export default PublicProfile;