import React from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Chip,
    Stack,
} from '@mui/material';
import AgricultureIcon from '@mui/icons-material/Agriculture';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useTranslation } from 'react-i18next';

const AgriFeed = () => {
    const { t } = useTranslation();

    // Static feed for MVP.
    // Later this will come from the backend (/api/v1/feed)
    const tips = [
        {
            id: 1,
            category: t('Crop Management'),
            title: t('Plant early to maximize rainfall.'),
        },
        {
            id: 2,
            category: t('Soil Health'),
            title: t('Apply organic manure before planting.'),
        },
        {
            id: 3,
            category: t('Pest Control'),
            title: t('Inspect crops weekly for early pest detection.'),
        },
        {
            id: 4,
            category: t('Market Tips'),
            title: t('Monitor local market prices before selling.'),
        },
        {
            id: 5,
            category: t('Irrigation'),
            title: t('Water crops early morning or late evening.'),
        },
        {
            id: 6,
            category: t('Livestock'),
            title: t('Provide clean drinking water daily for livestock.'),
        },
    ];
    return (
        <Box>
            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
            >
                {t('Agri-Feed')}
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
            >
                {t('Daily agricultural tips and best practices.')}
            </Typography>
            <Stack spacing={2}>
                {tips.map((tip) => (
                    <Card
                        key={tip.id}
                        elevation={2}
                        sx={{
                            borderRadius: 3,
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                                mb={2}
                            >
                                <AgricultureIcon
                                    color="success"
                                />
                                <Chip
                                    icon={<LightbulbIcon />}
                                    label={tip.category}
                                    color="success"
                                    size="small"
                                />
                            </Stack>
                            <Typography
                                variant="body1"
                            >
                                {tip.title}
                            </Typography>
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        </Box>
    );
};

export default AgriFeed;