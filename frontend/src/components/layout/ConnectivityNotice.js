
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Snackbar
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const ConnectivityNotice = () => {
    const { t } = useTranslation();

    const [online, setOnline] = useState(
        () => navigator.onLine
    );
    const [showRestored, setShowRestored] = useState(false);

    useEffect(() => {
        const handleOffline = () => {
            setOnline(false);
            setShowRestored(false);
        };

        const handleOnline = () => {
            setOnline(true);
            setShowRestored(true);
        };

        window.addEventListener('offline', handleOffline);
        window.addEventListener('online', handleOnline);

        return () => {
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('online', handleOnline);
        };
    }, []);

    return (
        <>
            <Snackbar
                open={!online}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
                sx={{
                    bottom: {
                        xs: '16px',
                        sm: '24px'
                    },
                    maxWidth: 'calc(100vw - 32px)'
                }}
            >
                <Alert
                    severity="warning"
                    variant="filled"
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: 3
                    }}
                >
                    {t(
                        'You are offline. Please check your internet connection.'
                    )}
                </Alert>
            </Snackbar>

            <Snackbar
                open={online && showRestored}
                autoHideDuration={3000}
                onClose={() => setShowRestored(false)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setShowRestored(false)}
                    sx={{
                        width: '100%',
                        borderRadius: 2,
                        boxShadow: 3
                    }}
                >
                    {t('Connection restored. You are back online.')}
                </Alert>
            </Snackbar>
        </>
    );
};

export default ConnectivityNotice;