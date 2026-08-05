import React from 'react';

import {
    Box,
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material';

import StarIcon from '@mui/icons-material/Star';

import { useTranslation } from 'react-i18next';

const FeaturedPosts = ({
    posts = [],
}) => {

    const { t } = useTranslation();
    if (posts.length === 0) {
        return null;
    }

    return (
        <Box mb={4}>
            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
            >
                ⭐ {t('Featured Discussions')}
            </Typography>
            <Stack spacing={2}>
                {posts.map((post) => (
                    <Card
                        key={post._id}
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                            borderLeft: '5px solid #2e7d32',
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={2}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                >
                                    {post.title}
                                </Typography>
                                <Chip
                                    icon={<StarIcon />}
                                    label={t('Featured')}
                                    color="success"
                                    size="small"
                                />
                            </Stack>
                            <Typography
                                color="text.secondary"
                                mb={2}
                            >
                                {post.content}
                            </Typography>
                            <Stack
                                direction="row"
                                spacing={1}
                                flexWrap="wrap"
                            >
                                <Chip
                                    label={post.category}
                                    size="small"
                                />
                                <Chip
                                    label={
                                        post.user?.name ||
                                        t('Farmer')
                                    }
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default FeaturedPosts;