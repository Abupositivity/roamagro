
import React from 'react';
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Box,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import StoreIcon from '@mui/icons-material/Store';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import GroupsIcon from '@mui/icons-material/Groups';
import {
    useNavigate,
    useLocation,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import logo from '../../assets/images/logo.gif';

const routes = [
    '/dashboard',
    '/farm-projects',
    '/marketplace',
    '/price-index',
    '/community',
];

const FixedBottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const activeRoute =
        routes.find(
            route =>
                location.pathname === route ||
                location.pathname.startsWith(`${route}/`)
        ) || location.pathname;

    const handleNavigation = route => {
        const isCurrentPage =
            location.pathname === route ||
            location.pathname.startsWith(`${route}/`);

        if (isCurrentPage) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });

            window.dispatchEvent(
                new CustomEvent('roamagro:refresh-page', {
                    detail: {
                        route,
                        timestamp: Date.now(),
                    },
                })
            );

            return;
        }

        navigate(route);
    };

    const getIconContainerSx = route => ({
        width: 38,
        height: 34,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 2,
        backgroundColor:
            activeRoute === route ? 'rgba(0, 191, 99, 0.13)' : 'transparent',
        transition: 'background-color 0.2s ease',
        '& svg': {
            fontSize: 25,
            color: activeRoute === route ? '#00BF63' : 'text.secondary',
            transition: 'color 0.2s ease',
        },
    });

    const getActionSx = {
        minWidth: 0,
        flex: 1,
        px: 0.25,
        pt: 0.75,
        pb: 0.5,
        color: 'text.secondary',
        '& .MuiBottomNavigationAction-label': {
            fontSize: '0.68rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            transition: 'font-size 0.2s ease',
        },
        '&.Mui-selected': {
            color: '#00BF63',
        },
        '&.Mui-selected .MuiBottomNavigationAction-label': {
            fontSize: '0.7rem',
            fontWeight: 700,
        },
    };

    return (
        <Paper
            elevation={8}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1300,
                borderTop: '1px solid',
                borderColor: 'divider',
                borderRadius: '14px 14px 0 0',
                overflow: 'hidden',
                backgroundColor: 'background.paper',
                pb: 'env(safe-area-inset-bottom)',
            }}
        >
            <BottomNavigation
                value={activeRoute}
                onChange={(event, value) => handleNavigation(value)}
                showLabels
                sx={{
                    height: 68,
                    backgroundColor: 'background.paper',
                }}
            >
                <BottomNavigationAction
                    label={t('Home')}
                    value={routes[0]}
                    sx={getActionSx}
                    icon={
                        <Box sx={getIconContainerSx(routes[0])}>
                            <Box
                                component="img"
                                src={logo}
                                alt="RoamAgro"
                                sx={{
                                    width: 27,
                                    height: 27,
                                    objectFit: 'contain',
                                }}
                            />
                        </Box>
                    }
                />

                <BottomNavigationAction
                    label={t('Farm Projects')}
                    value={routes[1]}
                    sx={getActionSx}
                    icon={
                        <Box sx={getIconContainerSx(routes[1])}>
                            <AgricultureIcon />
                        </Box>
                    }
                />

                <BottomNavigationAction
                    label={t('Marketplace')}
                    value={routes[2]}
                    sx={getActionSx}
                    icon={
                        <Box sx={getIconContainerSx(routes[2])}>
                            <StoreIcon />
                        </Box>
                    }
                />

                <BottomNavigationAction
                    label={t('Price Index')}
                    value={routes[3]}
                    sx={getActionSx}
                    icon={
                        <Box sx={getIconContainerSx(routes[3])}>
                            <PriceChangeIcon />
                        </Box>
                    }
                />

                <BottomNavigationAction
                    label={t('Community')}
                    value={routes[4]}
                    sx={getActionSx}
                    icon={
                        <Box sx={getIconContainerSx(routes[4])}>
                            <GroupsIcon />
                        </Box>
                    }
                />
            </BottomNavigation>
        </Paper>
    );
};

export default FixedBottomNavigation;