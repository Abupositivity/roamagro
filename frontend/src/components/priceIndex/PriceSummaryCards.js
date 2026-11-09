import React from 'react';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
} from '@mui/material';
import InventoryIcon from '@mui/icons-material/Inventory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { useTranslation } from 'react-i18next';

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
                px: { xs: 1, sm: 2 },
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
                    minHeight: { xs: 100, sm: 120 },
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
                            xs: 'clamp(0.95rem, 4vw, 1.2rem)',
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

const PriceSummaryCards = ({ prices = [] }) => {
    const { t } = useTranslation();

    const total = prices.length;

    const values = prices.map(p => Number(p.price));

    const average = values.length
        ? Math.round(
            values.reduce((a, b) => a + b, 0) /
                values.length
        )
        : 0;

    const highest = values.length
        ? Math.max(...values)
        : 0;

    const lowest = values.length
        ? Math.min(...values)
        : 0;

    return (
        <Grid
            container
            spacing={{ xs: 1.5, sm: 2 }}
            mb={{ xs: 2.5, sm: 4 }}
        >
            <Grid item xs={6} md={3}>
                <SummaryCard
                    title={t('Products')}
                    value={total}
                    icon={
                        <InventoryIcon
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

            <Grid item xs={6} md={3}>
                <SummaryCard
                    title={t('Average Price')}
                    value={`₦${average.toLocaleString()}`}
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

            <Grid item xs={6} md={3}>
                <SummaryCard
                    title={t('Highest')}
                    value={`₦${highest.toLocaleString()}`}
                    icon={
                        <ArrowUpwardIcon
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

            <Grid item xs={6} md={3}>
                <SummaryCard
                    title={t('Lowest')}
                    value={`₦${lowest.toLocaleString()}`}
                    icon={
                        <ArrowDownwardIcon
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

export default PriceSummaryCards;