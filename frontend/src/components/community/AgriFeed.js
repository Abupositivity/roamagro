import React, { useEffect } from 'react';

import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { fetchAgriFeed } from '../../redux/actions/agriFeedActions';

import AgriTipCard from './AgriTipCard';

const AgriFeed = () => {

    const { t } = useTranslation();

    const dispatch = useDispatch();

    const {
        tips,
        loading,
        error,
    } = useSelector(
        state => state.agriFeed
    );

    useEffect(() => {

        dispatch(fetchAgriFeed());

    }, [dispatch]);

    return (

        <Box>

            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
            >
                🌱 {t('Agricultural Tips')}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
            >
                {t(
                    'Daily farming tips and best practices shared by agricultural experts.'
                )}
            </Typography>

            {loading && (

                <Box
                    display="flex"
                    justifyContent="center"
                    py={5}
                >
                    <CircularProgress />
                </Box>

            )}

            {error && (

                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>

            )}

            {!loading &&
                !error &&
                tips.length === 0 && (

                <Alert severity="info">

                    {t(
                        'No agricultural tips available yet.'
                    )}

                </Alert>

            )}

            {!loading &&
                !error &&
                tips.length > 0 && (

                <Stack spacing={2}>

                    {tips.map((tip) => (

                        <AgriTipCard
                            key={tip._id}
                            tip={tip}
                        />

                    ))}

                </Stack>

            )}

        </Box>

    );

};

export default AgriFeed;