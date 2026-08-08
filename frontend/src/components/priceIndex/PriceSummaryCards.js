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
    <Card sx={{ height: '100%' }}>
        <CardContent>
            <Stack spacing={1} alignItems="center">
                {icon}

                <Typography
                    variant="h5"
                    fontWeight={700}
                >
                    {value}
                </Typography>

                <Typography
                    color="text.secondary"
                    align="center"
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

    const average =
        values.length
            ? Math.round(
                  values.reduce((a, b) => a + b, 0) /
                      values.length
              )
            : 0;

    const highest =
        values.length
            ? Math.max(...values)
            : 0;

    const lowest =
        values.length
            ? Math.min(...values)
            : 0;
    return (
        <Grid
            container
            spacing={2}
            mb={4}
        >
            <Grid item xs={6} sm={6} md={3}>
                <SummaryCard
                    title={t('Products')}
                    value={total}
                    icon={
                        <InventoryIcon
                            color="primary"
                            fontSize="large"
                        />
                    }
                />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
                <SummaryCard
                    title={t('Average Price')}
                    value={`₦${average.toLocaleString()}`}
                    icon={
                        <TrendingUpIcon
                            color="success"
                            fontSize="large"
                        />
                    }
                />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
                <SummaryCard
                    title={t('Highest')}
                    value={`₦${highest.toLocaleString()}`}
                    icon={
                        <ArrowUpwardIcon
                            color="success"
                            fontSize="large"
                        />
                    }
                />
            </Grid>
            <Grid item xs={6} sm={6} md={3}>
                <SummaryCard
                    title={t('Lowest')}
                    value={`₦${lowest.toLocaleString()}`}
                    icon={
                        <ArrowDownwardIcon
                            color="error"
                            fontSize="large"
                        />
                    }
                />
            </Grid>
        </Grid>
    );
};

export default PriceSummaryCards;