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
    Snackbar,
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
        paginationError,
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

    // Operation-specific error states.
    const [
        submissionError,
        setSubmissionError,
    ] = useState('');

    const [
        deletionError,
        setDeletionError,
    ] = useState('');

    const [
        availabilityError,
        setAvailabilityError,
    ] = useState('');

    // Operation-specific loading states.
    const [
        submitting,
        setSubmitting,
    ] = useState(false);

    const [
        deleting,
        setDeleting,
    ] = useState(false);

    // Synchronous mutation request protection.
    const submissionLockRef = useRef(false);
    const deletionLockRef = useRef(false);
    const availabilityLockRef = useRef(new Set());

    // Listing fetch request protection.
    const fetchRequestRef = useRef(null);

    const [
        fetchingListings,
        setFetchingListings,
    ] = useState(false);

    const [
        filterPending,
        setFilterPending,
    ] = useState(true);

    const filterPendingRef = useRef(true);

    const [
        loadedQueryKey,
        setLoadedQueryKey,
    ] = useState(null);

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

    const loadMoreRef = useRef(null);

    const normalizedSearch = search.trim();

    const buildFetchParams =
        useCallback(
            (requestedPage) => ({
                page: requestedPage,
                limit: 20,
                search: normalizedSearch,
                category:
                    selectedCategory === 'All'
                        ? ''
                        : selectedCategory,
                availability:
                    availability === 'All'
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
                normalizedSearch,
                selectedCategory,
                availability,
                showMine,
                userCoordinates,
            ]
        );

    // Identifies the filters associated with
    // the currently requested listings.
    const queryKey = JSON.stringify(
        buildFetchParams(1)
    );

    const filtersReady =
        loadedQueryKey === queryKey &&
        !filterPending;

    // Prevent simultaneous listing fetch requests.
    const requestListings = useCallback(
        async (params, append = false) => {
            if (fetchRequestRef.current) {
                return {
                    success: false,
                    skipped: true,
                };
            }

            setFetchingListings(true);

            const request = Promise.resolve().then(
                () =>
                    dispatch(
                        fetchListings(params, append)
                    )
            );

            fetchRequestRef.current = request;

            try {
                return await request;
            } finally {
                if (
                    fetchRequestRef.current === request
                ) {
                    fetchRequestRef.current = null;
                    setFetchingListings(false);
                }
            }
        },
        [dispatch]
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

                setLocationLoading(false);
            },
            () => {
                setLocationError(
                    t(
                        'Could not access your location. You can still browse listings.'
                    )
                );

                setLocationLoading(false);
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

    // Debounced first-page fetching.
    // Wait for an existing request before loading
    // the latest search or filter selection.
    useEffect(() => {
        if (profileUserId) {
            return undefined;
        }

        let cancelled = false;

        filterPendingRef.current = true;
        setFilterPending(true);

        const timer = setTimeout(
            async () => {
                try {
                    while (
                        fetchRequestRef.current &&
                        !cancelled
                    ) {
                        await fetchRequestRef.current;
                    }

                    if (cancelled) {
                        return;
                    }

                    const result =
                        await requestListings(
                            buildFetchParams(1),
                            false
                        );

                    if (
                        !cancelled &&
                        result?.success
                    ) {
                        setLoadedQueryKey(queryKey);
                    }
                } finally {
                    if (!cancelled) {
                        filterPendingRef.current = false;
                        setFilterPending(false);
                    }
                }
            },
            350
        );

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [
        buildFetchParams,
        profileUserId,
        queryKey,
        requestListings,
    ]);

    // Refresh only when Marketplace is visible
    // and no listing fetch is already pending.
    useEffect(() => {
        const handleRefresh = async (
            event
        ) => {
            if (
                event.detail?.route !==
                    '/marketplace' ||
                profileUserId ||
                filterPendingRef.current ||
                fetchRequestRef.current
            ) {
                return;
            }

            filterPendingRef.current = true;
            setFilterPending(true);

            try {
                const result =
                    await requestListings(
                        buildFetchParams(1),
                        false
                    );

                if (result?.success) {
                    setLoadedQueryKey(queryKey);
                } else {
                    setLoadedQueryKey(null);
                }
            } finally {
                filterPendingRef.current = false;
                setFilterPending(false);
            }
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
        buildFetchParams,
        profileUserId,
        queryKey,
        requestListings,
    ]);

    // Load additional listings only when the
    // displayed pagination belongs to the
    // currently selected filters.
    const handleLoadMore =
        useCallback(
            async (retry = false) => {
                if (
                    profileUserId ||
                    filterPendingRef.current ||
                    !filtersReady ||
                    fetchRequestRef.current ||
                    fetchingListings ||
                    loading ||
                    loadingMore ||
                    !hasMore ||
                    (paginationError && !retry)
                ) {
                    return;
                }

                return requestListings(
                    buildFetchParams(page + 1),
                    true
                );
            },
            [
                buildFetchParams,
                page,
                loading,
                loadingMore,
                hasMore,
                paginationError,
                profileUserId,
                filtersReady,
                fetchingListings,
                requestListings,
            ]
        );

    // Explicit retry following a failed
    // pagination request.
    const handleRetryPagination = () => {
        return handleLoadMore(true);
    };

    // Explicit recovery for a failed
    // first-page request.
    const handleRetryListings = async () => {
        if (
            profileUserId ||
            filterPendingRef.current ||
            fetchRequestRef.current
        ) {
            return;
        }

        filterPendingRef.current = true;
        setFilterPending(true);

        try {
            const result =
                await requestListings(
                    buildFetchParams(1),
                    false
                );

            if (result?.success) {
                setLoadedQueryKey(queryKey);
            } else {
                setLoadedQueryKey(null);
            }
        } finally {
            filterPendingRef.current = false;
            setFilterPending(false);
        }
    };

    // Suspend infinite scrolling after a failed
    // pagination request or during filter changes.
    useEffect(() => {
        const target =
            loadMoreRef.current;

        if (
            !target ||
            profileUserId ||
            !filtersReady ||
            fetchingListings ||
            loading ||
            loadingMore ||
            !hasMore ||
            paginationError
        ) {
            return;
        }

        const observer =
            new IntersectionObserver(
                (entries) => {
                    const entry =
                        entries[0];

                    if (
                        entry?.isIntersecting
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
        profileUserId,
        filtersReady,
        fetchingListings,
        loading,
        loadingMore,
        hasMore,
        paginationError,
    ]);

    // Open the create listing dialog.
    const handleCreate = () => {
        if (
            submissionLockRef.current ||
            deletionLockRef.current ||
            dialogOpen ||
            deleteDialogOpen
        ) {
            return;
        }

        setSubmissionError('');
        setSelectedListing(null);
        setDialogOpen(true);
    };

    // Open the edit listing dialog.
    const handleEditListing = (
        listing
    ) => {
        if (
            !listing?._id ||
            submissionLockRef.current ||
            deletionLockRef.current ||
            dialogOpen ||
            deleteDialogOpen
        ) {
            return;
        }

        setSubmissionError('');
        setSelectedListing(listing);
        setDialogOpen(true);
    };

    // Prevent cancellation while a listing
    // submission is in progress.
    const handleCloseDialog = () => {
        if (
            submissionLockRef.current
        ) {
            return;
        }

        setSubmissionError('');
        setSelectedListing(null);
        setDialogOpen(false);
    };

    // Open the deletion confirmation dialog.
    const handleDeleteListing = (
        listing
    ) => {
        if (
            !listing?._id ||
            submissionLockRef.current ||
            deletionLockRef.current ||
            dialogOpen ||
            deleteDialogOpen
        ) {
            return;
        }

        setDeletionError('');
        setSelectedListing(listing);
        setDeleteDialogOpen(true);
    };

    // Prevent cancellation while deletion
    // is in progress.
    const handleCloseDeleteDialog =
        () => {
            if (
                deletionLockRef.current
            ) {
                return;
            }

            setDeletionError('');
            setSelectedListing(null);
            setDeleteDialogOpen(false);
        };

    // Create or update a marketplace listing.
    const handleSubmit = async (
        data
    ) => {
        if (
            submissionLockRef.current ||
            deletionLockRef.current
        ) {
            return {
                success: false,
                skipped: true,
            };
        }

        submissionLockRef.current = true;

        setSubmitting(true);
        setSubmissionError('');

        try {
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
                setSubmissionError('');
                setDialogOpen(false);
                setSelectedListing(null);
            } else {
                setSubmissionError(
                    result?.error ||
                        'Unable to save listing. Please try again.'
                );
            }

            return result;
        } catch (requestError) {
            const message =
                requestError?.message ||
                'Unable to save listing. Please try again.';

            setSubmissionError(message);

            return {
                success: false,
                error: message,
            };
        } finally {
            submissionLockRef.current = false;
            setSubmitting(false);
        }
    };

    // Delete a marketplace listing.
    const handleDelete =
        async () => {
            if (
                !selectedListing?._id ||
                deletionLockRef.current ||
                submissionLockRef.current
            ) {
                return;
            }

            deletionLockRef.current = true;

            setDeleting(true);
            setDeletionError('');

            try {
                const result =
                    await dispatch(
                        deleteListing(
                            selectedListing._id
                        )
                    );

                if (result?.success) {
                    setDeletionError('');
                    setDeleteDialogOpen(false);
                    setSelectedListing(null);
                } else {
                    setDeletionError(
                        result?.error ||
                            'Unable to delete listing. Please try again.'
                    );
                }

                return result;
            } catch (requestError) {
                const message =
                    requestError?.message ||
                    'Unable to delete listing. Please try again.';

                setDeletionError(message);

                return {
                    success: false,
                    error: message,
                };
            } finally {
                deletionLockRef.current = false;
                setDeleting(false);
            }
        };

    // Update listing availability with
    // per-listing duplicate request protection.
    const handleToggleAvailability =
        async (listing) => {
            const listingId =
                listing?._id;

            if (
                !listingId ||
                submissionLockRef.current ||
                deletionLockRef.current ||
                availabilityLockRef.current.has(
                    listingId
                )
            ) {
                return;
            }

            availabilityLockRef.current.add(
                listingId
            );

            setAvailabilityError('');

            try {
                const result =
                    await dispatch(
                        updateListing(
                            listingId,
                            {
                                available:
                                    !listing.available,
                            }
                        )
                    );

                if (!result?.success) {
                    setAvailabilityError(
                        result?.error ||
                            'Unable to update listing availability.'
                    );
                }

                return result;
            } catch (requestError) {
                const message =
                    requestError?.message ||
                    'Unable to update listing availability.';

                setAvailabilityError(message);

                return {
                    success: false,
                    error: message,
                };
            } finally {
                availabilityLockRef.current.delete(
                    listingId
                );
            }
        };

    const handleOpenProfile = (
        userId
    ) => {
        if (
            !userId ||
            dialogOpen ||
            deleteDialogOpen ||
            submissionLockRef.current ||
            deletionLockRef.current
        ) {
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

    const visiblePageError =
        !dialogOpen &&
        !deleteDialogOpen &&
        !availabilityError &&
        !paginationError
            ? error
            : null;

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
                    disabled={
                        submitting ||
                        deleting ||
                        dialogOpen ||
                        deleteDialogOpen
                    }
                >
                    {t(
                        'Create Listing'
                    )}
                </Button>
            </Box>

            {visiblePageError && (
                <Alert
                    severity="error"
                    sx={{
                        mb: 3,
                        overflowWrap: 'anywhere',
                    }}
                    action={
                        !filtersReady ? (
                            <Button
                                color="inherit"
                                size="small"
                                onClick={
                                    handleRetryListings
                                }
                                disabled={
                                    filterPending ||
                                    fetchingListings ||
                                    loading ||
                                    loadingMore
                                }
                            >
                                {t('Retry')}
                            </Button>
                        ) : undefined
                    }
                >
                    {t(visiblePageError)}
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
                    (
                        loading ||
                        fetchingListings ||
                        filterPending
                    ) &&
                    (
                        !listings ||
                        listings.length === 0
                    )
                }
                error={
                    visiblePageError
                }
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
                            filtersReady &&
                            paginationError && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        width: '100%',
                                        overflowWrap: 'anywhere',
                                    }}
                                    action={
                                        <Button
                                            color="inherit"
                                            size="small"
                                            onClick={
                                                handleRetryPagination
                                            }
                                            disabled={
                                                loading ||
                                                loadingMore ||
                                                fetchingListings ||
                                                filterPending
                                            }
                                        >
                                            {t('Retry')}
                                        </Button>
                                    }
                                >
                                    {t(paginationError)}
                                </Alert>
                            )}

                        {!loadingMore &&
                            filtersReady &&
                            !paginationError &&
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
                            filtersReady &&
                            !paginationError &&
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
                loading={
                    submitting
                }
                error={
                    submissionError
                }
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
                loading={
                    deleting
                }
                error={
                    deletionError
                }
                onConfirm={
                    handleDelete
                }
            />

            <Snackbar
                open={
                    Boolean(availabilityError)
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
                onClose={(_, reason) => {
                    if (
                        reason !== 'clickaway'
                    ) {
                        setAvailabilityError('');
                    }
                }}
            >
                <Alert
                    severity="error"
                    onClose={() =>
                        setAvailabilityError('')
                    }
                    sx={{
                        width: '100%',
                        overflowWrap: 'anywhere',
                    }}
                >
                    {t(availabilityError)}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default Marketplace;