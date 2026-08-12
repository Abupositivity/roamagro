import React, {
    useEffect,
    useState,
} from 'react';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import {
    fetchPriceIndex,
    submitPrice,
    deletePrice,
} from '../../redux/actions/priceIndexActions';

import {
    fetchPriceAlerts,
    createPriceAlert,
    deletePriceAlert,
} from '../../redux/actions/priceAlertActions';

import { useTranslation } from 'react-i18next';

import {
    Container,
    Typography,
    Alert,
    Box,
    Button,
    Stack,
} from '@mui/material';

import PriceSummaryCards from './PriceSummaryCards';
import PriceTrendSummary from './PriceTrendSummary';
import PriceForm from './PriceForm';
import PriceSearchBar from './PriceSearchBar';
import CategoryFilter from './CategoryFilter';
import LocationFilter from './LocationFilter';
import RecentPrices from './RecentPrices';
import MarketComparison from './MarketComparison';
import PriceAlertForm from './PriceAlertForm';
import PriceAlertList from './PriceAlertList';
import PriceInsights from './PriceInsights';

const PRICE_PAGE_SIZE = 12;

/*
 * Fixed category options.
 *
 * These are no longer generated from the
 * currently loaded price records.
 */
const PRICE_CATEGORIES = [
    'Cereals',
    'Legumes',
    'Tubers',
    'Vegetables',
    'Fruits',
    'Livestock',
    'Poultry',
    'Fish',
    'Other',
];

/*
 * Fixed Nigerian state options.
 *
 * These are available even when there are
 * no price records loaded for that state.
 */
const NIGERIAN_STATES = [
    'Abia',
    'Adamawa',
    'Akwa Ibom',
    'Anambra',
    'Bauchi',
    'Bayelsa',
    'Benue',
    'Borno',
    'Cross River',
    'Delta',
    'Ebonyi',
    'Edo',
    'Ekiti',
    'Enugu',
    'Gombe',
    'Imo',
    'Jigawa',
    'Kaduna',
    'Kano',
    'Katsina',
    'Kebbi',
    'Kogi',
    'Kwara',
    'Lagos',
    'Nasarawa',
    'Niger',
    'Ogun',
    'Ondo',
    'Osun',
    'Oyo',
    'Plateau',
    'Rivers',
    'Sokoto',
    'Taraba',
    'Yobe',
    'Zamfara',
    'Federal Capital Territory',
];

