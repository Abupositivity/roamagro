import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import { useTranslation } from 'react-i18next';

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    FormControlLabel,
    Stack,
    Switch,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MyLocationIcon from '@mui/icons-material/MyLocation';

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
import PublicProfile from '../connections/PublicProfile';

const Marketplace = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        listings,
        loading,
        loadingMore,
        error,
        page,
        hasMore,
    } = useSelector(
        (state) => state.marketplace
    );

    const [dialogOpen, setDialogOpen] =
        useState(false);

    const [
        selectedListing,
        setSelectedListing,
    ] = useState(null);

    const [
        deleteDialogOpen,
        setDeleteDialogOpen,
    ] = useState(false);

    const [search, setSearch] =
        useState('');

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState('All');

    const [showMine, setShowMine] =
        useState(false);

    const [
        availability,
        setAvailability,
    ] = useState('All');

    const [
        profileUserId,
        setProfileUserId,
    ] = useState(null);

    const [
        userCoordinates,
        setUserCoordinates,
    ] = useState(null);

    const [
        locationError,
        setLocationError,
    ] = useState('');

    const [
        locationLoading,
        setLocationLoading,
    ] = useState(false);

    const loadMoreRef =
        useRef(null);

    const buildFetchParams =
        useCallback(
            (requestedPage) => ({
                page: requestedPage,
                limit: 20,
                search: search.trim(),
                category:
                    selectedCategory ===
                    'All'
                        ? ''
                        : selectedCategory,
                availability:
                    availability ===
                    'All'
                        ? ''
                        : availability,
                mine: showMine,
                ...(userCoordinates
                    ? {
                          userLatitude:
                              userCoordinates.latitude,
                          userLongitude:
                              userCoordinates.longitude,
                      }
                    : {}),
            }),
            [
                search,
                selectedCategory,
                availability,
                showMine,
                userCoordinates,
            ]
        );

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(
                t(
                    'Location is not supported by this browser.'
                )
            );

            return;
        }

        setLocationLoading(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserCoordinates({
                    latitude:
                        position.coords.latitude,
                    longitude:
                        position.coords.longitude,
                });

                setLocationLoading(
                    false
                );
            },
            () => {
                setLocationError(
                    t(
                        'Could not access your location. You can still browse listings.'
                    )
                );

                setLocationLoading(
                    false
                );
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    };

    const handleClearLocation = () => {
        setUserCoordinates(null);
        setLocationError('');
    };

    useEffect(() => {
        if (profileUserId) {
            return undefined;
        }

        const timer = setTimeout(
            () => {
                dispatch(
                    fetchListings(
                        buildFetchParams(1),
                        false
                    )
                );
            },
            350
        );

        return () =>
            clearTimeout(timer);
    }, [
        dispatch,
        search,
        selectedCategory,
        availability,
        showMine,
        profileUserId,
        userCoordinates,
        buildFetchParams,
    ]);

    useEffect(() => {
        const handleRefresh = (
            event
        ) => {
            if (
                event.detail?.route !==
                '/marketplace'
            ) {
                return;
            }

            dispatch(
                fetchListings(
                    buildFetchParams(1),
                    false
                )
            );
        };

        window.addEventListener(
            'roamagro:refresh-page',
            handleRefresh
        );

        return () => {
            window.removeEventListener(
                'roamagro:refresh-page',
                handleRefresh
            );
        };
    }, [
        dispatch,
        buildFetchParams,
    ]);

    const handleLoadMore =
        useCallback(() => {
            if (
                loading ||
                loadingMore ||
                !hasMore
            ) {
                return;
            }

            dispatch(
                fetchListings(
                    buildFetchParams(
                        page + 1
                    ),
                    true
                )
            );
        }, [
            dispatch,
            buildFetchParams,
            page,
            loading,
            loadingMore,
            hasMore,
        ]);

    useEffect(() => {
        const target =
            loadMoreRef.current;

        if (!target) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    const entry =
                        entries[0];

                    if (
                        entry.isIntersecting
                    ) {
                        handleLoadMore();
                    }
                },
                {
                    rootMargin:
                        '0px 0px 500px 0px',
                }
            );

        observer.observe(target);

        return () => {
            observer.disconnect();
        };
    }, [
        handleLoadMore,
    ]);

    const handleCreate = () => {
        setSelectedListing(null);
        setDialogOpen(true);
    };

    const handleEditListing = (
        listing
    ) => {
        setSelectedListing(listing);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (loading) {
            return;
        }

        setSelectedListing(null);
        setDialogOpen(false);
    };

    const handleDeleteListing = (
        listing
    ) => {
        setSelectedListing(listing);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog =
        () => {
            if (loading) {
                return;
            }

            setSelectedListing(null);
            setDeleteDialogOpen(false);
        };

    const handleSubmit = async (
        data
    ) => {
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

    const handleDelete =
        async () => {
            if (!selectedListing) {
                return;
            }

            const result =
                await dispatch(
                    deleteListing(
                        selectedListing._id
                    )
                );

            if (result?.success) {
                handleCloseDeleteDialog();
            }
        };

    const handleToggleAvailability =
        (listing) => {
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

    const handleOpenProfile = (
        userId
    ) => {
        if (!userId) {
            return;
        }

        setProfileUserId(
            String(userId)
        );

        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    const handleBackFromProfile =
        () => {
            setProfileUserId(null);
        };

    if (profileUserId) {
        return (
            <Box>
                <Box
                    sx={{
                        maxWidth: 'xl',
                        mx: 'auto',
                        px: {
                            xs: 2,
                            sm: 3,
                        },
                        pt: 2,
                    }}
                >
                    <Button
                        startIcon={
                            <ArrowBackIcon />
                        }
                        onClick={
                            handleBackFromProfile
                        }
                        sx={{
                            mb: 1,
                        }}
                    >
                        {t(
                            'Back to Marketplace'
                        )}
                    </Button>
                </Box>

                <PublicProfile
                    userId={
                        profileUserId
                    }
                    onBack={
                        handleBackFromProfile
                    }
                />
            </Box>
        );
    }

    return (
        <Container
            maxWidth="xl"
            sx={{
                py: 3,
                pb: 10,
            }}
        >
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
                        {t(
                            'Marketplace'
                        )}
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
                    startIcon={
                        <AddIcon />
                    }
                    onClick={
                        handleCreate
                    }
                >
                    {t(
                        'Create Listing'
                    )}
                </Button>
            </Box>

            {error && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                    }}
                >
                    {error}
                </Alert>
            )}

            <Box
                sx={{
                    mb: 2,
                }}
            >
                <MarketplaceSearchBar
                    search={search}
                    onSearchChange={
                        setSearch
                    }
                />
            </Box>

            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row',
                }}
                spacing={1.5}
                alignItems={{
                    xs: 'stretch',
                    sm: 'center',
                }}
                sx={{
                    mb: 2,
                }}
            >
                <Button
                    variant={
                        userCoordinates
                            ? 'contained'
                            : 'outlined'
                    }
                    startIcon={
                        locationLoading ? (
                            <CircularProgress
                                size={18}
                                color="inherit"
                            />
                        ) : (
                            <MyLocationIcon />
                        )
                    }
                    onClick={
                        handleUseMyLocation
                    }
                    disabled={
                        locationLoading
                    }
                >
                    {locationLoading
                        ? t(
                              'Finding location...'
                          )
                        : userCoordinates
                          ? t(
                                'Refresh my location'
                            )
                          : t(
                                'Show nearby listings'
                            )}
                </Button>

                {userCoordinates && (
                    <Button
                        variant="text"
                        onClick={
                            handleClearLocation
                        }
                    >
                        {t(
                            'Clear location'
                        )}
                    </Button>
                )}

                {userCoordinates && (
                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {t(
                            'Nearby sorting is enabled'
                        )}
                    </Typography>
                )}
            </Stack>

            {locationError && (
                <Alert
                    severity="info"
                    sx={{
                        mb: 3,
                    }}
                >
                    {locationError}
                </Alert>
            )}

            <Stack
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
                spacing={3}
                sx={{
                    mb: 4,
                }}
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

            <Box sx={{ mb: 3 }}>
                <FormControlLabel
                    control={
                        <Switch
                            checked={
                                showMine
                            }
                            onChange={(
                                event
                            ) =>
                                setShowMine(
                                    event.target
                                        .checked
                                )
                            }
                        />
                    }
                    label={t(
                        'Show My Listings'
                    )}
                />
            </Box>

            <Box sx={{ mb: 3 }}>
                <MarketplaceSummaryCards
                    listings={
                        listings || []
                    }
                />
            </Box>

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
                onCreate={
                    handleCreate
                }
                onOpenProfile={
                    handleOpenProfile
                }
            />

            {listings &&
                listings.length > 0 && (
                    <Box
                        ref={
                            loadMoreRef
                        }
                        display="flex"
                        justifyContent="center"
                        py={4}
                    >
                        {loadingMore && (
                            <Stack
                                alignItems="center"
                                spacing={1}
                            >
                                <CircularProgress
                                    size={24}
                                />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        'Loading more listings...'
                                    )}
                                </Typography>
                            </Stack>
                        )}

                        {!loadingMore &&
                            hasMore && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        'Scroll for more listings'
                                    )}
                                </Typography>
                            )}

                        {!loadingMore &&
                            !hasMore && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t(
                                        'You have reached the end of the listings.'
                                    )}
                                </Typography>
                            )}
                    </Box>
                )}

            <MarketplaceDialog
                open={
                    dialogOpen
                }
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