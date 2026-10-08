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
    TipsAndUpdates,
    AccountBalance,
    TrendingUp,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../assets/images/logo.gif';

const Home = () => {
    const { t } = useTranslation();

    const features = [
        {
            icon: <TipsAndUpdates color="primary" fontSize="large" />,
            title: t('Agri-Feed'),
            description: t(
                'Get agricultural tips, best practices and useful farming knowledge.'
            ),
        },
        {
            icon: <Agriculture color="primary" fontSize="large" />,
            title: t('Farm Management'),
            description: t(
                'Plan, monitor and manage your farm projects, activities, expenses and income.'
            ),
        },
        {
            icon: <Store color="primary" fontSize="large" />,
            title: t('Marketplace'),
            description: t(
                'Buy and sell agricultural produce, livestock, equipment and farm inputs.'
            ),
        },
        {
            icon: <PriceChange color="primary" fontSize="large" />,
            title: t('Live Price Index'),
            description: t(
                'Monitor agricultural commodity prices across Nigerian markets.'
            ),
        },
        {
            icon: <Groups color="primary" fontSize="large" />,
            title: t('Community'),
            description: t(
                'Connect with farmers, share knowledge and learn from the agricultural community.'
            ),
        },
    ];

    const steps = [
        t('Create your account'),
        t('Create your farm project'),
        t('Track activities, expenses and income'),
        t('Sell produce and monitor market prices'),
        t('Connect with other farmers and share knowledge'),
    ];

    const users = [
        {
            icon: <Agriculture color="primary" />,
            title: t('Farmers'),
        },
        {
            icon: <Store color="primary" />,
            title: t('Consumers'),
        },
        {
            icon: <AccountBalance color="primary" />,
            title: t('Agro Dealers'),
        },
        {
            icon: <TrendingUp color="primary" />,
            title: t('Agro Processors'),
        },
    ];

    return (
        <Box>
            <Container maxWidth="lg">
                <Stack spacing={8} sx={{ py: { xs: 4, md: 7 } }}>
                    <Box
                        textAlign="center"
                        sx={{
                            maxWidth: 900,
                            mx: 'auto',
                        }}
                    >
                        <Box
                            component="img"
                            src={logo}
                            alt="RoamAgro"
                            sx={{
                                width: {
                                    xs: 100,
                                    sm: 120,
                                    md: 140,
                                },
                                height: 'auto',
                            }}
                        />

                        <Typography
                            variant="h1"
                            fontWeight={800}
                            sx={{
                                mt: 2,
                                fontSize: {
                                    xs: '2.2rem',
                                    sm: '3rem',
                                    md: '3.75rem',
                                },
                            }}
                        >
                            RoamAgro
                        </Typography>

                        <Typography
                            variant="h4"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{
                                mt: 2,
                                fontSize: {
                                    xs: '1.35rem',
                                    sm: '1.75rem',
                                    md: '2.125rem',
                                },
                            }}
                        >
                            {t('Your Agribusiness Companion')}
                        </Typography>

                        <Typography
                            variant="h6"
                            color="text.secondary"
                            sx={{
                                mt: 2,
                                maxWidth: 750,
                                mx: 'auto',
                                lineHeight: 1.6,
                            }}
                        >
                            {t(
                                'Manage Farm Projects. Track Prices. Buy/Sell Produce. Connect & Share Knowledge.'
                            )}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                mt: 2,
                                maxWidth: 700,
                                mx: 'auto',
                                lineHeight: 1.8,
                            }}
                        >
                            {t(
                                'RoamAgro is an agricultural platform helping farmers manage projects, monitor market prices, buy and sell produce, connect with other farmers, and grow profitable agribusinesses.'
                            )}
                        </Typography>

                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            justifyContent="center"
                            spacing={2}
                            sx={{ mt: 4 }}
                        >
                            <Button
                                component={Link}
                                to="/register"
                                size="large"
                                variant="contained"
                                sx={{
                                    minWidth: 180,
                                    py: 1.4,
                                }}
                            >
                                {t('Get Started')}
                            </Button>

                            <Button
                                component={Link}
                                to="/login"
                                size="large"
                                variant="outlined"
                                sx={{
                                    minWidth: 180,
                                    py: 1.4,
                                }}
                            >
                                {t('Login')}
                            </Button>
                        </Stack>
                    </Box>

                    <Box>
                        <Typography
                            variant="h4"
                            textAlign="center"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('Everything You Need to Grow')}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            textAlign="center"
                            sx={{
                                maxWidth: 700,
                                mx: 'auto',
                                mb: 4,
                            }}
                        >
                            {t(
                                'Simple tools to help you manage your farm, understand the market and connect with the agricultural community.'
                            )}
                        </Typography>

                        <Grid container spacing={3}>
                            {features.map((feature) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={feature.title === t('Community') ? 12 : 6}
                                    key={feature.title}
                                >
                                    <Card
                                        elevation={2}
                                        sx={{
                                            height: '100%',
                                            borderRadius: 3,
                                            transition:
                                                'transform 0.2s ease, box-shadow 0.2s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: 6,
                                            },
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                p: 3,
                                                height: '100%',
                                            }}
                                        >
                                            <Stack
                                                direction="row"
                                                spacing={2}
                                                alignItems="flex-start"
                                            >
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        minWidth: 52,
                                                        height: 52,
                                                        borderRadius: 2,
                                                        bgcolor: 'action.hover',
                                                    }}
                                                >
                                                    {feature.icon}
                                                </Box>

                                                <Box>
                                                    <Typography
                                                        variant="h6"
                                                        fontWeight={700}
                                                        gutterBottom
                                                    >
                                                        {feature.title}
                                                    </Typography>

                                                    <Typography
                                                        color="text.secondary"
                                                        lineHeight={1.7}
                                                    >
                                                        {feature.description}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box>
                        <Typography
                            variant="h4"
                            textAlign="center"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('How It Works')}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            textAlign="center"
                            sx={{
                                maxWidth: 650,
                                mx: 'auto',
                                mb: 4,
                            }}
                        >
                            {t(
                                'Start using RoamAgro in a few simple steps.'
                            )}
                        </Typography>

                        <Grid container spacing={3}>
                            {steps.map((step, index) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={index === 4 ? 12 : 3}
                                    key={step}
                                >
                                    <Card
                                        variant="outlined"
                                        sx={{
                                            height: '100%',
                                            borderRadius: 3,
                                        }}
                                    >
                                        <CardContent
                                            sx={{
                                                textAlign: 'center',
                                                p: 3,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    width: 42,
                                                    height: 42,
                                                    mx: 'auto',
                                                    mb: 2,
                                                    borderRadius: '50%',
                                                    bgcolor: 'primary.main',
                                                    color: 'primary.contrastText',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontWeight: 700,
                                                }}
                                            >
                                                {index + 1}
                                            </Box>

                                            <Typography
                                                fontWeight={600}
                                                lineHeight={1.5}
                                            >
                                                {step}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box>
                        <Typography
                            variant="h4"
                            textAlign="center"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('Built For')}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            textAlign="center"
                            sx={{
                                maxWidth: 650,
                                mx: 'auto',
                                mb: 4,
                            }}
                        >
                            {t(
                                'RoamAgro brings different participants in the agricultural value chain together.'
                            )}
                        </Typography>

                        <Grid container spacing={2}>
                            {users.map((user) => (
                                <Grid
                                    item
                                    xs={6}
                                    sm={6}
                                    md={3}
                                    key={user.title}
                                >
                                    <Card
                                        elevation={1}
                                        sx={{
                                            height: '100%',
                                            borderRadius: 3,
                                        }}
                                    >
                                        <CardContent>
                                            <Stack
                                                spacing={1}
                                                alignItems="center"
                                            >
                                                {user.icon}

                                                <Typography
                                                    align="center"
                                                    fontWeight={600}
                                                >
                                                    {user.title}
                                                </Typography>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>

                    <Box
                        textAlign="center"
                        sx={{
                            py: {
                                xs: 4,
                                md: 6,
                            },
                            px: {
                                xs: 2,
                                md: 6,
                            },
                            borderRadius: 4,
                            bgcolor: 'action.hover',
                        }}
                    >
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('Ready to Grow Smarter?')}
                        </Typography>

                        <Typography
                            color="text.secondary"
                            sx={{
                                maxWidth: 650,
                                mx: 'auto',
                                mb: 3,
                            }}
                        >
                            {t(
                                'Join farmers, consumers and agricultural businesses using RoamAgro to manage, connect and grow.'
                            )}
                        </Typography>

                        <Button
                            component={Link}
                            to="/register"
                            variant="contained"
                            size="large"
                            sx={{
                                px: 4,
                                py: 1.4,
                            }}
                        >
                            {t('Create Free Account')}
                        </Button>
                    </Box>
                </Stack>
            </Container>
        </Box>
    );
};

export default Home;