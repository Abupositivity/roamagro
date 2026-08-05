import React from 'react';
import {
    Alert,
    Box,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

import AgriPostCard from './AgriPostCard';

const CommunityFeed = ({
    loading = false,
    posts = [],
}) => {

    const { t } = useTranslation();

    if (loading) {

        return (

            <Box
                display="flex"
                justifyContent="center"
                py={6}
            >
                <CircularProgress />
            </Box>

        );

    }

    if (posts.length === 0) {

        return (

            <Alert
                severity="info"
                sx={{ mt: 3 }}
            >
                {t(
                    'No community discussions match your search.'
                )}
            </Alert>

        );

    }

    return (

        <>

            <Typography
                variant="h5"
                fontWeight={700}
                mb={2}
                mt={4}
            >
                {t('Community Discussions')}
                {' '}
                ({posts.length})
            </Typography>

            <Stack spacing={3}>

                {posts.map((post) => (

                    <AgriPostCard
                        key={post._id}
                        post={post}
                    />

                ))}

            </Stack>

        </>

    );

};

export default CommunityFeed;