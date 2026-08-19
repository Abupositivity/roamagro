import React, { useEffect } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import PageLayout from '../components/layout/PageLayout';
import { fetchDashboard } from '../redux/actions/dashboardActions';

const ExtensionDashboard = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        loading,
        error,
        dashboard,
    } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboard('/extension'));
    }, [dispatch]);

    if (loading) {
        return (
            <PageLayout>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                >
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <Alert severity="error">
                    {error}
                </Alert>
            </PageLayout>
        );
    }

    const summary = dashboard?.summary || {};

    const cards = [
        {
            title: t('Total Farmers'),
            value: summary.totalFarmers || 0,
            icon: <GroupsOutlinedIcon />,
        },
        {
            title: t('Farm Projects'),
            value: summary.totalProjects || 0,
            icon: <AgricultureOutlinedIcon />,
        },
        {
            title: t('Active Projects'),
            value: summary.activeProjects || 0,
            icon: <AgricultureOutlinedIcon />,
        },
        {
            title: t('Community Posts'),
            value: summary.communityPosts || 0,
            icon: <ForumOutlinedIcon />,
        },
        {
            title: t('Published Tips'),
            value: summary.publishedTips || 0,
            icon: <LightbulbOutlinedIcon />,
        },
    ];

    return (
        <PageLayout>
            <Stack spacing={3}>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        {t('Extension Officer Dashboard')}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                    >
                        {t('Support farmers and monitor agricultural activities.')}
                    </Typography>
                </Box>

                <Grid container spacing={2}>
                    {cards.map((card) => (
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
                                    height: '100%',
                                    borderRadius: 3,
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
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 45,
                                                height: 45,
                                                borderRadius: 2,
                                                bgcolor: 'primary.main',
                                                color: 'white',
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
                        borderRadius: 3,
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('Recent Farm Projects')}
                        </Typography>

                        <Stack spacing={2}>
                            {dashboard?.recentProjects?.length ? (
                                dashboard.recentProjects.map((project) => (
                                    <Box key={project._id}>
                                        <Typography fontWeight={600}>
                                            {project.name}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {project.user?.name || t('Farmer')}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="text.secondary">
                                    {t('No farm projects available.')}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    elevation={2}
                    sx={{
                        borderRadius: 3,
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('Recent Community Posts')}
                        </Typography>

                        <Stack spacing={2}>
                            {dashboard?.recentPosts?.length ? (
                                dashboard.recentPosts.map((post) => (
                                    <Box key={post._id}>
                                        <Typography fontWeight={600}>
                                            {post.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {post.user?.name || t('Farmer')}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="text.secondary">
                                    {t('No community posts available.')}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <Card
                    elevation={2}
                    sx={{
                        borderRadius: 3,
                    }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('Recent Agricultural Tips')}
                        </Typography>

                        <Stack spacing={2}>
                            {dashboard?.recentTips?.length ? (
                                dashboard.recentTips.map((tip) => (
                                    <Box key={tip._id}>
                                        <Typography fontWeight={600}>
                                            {tip.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {tip.category}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="text.secondary">
                                    {t('No agricultural tips available.')}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>
            </Stack>
        </PageLayout>
    );
};

export default ExtensionDashboard;