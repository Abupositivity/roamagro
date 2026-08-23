import React,{useEffect,useState}from'react';
import{Alert,Avatar,Box,Button,Card,CardContent,Chip,CircularProgress,Container,Dialog,DialogActions,DialogContent,DialogTitle,Divider,Grid,MenuItem,Stack,TextField,Typography}from'@mui/material';
import ArrowBackIcon from'@mui/icons-material/ArrowBack';
import PeopleAltOutlinedIcon from'@mui/icons-material/PeopleAltOutlined';
import StorefrontOutlinedIcon from'@mui/icons-material/StorefrontOutlined';
import ForumOutlinedIcon from'@mui/icons-material/ForumOutlined';
import BadgeOutlinedIcon from'@mui/icons-material/BadgeOutlined';
import LocationOnOutlinedIcon from'@mui/icons-material/LocationOnOutlined';
import{useDispatch,useSelector}from'react-redux';
import{useTranslation}from'react-i18next';
import{getPublicProfile}from'../../redux/actions/connectionActions';
import ConnectionButton from'./ConnectionButton';
import api from'../../services/api';

const getInitials=name=>name?.split(' ').filter(Boolean).slice(0,2).map(part=>part.charAt(0).toUpperCase()).join('')||'U';

const getRoleLabel=role=>({
    farmer:'Farmer',
    buyer:'Buyer',
    extension_officer:'Extension Officer',
    admin:'Administrator'
}[role]||'User');

const REPORT_REASONS=[
    'Spam',
    'Harassment or bullying',
    'Inappropriate content',
    'Impersonation',
    'Fraud or scam',
    'Hate or abusive behavior',
    'Other'
];

