import React from 'react';

import {
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

const PageLoader = () => {
    const { t } = useTranslation();

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

            <Typography
                variant="body2"
                color="text.secondary"
                textAlign="center"
            >
                {t('Loading page...')}
            </Typography>
        </Box>
    );
};

export default PageLoader;