const PriceIndex = () => {
    const { t } = useTranslation();

    const dispatch = useDispatch();

    const {
        priceIndex,
        loading,
        loadingMore,
        error,
        hasMore,
        page,
    } = useSelector(
        (state) => state.priceIndex
    );

    const {
        alerts,
        loading: alertsLoading,
        error: alertsError,
    } = useSelector(
        (state) => state.priceAlerts
    );

    const currentUser = useSelector(
        (state) => state.auth?.user
    );

    const [search, setSearch] =
        useState('');

    const [
        selectedCategory,
        setSelectedCategory,
    ] = useState('All');

    const [
        selectedLocation,
        setSelectedLocation,
    ] = useState('All');

    const [
        showMyPrices,
        setShowMyPrices,
    ] = useState(false);

    const [
        priceDialogOpen,
        setPriceDialogOpen,
    ] = useState(false);

    const [
        alertDialogOpen,
        setAlertDialogOpen,
    ] = useState(false);

    const [
        deletingPriceId,
        setDeletingPriceId,
    ] = useState(null);

    const [newPrice, setNewPrice] =
        useState({
            product: '',
            category: '',
            price: '',
            unit: 'Bag',
            location: '',
            market: '',
        });

    /*
     * Fetch prices from the server.
     *
     * Search, category, location and
     * "my prices" are handled server-side.
     */
    useEffect(() => {
        const timer = setTimeout(() => {
            dispatch(
                fetchPriceIndex({
                    page: 1,
                    limit: PRICE_PAGE_SIZE,
                    search,
                    category:
                        selectedCategory,
                    location:
                        selectedLocation,
                    mine: showMyPrices,
                    append: false,
                })
            );
        }, 300);

        return () =>
            clearTimeout(timer);
    }, [
        dispatch,
        search,
        selectedCategory,
        selectedLocation,
        showMyPrices,
    ]);

    /*
     * Load price alerts once.
     */
    useEffect(() => {
        dispatch(fetchPriceAlerts());
    }, [dispatch]);

    const handleChange = (e) => {
        setNewPrice((prev) => ({
            ...prev,
            [e.target.name]:
                e.target.value,
        }));
    };

    const resetPriceForm = () => {
        setNewPrice({
            product: '',
            category: '',
            price: '',
            unit: 'Bag',
            location: '',
            market: '',
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (
            !newPrice.product.trim() ||
            !newPrice.price ||
            !newPrice.location ||
            !newPrice.market.trim()
        ) {
            return;
        }

        const result =
            await dispatch(
                submitPrice(newPrice)
            );

        if (result?.success) {
            resetPriceForm();
            setPriceDialogOpen(false);

            /*
             * Refresh page 1 after creating
             * a new price.
             */
            dispatch(
                fetchPriceIndex({
                    page: 1,
                    limit: PRICE_PAGE_SIZE,
                    search,
                    category:
                        selectedCategory,
                    location:
                        selectedLocation,
                    mine: showMyPrices,
                    append: false,
                })
            );
        }
    };

    const handleCreateAlert =
        async (data) => {
            const result =
                await dispatch(
                    createPriceAlert(data)
                );

            if (result?.success) {
                setAlertDialogOpen(false);

                dispatch(
                    fetchPriceAlerts()
                );
            }
        };

    const handleDeleteAlert =
        async (id) => {
            const result =
                await dispatch(
                    deletePriceAlert(id)
                );

            if (result?.success) {
                dispatch(
                    fetchPriceAlerts()
                );
            }
        };

    const handleDeletePrice =
        async (id) => {
            const confirmed =
                window.confirm(
                    t(
                        'Are you sure you want to delete this price submission?'
                    )
                );

            if (!confirmed) {
                return;
            }

            setDeletingPriceId(id);

            const result =
                await dispatch(
                    deletePrice(id)
                );

            setDeletingPriceId(null);

            if (!result?.success) {
                return;
            }
        };

    /*
     * Load the next server-side page.
     */
    const handleLoadMore = () => {
        if (
            loadingMore ||
            !hasMore
        ) {
            return;
        }

        dispatch(
            fetchPriceIndex({
                page: page + 1,
                limit: PRICE_PAGE_SIZE,
                search,
                category:
                    selectedCategory,
                location:
                    selectedLocation,
                mine: showMyPrices,
                append: true,
            })
        );
    };

    /*
     * IMPORTANT:
     *
     * These filter options are NOT generated
     * from priceIndex anymore.
     *
     * Therefore a category/state will still
     * appear even when it does not occur in
     * the currently loaded 12 records.
     */
    const categories =
        PRICE_CATEGORIES;

    const locations =
        NIGERIAN_STATES;

    /*
     * Filtering is handled by the backend.
     */
    const filteredPrices =
        priceIndex;

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 3,
                pb: 12,
            }}
        >
            <Typography
                variant="h4"
                fontWeight={700}
                gutterBottom
            >
                {t(
                    'Local Price Index'
                )}
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                mb={3}
            >
                {t(
                    'Help other farmers by sharing current market prices in your area.'
                )}
            </Typography>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {error}
                </Alert>
            )}

            {alertsError && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                >
                    {alertsError}
                </Alert>
            )}

            {/* Price Actions */}
            <Box sx={{ mb: 4 }}>
                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row',
                    }}
                    spacing={2}
                >
                    <Button
                        variant="contained"
                        size="large"
                        onClick={() =>
                            setPriceDialogOpen(
                                true
                            )
                        }
                        sx={{
                            flex: 1,
                        }}
                    >
                        {t(
                            'Update Price'
                        )}
                    </Button>

                    <Button
                        variant="outlined"
                        size="large"
                        onClick={() =>
                            setAlertDialogOpen(
                                true
                            )
                        }
                        sx={{
                            flex: 1,
                        }}
                    >
                        {t(
                            'Create Price Alert'
                        )}
                    </Button>
                </Stack>
            </Box>

            <Box my={3}>
                <PriceSummaryCards
                    prices={
                        filteredPrices
                    }
                />
            </Box>

            <Box my={3}>
                <PriceTrendSummary
                    prices={
                        filteredPrices
                    }
                />
            </Box>

            {/* Server-side Search */}
            <Box my={3}>
                <PriceSearchBar
                    search={search}
                    onSearchChange={
                        setSearch
                    }
                />
            </Box>

            {/* Server-side Category + Location */}
            <Box my={3}>
                <Stack
                    direction={{
                        xs: 'column',
                        md: 'row',
                    }}
                    spacing={2}
                >
                    <Box sx={{ flex: 1 }}>
                        <CategoryFilter
                            categories={
                                categories
                            }
                            value={
                                selectedCategory
                            }
                            onChange={
                                setSelectedCategory
                            }
                        />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <LocationFilter
                            locations={
                                locations
                            }
                            value={
                                selectedLocation
                            }
                            onChange={
                                setSelectedLocation
                            }
                        />
                    </Box>
                </Stack>
            </Box>

            <Box my={3}>
                <PriceAlertList
                    alerts={
                        alerts || []
                    }
                    onDelete={
                        handleDeleteAlert
                    }
                />
            </Box>

            <Box my={3}>
                <RecentPrices
                    prices={
                        filteredPrices
                    }
                    loading={loading}
                    loadingMore={
                        loadingMore
                    }
                    currentUser={
                        currentUser
                    }
                    onDelete={
                        handleDeletePrice
                    }
                    deletingPriceId={
                        deletingPriceId
                    }
                    showMyPrices={
                        showMyPrices
                    }
                    onToggleMyPrices={
                        setShowMyPrices
                    }
                    hasMore={hasMore}
                    onLoadMore={
                        handleLoadMore
                    }
                />
            </Box>

            <Box my={3}>
                <MarketComparison
                    prices={
                        filteredPrices
                    }
                />
            </Box>

            <Box my={3}>
                <PriceInsights
                    prices={
                        filteredPrices
                    }
                />
            </Box>

            {/* Update Price Dialog */}
            <PriceForm
                open={
                    priceDialogOpen
                }
                onClose={() =>
                    setPriceDialogOpen(
                        false
                    )
                }
                newPrice={newPrice}
                loading={loading}
                onChange={
                    handleChange
                }
                onSubmit={
                    handleSubmit
                }
                prices={priceIndex}
            />

            {/* Price Alert Dialog */}
            <PriceAlertForm
                open={
                    alertDialogOpen
                }
                onClose={() =>
                    setAlertDialogOpen(
                        false
                    )
                }
                loading={
                    alertsLoading
                }
                onSubmit={
                    handleCreateAlert
                }
            />
        </Container>
    );
};

export default PriceIndex;