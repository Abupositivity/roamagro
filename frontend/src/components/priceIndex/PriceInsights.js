import React, { useMemo } from 'react';
import {
    Grid,
    Typography,
    Alert,
    Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import PriceInsightCard from './PriceInsightCard';
import { generatePriceInsights } from '../../utils/priceInsights';

const PriceInsights = ({
    prices = [],
}) => {

    const { t } = useTranslation();

    const insights = useMemo(
        () => generatePriceInsights(prices),
        [prices]
    );

    return (
        <>
            <Typography
                variant="h5"
                fontWeight={700}
                gutterBottom
            >
                {t('Farmer Insights')}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {insights.length === 0 ? (

                <Alert severity="info">
                    {t(
                        'Not enough market data to generate insights.'
                    )}
                </Alert>

            ) : (

                <Grid
                    container
                    spacing={3}
                >
                    {insights.map((insight) => (
                        <Grid
                            item
                            xs={12}
                            md={6}
                            key={insight.product}
                        >
                            <PriceInsightCard
                                insight={insight}
                            />
                        </Grid>
                    ))}
                </Grid>

            )}

        </>
    );
};

export default PriceInsights;