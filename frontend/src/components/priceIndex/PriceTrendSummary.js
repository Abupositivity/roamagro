import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useTranslation } from 'react-i18next';
import { getPriceTrend } from '../../utils/priceTrend';

const SummaryCard = ({ title, value, icon }) => (
    <Card
        sx={{
            height: '100%',
            minWidth: 0,
            borderRadius: 2,
        }}
    >
        <CardContent
            sx={{
                px: { xs: 0.75, sm: 2 },
                py: { xs: 1.5, sm: 2 },
                '&:last-child': {
                    pb: { xs: 1.5, sm: 2 },
                },
            }}
        >
            <Stack
                spacing={{ xs: 0.75, sm: 1 }}
                alignItems="center"
                justifyContent="center"
                sx={{
                    minWidth: 0,
                    minHeight: { xs: 95, sm: 115 },
                    textAlign: 'center',
                }}
            >
                {icon}

                <Typography
                    variant="h5"
                    fontWeight={700}
                    sx={{
                        width: '100%',
                        fontSize: {
                            xs: '1.15rem',
                            sm: '1.5rem',
                        },
                        lineHeight: 1.3,
                        overflowWrap: 'anywhere',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {value}
                </Typography>

                <Typography
                    color="text.secondary"
                    align="center"
                    sx={{
                        fontSize: {
                            xs: '0.75rem',
                            sm: '0.875rem',
                        },
                        lineHeight: 1.4,
                        overflowWrap: 'anywhere',
                    }}
                >
                    {title}
                </Typography>
            </Stack>
        </CardContent>
    </Card>
);

const PriceTrendSummary = ({ prices = [] }) => {
    const { t } = useTranslation();

    const products = [
        ...new Set(
            prices.map(item => item.product)
        ),
    ];

    let rising = 0;
    let falling = 0;
    let stable = 0;

    products.forEach(product => {
        const trend = getPriceTrend(
            prices,
            product
        );

        if (trend === 'rising') {
            rising++;
        } else if (trend === 'falling') {
            falling++;
        } else {
            stable++;
        }
    });

    return (
        <Grid
            container
            spacing={{ xs: 1, sm: 2 }}
            mb={{ xs: 2.5, sm: 4 }}
        >
            <Grid item xs={4} md={3}>
                <SummaryCard
                    title={t('Rising')}
                    value={rising}
                    icon={
                        <TrendingUpIcon
                            color="success"
                            sx={{
                                fontSize: {
                                    xs: 26,
                                    sm: 34,
                                },
                            }}
                        />
                    }
                />
            </Grid>

            <Grid item xs={4} md={3}>
                <SummaryCard
                    title={t('Stable')}
                    value={stable}
                    icon={
                        <TrendingFlatIcon
                            color="primary"
                            sx={{
                                fontSize: {
                                    xs: 26,
                                    sm: 34,
                                },
                            }}
                        />
                    }
                />
            </Grid>

            <Grid item xs={4} md={3}>
                <SummaryCard
                    title={t('Falling')}
                    value={falling}
                    icon={
                        <TrendingDownIcon
                            color="error"
                            sx={{
                                fontSize: {
                                    xs: 26,
                                    sm: 34,
                                },
                            }}
                        />
                    }
                />
            </Grid>
        </Grid>
    );
};

export default PriceTrendSummary;