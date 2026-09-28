import React, {
    useEffect,
    useState,
} from 'react';

import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import {
    useTranslation,
} from 'react-i18next';

import api from '../../services/api';
import AgriTipCard from './AgriTipCard';

const FeaturedTips = ({
    refreshKey = 0,
}) => {
    const { t } = useTranslation();

    const [
        tips,
        setTips,
    ] = useState([]);

    const [
        loading,
        setLoading,
    ] = useState(true);

    const [
        refreshing,
        setRefreshing,
    ] = useState(false);

    const [
        error,
        setError,
    ] = useState(null);

    useEffect(() => {
        let active = true;

        const loadFeaturedTips = async () => {
            const silent = refreshKey > 0;

            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            try {
                const res = await api.get(
                    '/feed/featured'
                );

                if (!active) return;

                setTips(res.data.data || []);
                setError(null);
            } catch (error) {
                if (!active) return;

                const message =
                    error.response?.data?.message ||
                    t('Unable to load featured tips.');

                if (!silent || tips.length === 0) {
                    setError(message);
                }
            } finally {
                if (!active) return;

                setLoading(false);
                setRefreshing(false);
            }
        };

        loadFeaturedTips();

        return () => {
            active = false;
        };
    }, [refreshKey, t, tips.length]);

    if (loading && tips.length === 0) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                py={4}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (error && tips.length === 0) {
        return (
            <Alert
                severity="error"
                sx={{ mb: 3 }}
            >
                {error}
            </Alert>
        );
    }

    if (tips.length === 0) {
        return null;
    }

    return (
        <Box mb={4}>
            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
            >
                ⭐ {t('Featured Agricultural Tips')}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
            >
                {t(
                    'Important agricultural information selected for farmers.'
                )}
            </Typography>

            {refreshing && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    mb={2}
                >
                    {t('Updating featured tips...')}
                </Typography>
            )}

            <Stack spacing={2}>
                {tips.map((tip) => (
                    <AgriTipCard
                        key={tip._id}
                        tip={tip}
                    />
                ))}
            </Stack>
        </Box>
    );
};

export default FeaturedTips;