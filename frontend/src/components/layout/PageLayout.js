import React from 'react';
import { Box } from '@mui/material';
import TopAppBar from './TopAppBar';
import FixedBottomNavigation from './FixedBottomNavigation';

const APPBAR_HEIGHT = 64;
const BOTTOM_NAV_HEIGHT = 72;

const PageLayout = ({ children }) => {
    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.default',
            }}
        >
            <TopAppBar />
            <Box
                component="main"
                sx={{
                    flex: 1,
                    pt: `${APPBAR_HEIGHT + 16}px`,
                    px: 2,
                    pb: `calc(${BOTTOM_NAV_HEIGHT}px + env(safe-area-inset-bottom) + 16px)`,
                    overflowX: 'hidden',
                }}
            >
                {children}
            </Box>
            <FixedBottomNavigation />
        </Box>
    );
};

export default PageLayout;