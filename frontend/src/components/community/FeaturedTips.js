import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';

import { useTranslation } from 'react-i18next';

import api from '../../services/api';

const FeaturedTips = () => {

    const { t } = useTranslation();

    const [tips, setTips] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {

        const loadFeaturedTips = async () => {

            try {

                const res = await api.get(
                    '/feed/featured'
                );

                setTips(res.data.data || []);

            } catch (error) {

                setError(
                    error.response?.data?.message ||
                    t('Unable to load featured tips.')
                );

            } finally {

                setLoading(false);

            }

        };

        loadFeaturedTips();

    }, [t]);

    const getPriorityColor = (priority) => {

        if (priority === 'Urgent') {
            return 'error';
        }

        if (priority === 'Important') {
            return 'warning';
        }

        return 'success';

    };

    if (loading) {

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

    if (error) {

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

            <Stack spacing={2}>

                {tips.map((tip) => (

                    <Card
                        key={tip._id}
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                        }}
                    >

                        {tip.image && (

                            <CardMedia
                                component="img"
                                height="200"
                                image={tip.image}
                                alt={tip.title}
                            />

                        )}

                        <CardContent>

                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                                spacing={2}
                                mb={2}
                            >

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {tip.title}
                                </Typography>

                                <Chip
                                    icon={
                                        <PriorityHighIcon />
                                    }
                                    label={tip.priority}
                                    color={getPriorityColor(
                                        tip.priority
                                    )}
                                    size="small"
                                />

                            </Stack>

                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                                useFlexGap
                                mb={2}
                            >

                                <Chip
                                    icon={
                                        <AgricultureIcon />
                                    }
                                    label={tip.category}
                                    color="success"
                                    size="small"
                                    variant="outlined"
                                />

                                {tip.language && (

                                    <Chip
                                        label={tip.language}
                                        size="small"
                                        variant="outlined"
                                    />

                                )}

                                {tip.region && (

                                    <Chip
                                        label={tip.region}
                                        size="small"
                                        variant="outlined"
                                    />

                                )}

                            </Stack>

                            <Typography
                                variant="body1"
                                sx={{
                                    whiteSpace: 'pre-line',
                                }}
                            >
                                {tip.content}
                            </Typography>

                            {tip.createdBy?.name && (

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    mt={2}
                                >
                                    {t('Shared by')}:{' '}
                                    {tip.createdBy.name}
                                </Typography>

                            )}

                        </CardContent>

                    </Card>

                ))}

            </Stack>

        </Box>

    );

};

export default FeaturedTips;