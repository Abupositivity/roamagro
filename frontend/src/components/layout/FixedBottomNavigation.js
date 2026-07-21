import React from 'react';
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import StoreIcon from '@mui/icons-material/Store';
import PriceChangeIcon from '@mui/icons-material/PriceChange';
import GroupsIcon from '@mui/icons-material/Groups';
import {
    useNavigate,
    useLocation,
} from 'react-router-dom';

import { useTranslation } from 'react-i18next';

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

    return (
        <Paper
            elevation={6}
            sx={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 1300,
            }}
        >
            <BottomNavigation
                value={location.pathname}
                onChange={(e, value) => navigate(value)}
                showLabels
                sx={{
                    height: 72,
                    pb: 'env(safe-area-inset-bottom)',
                }}
            >
                <BottomNavigationAction
                    label={t('Home')}
                    value={routes[0]}
                    icon={<DashboardIcon />}
                />
                <BottomNavigationAction
                    label={t('Farm Projects')}
                    value={routes[1]}
                    icon={<AgricultureIcon />}
                />
                <BottomNavigationAction
                    label={t('Marketplace')}
                    value={routes[2]}
                    icon={<StoreIcon />}
                />
                <BottomNavigationAction
                    label={t('Price Index')}
                    value={routes[3]}
                    icon={<PriceChangeIcon />}
                />
                <BottomNavigationAction
                    label={t('Community')}
                    value={routes[4]}
                    icon={<GroupsIcon />}
                />
            </BottomNavigation>
        </Paper>
    );
};

export default FixedBottomNavigation;