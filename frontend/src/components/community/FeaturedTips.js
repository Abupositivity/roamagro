import React, {
    useEffect,
    useRef,
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
    archivedTipIds = [],
    onArchived,
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

    const hasLoadedRef = useRef(false);

    // Reuse an active featured tips request.
    const fetchRequestRef = useRef(null);

    useEffect(() => {
        let active = true;

        const loadFeaturedTips = async () => {
            const silent =
                hasLoadedRef.current;

            if (silent) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            try {
                // Avoid overlapping requests
                // to the same endpoint.
                if (!fetchRequestRef.current) {
                    const request = api.get(
                        '/feed/featured'
                    );

                    fetchRequestRef.current =
                        request;
                }

                const request =
                    fetchRequestRef.current;

                let res;

                try {
                    res = await request;
                } finally {
                    if (
                        fetchRequestRef.current ===
                        request
                    ) {
                        fetchRequestRef.current =
                            null;
                    }
                }

                if (!active) return;

                setTips(res.data.data || []);
                setError(null);

                hasLoadedRef.current = true;
            } catch (error) {
                if (!active) return;

                const message =
                    error.response?.data?.message ||
                    error.message ||
                    'Unable to load featured tips.';

                if (!silent) {
                    setError(message);
                }
            } finally {
                if (active) {
                    setLoading(false);
                    setRefreshing(false);
                }
            }
        };

        loadFeaturedTips();

        return () => {
            active = false;
        };
    }, [refreshKey]);

    const visibleTips = tips.filter(
        (tip) =>
            tip.status === 'Published' &&
            !archivedTipIds.includes(tip._id)
    );

    if (loading && visibleTips.length === 0) {
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

    if (error && visibleTips.length === 0) {
        return (
            <Alert
                severity="error"
                sx={{
                    mb: 3,
                    overflowWrap: 'anywhere',
                }}
            >
                {t(error)}
            </Alert>
        );
    }

    if (visibleTips.length === 0) {
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
                {visibleTips.map((tip) => (
                    <AgriTipCard
                        key={tip._id}
                        tip={tip}
                        onArchived={onArchived}
                    />
                ))}
            </Stack>
        </Box>
    );
};

export default FeaturedTips;