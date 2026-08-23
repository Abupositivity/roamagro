import React,{useEffect}from'react';
import{
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Stack,
    Typography
}from'@mui/material';
import PeopleOutlinedIcon from'@mui/icons-material/PeopleOutlined';
import AgricultureOutlinedIcon from'@mui/icons-material/AgricultureOutlined';
import StorefrontOutlinedIcon from'@mui/icons-material/StorefrontOutlined';
import GroupsOutlinedIcon from'@mui/icons-material/GroupsOutlined';
import LightbulbOutlinedIcon from'@mui/icons-material/LightbulbOutlined';
import ReportProblemOutlinedIcon from'@mui/icons-material/ReportProblemOutlined';
import ArrowForwardIosIcon from'@mui/icons-material/ArrowForwardIos';
import{useDispatch,useSelector}from'react-redux';
import{useTranslation}from'react-i18next';
import{useNavigate}from'react-router-dom';
import PageLayout from'../components/layout/PageLayout';
import{fetchDashboard}from'../redux/actions/dashboardActions';

const AdminDashboard=()=>{
    const{t}=useTranslation();
    const dispatch=useDispatch();
    const navigate=useNavigate();

    const{
        loading,
        error,
        dashboard
    }=useSelector(
        state=>state.dashboard
    );

    useEffect(()=>{
        dispatch(
            fetchDashboard('/admin')
        );
    },[dispatch]);

    if(loading){
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

    if(error){
        return(
            <PageLayout>
                <Alert severity="error">
                    {error}
                </Alert>
            </PageLayout>
        );
    }

    const summary=
        dashboard?.summary||{};

    const cards=[
        {
            title:t('Total Users'),
            value:summary.totalUsers||0,
            icon:<PeopleOutlinedIcon/>
        },
        {
            title:t('Farmers'),
            value:summary.farmers||0,
            icon:<AgricultureOutlinedIcon/>
        },
        {
            title:t('Farm Projects'),
            value:summary.totalProjects||0,
            icon:<AgricultureOutlinedIcon/>
        },
        {
            title:t('Marketplace Listings'),
            value:summary.totalListings||0,
            icon:<StorefrontOutlinedIcon/>
        },
        {
            title:t('Community Posts'),
            value:summary.communityPosts||0,
            icon:<GroupsOutlinedIcon/>
        },
        {
            title:t('Published Tips'),
            value:summary.publishedTips||0,
            icon:<LightbulbOutlinedIcon/>
        }
    ];

    return(
        <PageLayout>
            <Stack spacing={3}>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        {t('Admin Dashboard')}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                    >
                        {t(
                            'Manage and monitor RoamAgro activity.'
                        )}
                    </Typography>
                </Box>

                <Grid
                    container
                    spacing={2}
                >
                    {cards.map(card=>(
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={card.title}
                        >
                            <Card
                                elevation={2}
                                sx={{
                                    height:'100%',
                                    borderRadius:3
                                }}
                            >
                                <CardContent>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                    >
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
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {card.title}
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
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
                            direction={{
                                xs:'column',
                                sm:'row'
                            }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{
                                xs:'stretch',
                                sm:'center'
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
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
                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                    >
                                        {t(
                                            'User Reports'
                                        )}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{mt:.25}}
                                    >
                                        {t(
                                            'Review reports, add admin notes and manage reported accounts.'
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="contained"
                                endIcon={
                                    <ArrowForwardIosIcon
                                        sx={{
                                            fontSize:
                                                '12px!important'
                                        }}
                                    />
                                }
                                onClick={()=>
                                    navigate(
                                        '/admin/reports'
                                    )
                                }
                                sx={{
                                    borderRadius:2.5,
                                    alignSelf:{
                                        xs:'flex-start',
                                        sm:'auto'
                                    }
                                }}
                            >
                                {t(
                                    'Manage Reports'
                                )}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    elevation={2}
                    sx={{
                        borderRadius:3
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('Recent Users')}
                        </Typography>

                        <Stack spacing={2}>
                            {dashboard?.latestUsers?.length?(
                                dashboard.latestUsers.map(
                                    user=>(
                                        <Box
                                            key={user._id}
                                            display="flex"
                                            justifyContent="space-between"
                                            alignItems="center"
                                        >
                                            <Box>
                                                <Typography
                                                    fontWeight={600}
                                                >
                                                    {user.name}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {user.email}
                                                </Typography>
                                            </Box>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {user.role}
                                            </Typography>
                                        </Box>
                                    )
                                )
                            ):(
                                <Typography
                                    color="text.secondary"
                                >
                                    {t(
                                        'No users available.'
                                    )}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    elevation={2}
                    sx={{
                        borderRadius:3
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t(
                                'Recent Agricultural Tips'
                            )}
                        </Typography>

                        <Stack spacing={2}>
                            {dashboard?.latestTips?.length?(
                                dashboard.latestTips.map(
                                    tip=>(
                                        <Box
                                            key={tip._id}
                                        >
                                            <Typography
                                                fontWeight={600}
                                            >
                                                {tip.title}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {tip.category}
                                            </Typography>
                                        </Box>
                                    )
                                )
                            ):(
                                <Typography
                                    color="text.secondary"
                                >
                                    {t(
                                        'No agricultural tips available.'
                                    )}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </PageLayout>
    );
};

export default AdminDashboard;