import React from 'react';

import {
    Grid,
    Alert,
    Typography,
    CircularProgress,
    Box,
    Button,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

import MarketplaceCard from './MarketplaceCard';

const MarketplaceGrid = ({
    listings = [],
    loading = false,
    error = null,
    onEdit,
    onDelete,
    onToggleAvailability,
    onCreate,
    onOpenProfile
}) => {
    const { t } = useTranslation();

    /*
    |--------------------------------------------------------------------------
    | Loading
    |--------------------------------------------------------------------------
    */
    if (
        loading &&
        (!listings || listings.length === 0)
    ) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                py={6}
            >
                <CircularProgress />
            </Box>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Error
    |--------------------------------------------------------------------------
    */
    if (error && (!listings || listings.length === 0)) {
        return (
            <Alert
                severity="error"
                sx={{ mb: 3 }}
            >
                {error}
            </Alert>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Empty State
    |--------------------------------------------------------------------------
    */
    if (!listings || listings.length === 0) {
        return (
            <Box
                textAlign="center"
                py={6}
            >
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {t(
                        'No marketplace listings found.'
                    )}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    mb={3}
                >
                    {t(
                        'Create a new marketplace listing.'
                    )}
                </Typography>

                {onCreate && (
                    <Button
                        variant="contained"
                        onClick={onCreate}
                    >
                        {t('Create Listing')}
                    </Button>
                )}
            </Box>
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Listings
    |--------------------------------------------------------------------------
    */
    return (
        <>
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}

            <Grid
                container
                spacing={3}
            >
                {listings.map((listing) => (
                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        key={listing._id}
                    >
                        <MarketplaceCard
                            listing={listing}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggleAvailability={onToggleAvailability}
                            onOpenProfile={onOpenProfile}
                        />
                    </Grid>
                ))}
            </Grid>
        </>
    );
};

export default MarketplaceGrid;