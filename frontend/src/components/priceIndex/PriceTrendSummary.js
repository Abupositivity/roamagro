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

const SummaryCard = ({
    title,
    value,
    icon,
}) => (

    <Card sx={{ height: '100%' }}>

        <CardContent>

            <Stack
                spacing={1}
                alignItems="center"
            >

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

const PriceTrendSummary = ({
    prices = [],
}) => {

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

        if (trend === 'rising') rising++;

        else if (trend === 'falling') falling++;

        else stable++;

    });

    return (

        <Grid
            container
            spacing={2}
            mb={4}
        >

            <Grid item xs={12} md={4}>

                <SummaryCard
                    title={t('Rising')}
                    value={rising}
                    icon={
                        <TrendingUpIcon
                            color="success"
                            fontSize="large"
                        />
                    }
                />

            </Grid>

            <Grid item xs={12} md={4}>

                <SummaryCard
                    title={t('Stable')}
                    value={stable}
                    icon={
                        <TrendingFlatIcon
                            color="primary"
                            fontSize="large"
                        />
                    }
                />

            </Grid>

            <Grid item xs={12} md={4}>

                <SummaryCard
                    title={t('Falling')}
                    value={falling}
                    icon={
                        <TrendingDownIcon
                            color="error"
                            fontSize="large"
                        />
                    }
                />

            </Grid>

        </Grid>

    );

};

export default PriceTrendSummary;