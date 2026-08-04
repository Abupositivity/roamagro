import React from 'react';
import {
Grid,
Alert,
Stack,
CircularProgress,
Typography,
Divider,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PriceCard from './PriceCard';
import { getPriceTrend } from '../../utils/priceTrend';

const RecentPrices = ({
    prices = [],
    loading = false,
}) => {

    const { t } = useTranslation();

    const highestPrices = {};

    prices.forEach(price => {

        if (
            !highestPrices[price.product] ||
            Number(price.price) >
            highestPrices[price.product]
        ) {

            highestPrices[price.product] =
                Number(price.price);

        }

    });

    return (

        <>

            <Typography
                variant="h5"
                gutterBottom
            >
                {t('Recent Market Prices')}
            </Typography>

            <Divider sx={{ mb:3 }} />

            {loading ? (

                <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{ py:6 }}
                >

                    <CircularProgress />

                </Stack>

            ) : prices.length === 0 ? (

                <Alert severity="info">

                    {t('No price records available yet.')}

                </Alert>

            ) : (

                <Grid
                    container
                    spacing={3}
                >

                    {prices.map(entry => (

                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={entry._id}
                        >

                            <PriceCard
                                entry={entry}
                                bestPrice={
                                    Number(entry.price) ===
                                    highestPrices[
                                        entry.product
                                    ]
                                }
                                trend={
                                    getPriceTrend(
                                        prices,
                                        entry.product
                                    )
                                }
                            />

                        </Grid>

                    ))}

                </Grid>

            )}

        </>

    );

};

export default RecentPrices;