import React from 'react';

import {
    Grid,
    Alert,
    Stack,
    CircularProgress,
    Typography,
    Divider,
    FormControlLabel,
    Switch,
    Box,
    Button,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

import PriceCard from './PriceCard';
import { getPriceTrend } from '../../utils/priceTrend';

const RecentPrices = ({
    prices = [],
    loading = false,
    loadingMore = false,
    currentUser,
    onDelete,
    deletingPriceId = null,
    showMyPrices = false,
    onToggleMyPrices,
    hasMore = false,
    onLoadMore,
}) => {
    const { t } = useTranslation();

    const highestPrices = {};

    prices.forEach((price) => {
        if (
            !highestPrices[
                price.product
            ] ||
            Number(price.price) >
                highestPrices[
                    price.product
                ]
        ) {
            highestPrices[
                price.product
            ] = Number(price.price);
        }
    });

    return (
        <>
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent:
                        'space-between',
                    gap: 2,
                    mb: 1,
                    flexWrap: 'wrap',
                }}
            >
                <Typography
                    variant="h5"
                    fontWeight={700}
                >
                    {t(
                        'Recent Market Prices'
                    )}
                </Typography>

                {onToggleMyPrices && (
                    <FormControlLabel
                        control={
                            <Switch
                                checked={
                                    showMyPrices
                                }
                                onChange={(
                                    event
                                ) =>
                                    onToggleMyPrices(
                                        event
                                            .target
                                            .checked
                                    )
                                }
                                color="success"
                            />
                        }
                        label={t(
                            'Show My Price Updates'
                        )}
                    />
                )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{ py: 6 }}
                >
                    <CircularProgress />
                </Stack>
            ) : prices.length === 0 ? (
                <Alert severity="info">
                    {showMyPrices
                        ? t(
                              'You have not submitted any prices matching the current filters.'
                          )
                        : t(
                              'No price records available yet.'
                          )}
                </Alert>
            ) : (
                <>
                    <Grid
                        container
                        spacing={3}
                    >
                        {prices.map(
                            (entry) => (
                                <Grid
                                    item
                                    xs={12}
                                    sm={6}
                                    md={4}
                                    key={
                                        entry._id
                                    }
                                >
                                    <PriceCard
                                        entry={
                                            entry
                                        }
                                        bestPrice={
                                            Number(
                                                entry.price
                                            ) ===
                                            highestPrices[
                                                entry
                                                    .product
                                            ]
                                        }
                                        trend={getPriceTrend(
                                            prices,
                                            entry.product
                                        )}
                                        currentUser={
                                            currentUser
                                        }
                                        onDelete={
                                            onDelete
                                        }
                                        deleting={
                                            deletingPriceId ===
                                            entry._id
                                        }
                                    />
                                </Grid>
                            )
                        )}
                    </Grid>

                    {hasMore && (
                        <Stack
                            alignItems="center"
                            sx={{ mt: 4 }}
                        >
                            <Button
                                variant="outlined"
                                size="large"
                                onClick={
                                    onLoadMore
                                }
                                disabled={
                                    loadingMore
                                }
                            >
                                {loadingMore ? (
                                    <>
                                        <CircularProgress
                                            size={
                                                20
                                            }
                                            sx={{
                                                mr: 1,
                                            }}
                                        />

                                        {t(
                                            'Loading...'
                                        )}
                                    </>
                                ) : (
                                    t(
                                        'Load More'
                                    )
                                )}
                            </Button>
                        </Stack>
                    )}
                </>
            )}
        </>
    );
};

export default RecentPrices;