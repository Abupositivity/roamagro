import React from 'react';

import {
    Box,
    CircularProgress,
} from '@mui/material';

const PageLoader = () => {
    return (
        <Box
            role="status"
            aria-live="polite"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '50vh',
                px: 2,
                py: 4,
                gap: 2,
            }}
        >
            <CircularProgress
                size={36}
                thickness={4}
                aria-hidden="true"
            />
        </Box>
    );
};

export default PageLoader;