const PublicProfile=({userId,onBack})=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();

    const{publicProfile,loading,error}=useSelector(
        state=>state.connections||state.connection
    );

    const profile=publicProfile?.user;
    const status=publicProfile?.connectionStatus||'none';

    const[reportOpen,setReportOpen]=useState(false);
    const[reportReason,setReportReason]=useState('');
    const[reportDescription,setReportDescription]=useState('');
    const[reportLoading,setReportLoading]=useState(false);
    const[reportError,setReportError]=useState('');
    const[reportSuccess,setReportSuccess]=useState(false);

    useEffect(()=>{
        if(userId){
            dispatch(getPublicProfile(userId));
        }
    },[dispatch,userId]);

    const handleConnectionChange=()=>{
        dispatch(getPublicProfile(userId));
    };

    const openReport=()=>{
        setReportReason('');
        setReportDescription('');
        setReportError('');
        setReportSuccess(false);
        setReportOpen(true);
    };

    const closeReport=()=>{
        if(reportLoading)return;

        setReportOpen(false);
        setReportError('');
    };

    const submitReport=async()=>{
        setReportError('');

        if(!reportReason){
            setReportError(
                t('Please select a reason for this report.')
            );
            return;
        }

        if(reportDescription.trim().length>1000){
            setReportError(
                t('Report details must not exceed 1000 characters.')
            );
            return;
        }

        setReportLoading(true);

        try{
            await api.reportUser(userId,{
                reason:reportReason,
                description:reportDescription.trim()
            });

            setReportSuccess(true);
            setReportReason('');
            setReportDescription('');
        }catch(requestError){
            setReportError(
                requestError.response?.data?.message||
                t('Unable to submit this report. Please try again.')
            );
        }finally{
            setReportLoading(false);
        }
    };

    if(loading&&!profile){
        return(
            <Container
                sx={{
                    py:6,
                    display:'flex',
                    justifyContent:'center'
                }}
            >
                <CircularProgress/>
            </Container>
        );
    }

    if(error&&!profile){
        return(
            <Container sx={{py:3}}>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={onBack}
                >
                    {t('Back')}
                </Button>

                <Alert
                    severity="error"
                    sx={{mt:2}}
                >
                    {error}
                </Alert>
            </Container>
        );
    }

    if(!profile)return null;

    const initials=getInitials(profile.name);
    const stats=publicProfile.stats||{};
    const marketplaceListings=
        publicProfile.marketplaceListings||[];
    const communityPosts=
        publicProfile.communityPosts||[];

    return(
        <Container
            maxWidth="md"
            sx={{
                py:{
                    xs:2,
                    sm:4
                },
                pb:{
                    xs:10,
                    sm:6
                }
            }}
        >
            <Stack spacing={2.5}>
                <Button
                    startIcon={<ArrowBackIcon/>}
                    onClick={onBack}
                    sx={{
                        alignSelf:'flex-start'
                    }}
                >
                    {t('Back to Connections')}
                </Button>

                <Card
                    elevation={2}
                    sx={{
                        borderRadius:4,
                        overflow:'hidden'
                    }}
                >
                    <Box
                        sx={{
                            height:{
                                xs:90,
                                sm:130
                            },
                            background:
                                'linear-gradient(135deg,#00BF63 0%,#008f4a 100%)'
                        }}
                    />

                    <CardContent
                        sx={{
                            mt:{
                                xs:-6,
                                sm:-7
                            },
                            px:{
                                xs:2,
                                sm:4
                            },
                            pb:3
                        }}
                    >
                        <Stack
                            direction={{
                                xs:'column',
                                sm:'row'
                            }}
                            spacing={2}
                            alignItems={{
                                xs:'center',
                                sm:'flex-end'
                            }}
                        >
                            <Avatar
                                src={
                                    profile.profilePhoto||
                                    undefined
                                }
                                sx={{
                                    width:{
                                        xs:104,
                                        sm:124
                                    },
                                    height:{
                                        xs:104,
                                        sm:124
                                    },
                                    border:'5px solid',
                                    borderColor:
                                        'background.paper',
                                    bgcolor:'primary.main',
                                    fontSize:38,
                                    fontWeight:700
                                }}
                            >
                                {!profile.profilePhoto&&
                                    initials}
                            </Avatar>

                            <Box
                                sx={{
                                    flex:1,
                                    minWidth:0,
                                    textAlign:{
                                        xs:'center',
                                        sm:'left'
                                    }
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    fontWeight={800}
                                    sx={{
                                        overflowWrap:'anywhere'
                                    }}
                                >
                                    {profile.name}
                                </Typography>

                                <Chip
                                    icon={
                                        <BadgeOutlinedIcon/>
                                    }
                                    label={getRoleLabel(profile.role)}
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                    sx={{mt:1}}
                                />

                                {(profile.state||
                                    profile.location)&&(
                                    <Stack
                                        direction="row"
                                        spacing={.5}
                                        justifyContent={{
                                            xs:'center',
                                            sm:'flex-start'
                                        }}
                                        alignItems="center"
                                        sx={{mt:1}}
                                    >
                                        <LocationOnOutlinedIcon
                                            fontSize="small"
                                            color="action"
                                        />

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                overflowWrap:
                                                    'anywhere'
                                            }}
                                        >
                                            {[
                                                profile.location,
                                                profile.state
                                            ]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </Typography>
                                    </Stack>
                                )}
                            </Box>

                            <Box
                                sx={{
                                    width:{
                                        xs:'100%',
                                        sm:'auto'
                                    },
                                    minWidth:{
                                        sm:180
                                    }
                                }}
                            >
                                <ConnectionButton
                                    userId={profile._id}
                                    userName={profile.name}
                                    status={status}
                                    onChange={
                                        handleConnectionChange
                                    }
                                    onReport={openReport}
                                    fullWidth
                                />
                            </Box>
                        </Stack>
                    </CardContent>
                </Card>

                {profile.bio&&(
                    <Card
                        elevation={1}
                        sx={{borderRadius:4}}
                    >
                        <CardContent>
                            <Typography
                                variant="h6"
                                fontWeight={800}
                                mb={1}
                            >
                                {t('About')}
                            </Typography>

                            <Typography
                                color="text.secondary"
                                sx={{
                                    whiteSpace:'pre-wrap',
                                    wordBreak:'break-word'
                                }}
                            >
                                {profile.bio}
                            </Typography>
                        </CardContent>
                    </Card>
                )}

                <Grid
                    container
                    spacing={1.5}
                >
                    <Grid item xs={4}>
                        <Card sx={{borderRadius:3}}>
                            <CardContent
                                sx={{
                                    textAlign:'center'
                                }}
                            >
                                <PeopleAltOutlinedIcon
                                    color="primary"
                                />

                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                >
                                    {stats.connections||0}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t('Connections')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={4}>
                        <Card sx={{borderRadius:3}}>
                            <CardContent
                                sx={{
                                    textAlign:'center'
                                }}
                            >
                                <StorefrontOutlinedIcon
                                    color="primary"
                                />

                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                >
                                    {stats.marketplaceListings||0}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t('Listings')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>

                    <Grid item xs={4}>
                        <Card sx={{borderRadius:3}}>
                            <CardContent
                                sx={{
                                    textAlign:'center'
                                }}
                            >
                                <ForumOutlinedIcon
                                    color="primary"
                                />

                                <Typography
                                    variant="h6"
                                    fontWeight={800}
                                >
                                    {stats.communityPosts||0}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                >
                                    {t('Posts')}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                <Card
                    elevation={1}
                    sx={{borderRadius:4}}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={800}
                        >
                            {t('Marketplace Listings')}
                        </Typography>

                        <Divider sx={{my:1.5}}/>

                        {marketplaceListings.length?(
                            <Stack spacing={1.5}>
                                {marketplaceListings.map(item=>(
                                    <Box key={item._id}>
                                        <Typography
                                            fontWeight={700}
                                            sx={{
                                                overflowWrap:
                                                    'anywhere'
                                            }}
                                        >
                                            {item.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {item.category}
                                            {' · '}
                                            ₦
                                            {Number(
                                                item.price||0
                                            ).toLocaleString()}
                                            {' · '}
                                            {item.available?
                                                t('Available'):
                                                t('Sold')}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        ):(
                            <Typography color="text.secondary">
                                {t('No marketplace listings yet.')}
                            </Typography>
                        )}
                    </CardContent>
                </Card>

                <Card
                    elevation={1}
                    sx={{borderRadius:4}}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={800}
                        >
                            {t('Community Posts')}
                        </Typography>

                        <Divider sx={{my:1.5}}/>

                        {communityPosts.length?(
                            <Stack spacing={2}>
                                {communityPosts.map(post=>(
                                    <Box key={post._id}>
                                        <Typography
                                            fontWeight={700}
                                            sx={{
                                                overflowWrap:
                                                    'anywhere'
                                            }}
                                        >
                                            {post.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                                display:
                                                    '-webkit-box',
                                                WebkitLineClamp:3,
                                                WebkitBoxOrient:
                                                    'vertical',
                                                overflow:'hidden',
                                                wordBreak:
                                                    'break-word'
                                            }}
                                        >
                                            {post.content}
                                        </Typography>

                                        <Chip
                                            size="small"
                                            label={post.category}
                                            variant="outlined"
                                            sx={{mt:1}}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        ):(
                            <Typography color="text.secondary">
                                {t('No community posts yet.')}
                            </Typography>
                        )}
                    </CardContent>
                </Card>
            </Stack>

            <Dialog
                open={reportOpen}
                onClose={closeReport}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle
                    sx={{
                        fontWeight:800
                    }}
                >
                    {t('Report User')}
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2}>
                        {reportError&&(
                            <Alert severity="error">
                                {reportError}
                            </Alert>
                        )}

                        {reportSuccess&&(
                            <Alert severity="success">
                                {t(
                                    'Your report has been submitted successfully. Thank you for helping keep RoamAgro safe.'
                                )}
                            </Alert>
                        )}

                        {!reportSuccess&&(
                            <>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('Report')}{' '}
                                    <strong>
                                        {profile.name}
                                    </strong>{' '}
                                    {t(
                                        'if you believe this account violates RoamAgro rules.'
                                    )}
                                </Typography>

                                <TextField
                                    select
                                    fullWidth
                                    required
                                    label={t('Reason')}
                                    value={reportReason}
                                    onChange={event=>
                                        setReportReason(
                                            event.target.value
                                        )
                                    }
                                    disabled={reportLoading}
                                >
                                    {REPORT_REASONS.map(reason=>(
                                        <MenuItem
                                            key={reason}
                                            value={reason}
                                        >
                                            {t(reason)}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <TextField
                                    fullWidth
                                    multiline
                                    minRows={4}
                                    maxRows={7}
                                    label={t(
                                        'Additional details'
                                    )}
                                    value={reportDescription}
                                    onChange={event=>
                                        setReportDescription(
                                            event.target.value.slice(
                                                0,
                                                1000
                                            )
                                        )
                                    }
                                    disabled={reportLoading}
                                    helperText={`${reportDescription.length}/1000`}
                                    placeholder={t(
                                        'Describe what happened and provide any useful details.'
                                    )}
                                />
                            </>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        p:2,
                        gap:1,
                        flexDirection:{
                            xs:'column-reverse',
                            sm:'row'
                        }
                    }}
                >
                    <Button
                        onClick={closeReport}
                        disabled={reportLoading}
                        fullWidth
                        sx={{
                            maxWidth:{
                                sm:140
                            }
                        }}
                    >
                        {reportSuccess?
                            t('Done'):
                            t('Cancel')}
                    </Button>

                    {!reportSuccess&&(
                        <Button
                            variant="contained"
                            color="error"
                            onClick={submitReport}
                            disabled={reportLoading}
                            fullWidth
                            sx={{
                                maxWidth:{
                                    sm:180
                                }
                            }}
                        >
                            {reportLoading?(
                                <>
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                        sx={{mr:1}}
                                    />
                                    {t('Submitting...')}
                                </>
                            ):t('Submit Report')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default PublicProfile;