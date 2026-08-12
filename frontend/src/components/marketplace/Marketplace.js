import React, {
    useEffect,
    useState,
} from 'react';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import { useTranslation } from 'react-i18next';

import {
    Container,
    Typography,
    Box,
    Button,
    Alert,
    CircularProgress,
    FormControlLabel,
    Switch,
    Stack,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import {
    fetchListings,
    createListing,
    updateListing,
    deleteListing,
} from '../../redux/actions/marketplaceActions';

import MarketplaceGrid from './MarketplaceGrid';
import MarketplaceDialog from './MarketplaceDialog';
import DeleteMarketplaceDialog from './DeleteMarketplaceDialog';
import MarketplaceSearchBar from './MarketplaceSearchBar';
import CategoryFilter from './CategoryFilter';
import MarketplaceSummaryCards from './MarketplaceSummaryCards';
import AvailabilityFilter from './AvailabilityFilter';

const Marketplace = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        listings,
        loading,
        error,
        page,
        hasMore,
    } = useSelector(
        (state) => state.marketplace
    );

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [selectedListing, setSelectedListing] =
        useState(null);

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [search, setSearch] =
        useState('');

    const [selectedCategory, setSelectedCategory] =
        useState('All');

    const [showMine, setShowMine] =
        useState(false);

    const [availability, setAvailability] =
        useState('All');

    const [loadingMore, setLoadingMore] =
        useState(false);

    /*
    |--------------------------------------------------------------------------
    | Fetch Listings
    |--------------------------------------------------------------------------
    */
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(
                fetchListings(
                    {
                        page: 1,
                        limit: 20,
                        search: search.trim(),
                        category:
                            selectedCategory === 'All'
                                ? ''
                                : selectedCategory,
                        availability:
                            availability === 'All'
                                ? ''
                                : availability,
                        mine: showMine,
                    },
                    false
                )
            );
        }, 350);

        return () => clearTimeout(timer);
    }, [
        dispatch,
        search,
        selectedCategory,
        availability,
        showMine,
    ]);

    /*
    |--------------------------------------------------------------------------
    | Create Listing
    |--------------------------------------------------------------------------
    */
    const handleCreate = () => {
        setSelectedListing(null);
        setDialogOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Edit Listing
    |--------------------------------------------------------------------------
    */
    const handleEditListing = (listing) => {
        setSelectedListing(listing);
        setDialogOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Close Listing Dialog
    |--------------------------------------------------------------------------
    */
    const handleCloseDialog = () => {
        if (loading) {
            return;
        }

        setSelectedListing(null);
        setDialogOpen(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Delete Listing
    |--------------------------------------------------------------------------
    */
    const handleDeleteListing = (listing) => {
        setSelectedListing(listing);
        setDeleteDialogOpen(true);
    };

    /*
    |--------------------------------------------------------------------------
    | Close Delete Dialog
    |--------------------------------------------------------------------------
    */
    const handleCloseDeleteDialog = () => {
        if (loading) {
            return;
        }

        setSelectedListing(null);
        setDeleteDialogOpen(false);
    };

    /*
    |--------------------------------------------------------------------------
    | Submit / Save Listing
    |--------------------------------------------------------------------------
    */
    const handleSubmit = async (data) => {
        let result;

        if (selectedListing) {
            result = await dispatch(
                updateListing(
                    selectedListing._id,
                    data
                )
            );
        } else {
            result = await dispatch(
                createListing(data)
            );
        }

        if (result?.success) {
            handleCloseDialog();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Confirm Delete
    |--------------------------------------------------------------------------
    */
    const handleDelete = async () => {
        if (!selectedListing) {
            return;
        }

        const result = await dispatch(
            deleteListing(
                selectedListing._id
            )
        );

        if (result?.success) {
            handleCloseDeleteDialog();
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Toggle Availability
    |--------------------------------------------------------------------------
    */
    const handleToggleAvailability = (
        listing
    ) => {
        dispatch(
            updateListing(
                listing._id,
                {
                    available:
                        !listing.available,
                }
            )
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Load More
    |--------------------------------------------------------------------------
    */
    const handleLoadMore = async () => {
        if (
            loadingMore ||
            loading ||
            !hasMore
        ) {
            return;
        }

        setLoadingMore(true);

        try {
            await dispatch(
                fetchListings(
                    {
                        page: page + 1,
                        limit: 20,
                        search: search.trim(),
                        category:
                            selectedCategory === 'All'
                                ? ''
                                : selectedCategory,
                        availability:
                            availability === 'All'
                                ? ''
                                : availability,
                        mine: showMine,
                    },
                    true
                )
            );
        } finally {
            setLoadingMore(false);
        }
    };

    return (
        <Container
            maxWidth="xl"
            sx={{
                py: 3,
                pb: 10,
            }}
        >
            {/* Header */}
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={4}
                flexWrap="wrap"
                gap={2}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        {t('Marketplace')}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {t(
                            'Buy and sell agricultural products, equipment and services.'
                        )}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreate}
                >
                    {t('Create Listing')}
                </Button>
            </Box>

            {/* Error */}
            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}

            {/* Search */}
            <Box sx={{ mb: 3 }}>
                <MarketplaceSearchBar
                    search={search}
                    onSearchChange={
                        setSearch
                    }
                />
            </Box>

            {/* Filters */}
            <Stack
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
                spacing={3}
                sx={{ mb: 4 }}
            >
                <Box sx={{ flex: 1 }}>
                    <CategoryFilter
                        selected={
                            selectedCategory
                        }
                        onChange={
                            setSelectedCategory
                        }
                    />
                </Box>

                <Box sx={{ flex: 1 }}>
                    <AvailabilityFilter
                        value={
                            availability
                        }
                        onChange={
                            setAvailability
                        }
                    />
                </Box>
            </Stack>

            {/* My Listings Toggle */}
            <Box sx={{ mb: 3 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={showMine}
                            onChange={(event) =>
                                setShowMine(
                                    event.target.checked
                                )
                            }
                        />
                    }
                    label={t(
                        'Show My Listings'
                    )}
                />
            </Box>

            {/* Summary */}
            <Box sx={{ mb: 3 }}>
                <MarketplaceSummaryCards
                    listings={
                        listings || []
                    }
                />
            </Box>

            {/* Marketplace Listings */}
            <MarketplaceGrid
                listings={
                    listings || []
                }
                loading={
                    loading &&
                    (!listings ||
                        listings.length === 0)
                }
                error={error}
                onEdit={
                    handleEditListing
                }
                onDelete={
                    handleDeleteListing
                }
                onToggleAvailability={
                    handleToggleAvailability
                }
                onCreate={handleCreate}
            />

            {/* Load More */}
            {hasMore && (
                <Box
                    display="flex"
                    justifyContent="center"
                    mt={5}
                >
                    <Button
                        variant="outlined"
                        size="large"
                        onClick={
                            handleLoadMore
                        }
                        disabled={
                            loadingMore ||
                            loading
                        }
                    >
                        {loadingMore ? (
                            <CircularProgress
                                size={24}
                            />
                        ) : (
                            t('Load More')
                        )}
                    </Button>
                </Box>
            )}

            {/* End of Listings */}
            {!hasMore &&
                listings &&
                listings.length > 0 && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        textAlign="center"
                        mt={5}
                    >
                        {t(
                            'You have reached the end of the listings.'
                        )}
                    </Typography>
                )}

            {/* Create / Edit Dialog */}
            <MarketplaceDialog
                open={dialogOpen}
                onClose={
                    handleCloseDialog
                }
                listing={
                    selectedListing
                }
                loading={loading}
                onSubmit={
                    handleSubmit
                }
            />

            {/* Delete Dialog */}
            <DeleteMarketplaceDialog
                open={
                    deleteDialogOpen
                }
                onClose={
                    handleCloseDeleteDialog
                }
                listing={
                    selectedListing
                }
                loading={loading}
                onConfirm={
                    handleDelete
                }
            />
        </Container>
    );
};

export default Marketplace;