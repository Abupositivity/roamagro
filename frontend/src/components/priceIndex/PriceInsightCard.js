import React from 'react';
import {
    Paper,
    Typography,
    Stack,
    Divider,
    Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { useTranslation } from 'react-i18next';

const PriceInsightCard = ({ insight }) => {

    const { t } = useTranslation();

    if (!insight) return null;

    const recommendation =
        Number(insight.difference) >= 5000
            ? t('Good opportunity to compare markets before selling.')
            : t('Prices are similar across markets.');

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 3,
                height: '100%',
            }}
        >
            <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
            >
                {insight.product}
            </Typography>

            <Stack spacing={2}>

                <Divider />

                <Typography
                    fontWeight={600}
                    color="success.main"
                >
                    <ShoppingCartIcon
                        sx={{
                            fontSize: 18,
                            mr: 1,
                            verticalAlign: 'middle',
                        }}
                    />
                    {t('Best Buying Market')}
                </Typography>

                <Typography>
                    {insight.cheapest.market || '-'}
                </Typography>

                <Typography color="text.secondary">
                    {insight.cheapest.location}
                </Typography>

                <Chip
                    color="success"
                    label={`₦${Number(
                        insight.cheapest.price
                    ).toLocaleString()}`}
                />

                <Divider />

                <Typography
                    fontWeight={600}
                    color="primary"
                >
                    <StorefrontIcon
                        sx={{
                            fontSize: 18,
                            mr: 1,
                            verticalAlign: 'middle',
                        }}
                    />
                    {t('Best Selling Market')}
                </Typography>

                <Typography>
                    {insight.expensive.market || '-'}
                </Typography>

                <Typography color="text.secondary">
                    {insight.expensive.location}
                </Typography>

                <Chip
                    color="primary"
                    label={`₦${Number(
                        insight.expensive.price
                    ).toLocaleString()}`}
                />

                <Divider />

                <Typography fontWeight={700}>
                    <TrendingUpIcon
                        sx={{
                            fontSize: 18,
                            mr: 1,
                            verticalAlign: 'middle',
                        }}
                    />
                    {t('Potential Difference')}
                </Typography>

                <Chip
                    color="warning"
                    label={`₦${Number(
                        insight.difference
                    ).toLocaleString()}`}
                />

                <Typography
                    variant="body2"
                    color="text.secondary"
                >
                    {recommendation}
                </Typography>

            </Stack>

        </Paper>
    );
};

export default PriceInsightCard;