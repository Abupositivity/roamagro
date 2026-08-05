import React, { useMemo } from 'react';

import {
    Card,
    CardContent,
    Chip,
    Stack,
    Typography,
} from '@mui/material';

import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

import { useTranslation } from 'react-i18next';

const TrendingCategories = ({
    posts = [],
}) => {

    const { t } = useTranslation();

    const trendingCategories = useMemo(() => {
        const counts = {};
        posts.forEach((post) => {
            if (!post.category) return;
            counts[post.category] =
                (counts[post.category] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 6);
    }, [posts]);
    if (trendingCategories.length === 0) {
        return null;
    }
    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                mb: 4,
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    gutterBottom
                >
                    🔥 {t('Trending Categories')}
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                >
                    {t(
                        'Most active farming discussions in the community.'
                    )}
                </Typography>
                <Stack
                    direction="row"
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                >
                    {trendingCategories.map(
                        ([category, count]) => (
                            <Chip
                                key={category}
                                icon={
                                    <LocalFireDepartmentIcon />
                                }
                                label={`${category} (${count})`}
                                color="success"
                                variant="outlined"
                            />
                        )
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
};

export default TrendingCategories;