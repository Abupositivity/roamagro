import React from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import {
    Agriculture,
    Store,
    PriceChange,
    Groups,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/logo.gif';

const Home = () => {
    const { t } = useTranslation();
    const features = [
        {
            icon: <Agriculture color="primary" fontSize="large" />,
            title: t('Farm Management'),
            description: t('Plan, monitor and manage every farming project from planting to harvest.')
        },
        {
            icon: <Store color="primary" fontSize="large" />,
            title: t('Marketplace'),
            description: t('Buy and sell agricultural produce, livestock and farm inputs.')
        },
        {
            icon: <PriceChange color="primary" fontSize="large" />,
            title: t('Live Price Index'),
            description: t('Track commodity prices across Northern Nigerian markets.')
        },
        {
            icon: <Groups color="primary" fontSize="large" />,
            title: t('Farmer Community'),
            description: t('Learn from experienced farmers and share knowledge.')
        },
    ];
    return (
        <Container maxWidth="lg">
            <Stack
                spacing={6}
                alignItems="center"
                sx={{
                    py: 6
                }}
            >
                <Box textAlign="center">
                    <img
                        src={logo}
                        alt="RoamAgro"
                        width={130}
                    />
                    <Typography
                        variant="h3"
                        fontWeight={700}
                        mt={2}
                    >
                        RoamAgro
                    </Typography>
                    <Typography
                        variant="h6"
                        color="text.secondary"
                        mt={2}
                    >
                        {t('Manage Farms. Track Prices. Sell Produce.')}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        mt={2}
                        maxWidth={650}
                    >
                        {t('RoamAgro is a complete agribusiness platform helping farmers manage projects, monitor market prices, connect with buyers and grow profitable businesses.')}
                    </Typography>
                </Box>
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row',
                    }}
                    spacing={2}
                >
                    <Button
                        component={Link}
                        to="/login"
                        size="large"
                        variant="contained"
                    >
                        {t('Login')}
                    </Button>
                    <Button
                        component={Link}
                        to="/register"
                        size="large"
                        variant="outlined"
                    >
                        {t('Create Free Account')}
                    </Button>
                </Stack>
                <Box width="100%">
                    <Typography
                        variant="h4"
                        textAlign="center"
                        gutterBottom
                    >
                        {t('Why Choose RoamAgro?')}
                    </Typography>
                    <Grid container spacing={3} mt={2}>
                        {features.map((feature) => (
                            <Grid
                                item
                                xs={12}
                                md={6}
                                key={feature.title}
                            >
                                <Card
                                    elevation={3}
                                    sx={{
                                        height: '100%'
                                    }}
                                >
                                    <CardContent>
                                        {feature.icon}
                                        <Typography
                                            variant="h6"
                                            mt={2}
                                        >
                                            {feature.title}
                                        </Typography>

                                        <Typography
                                            color="text.secondary"
                                        >
                                            {feature.description}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Box
                    textAlign="center"
                    maxWidth={800}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                    >
                        {t('How It Works')}
                    </Typography>
                    <Typography color="text.secondary">
                        1. {t('Create your account')}
                        <br /><br />
                        2. {t('Create your farm project')}
                        <br /><br />
                        3. {t('Track activities, expenses and income')}
                        <br /><br />
                        4. {t('Sell produce and monitor market prices')}
                    </Typography>
                </Box>
                <Box width="100%">
                    <Typography
                        variant="h4"
                        align="center"
                        gutterBottom
                    >
                        {t('Built For')}
                    </Typography>
                    <Grid container spacing={2}>
                        {[
                            t('Farmers'),
                            t('Agro Dealers'),
                            t('Cooperatives'),
                            t('Processors'),
                        ].map((item) => (
                            <Grid
                                item
                                xs={6}
                                md={3}
                                key={item}
                            >
                                <Card>
                                    <CardContent>
                                        <Typography
                                            align="center"
                                            fontWeight={600}
                                        >
                                            {item}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
                <Box
                    textAlign="center"
                    py={5}
                >
                    <Typography
                        variant="h4"
                        gutterBottom
                    >
                        {t('Ready to Grow Smarter?')}
                    </Typography>
                    <Typography
                        color="text.secondary"
                        mb={3}
                    >
                        {t('Join thousands of farmers building profitable agribusinesses with RoamAgro.')}
                    </Typography>
                    <Button
                        component={Link}
                        to="/register"
                        variant="contained"
                        size="large"
                    >
                        {t('Get Started')}
                    </Button>
                </Box>
            </Stack>
        </Container>
    );
};

export default Home;