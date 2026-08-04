import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPriceIndex,
    submitPrice,
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

const PriceIndex = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        priceIndex,
        loading,
        error,
    } = useSelector(
        (state) => state.priceIndex
    );

    const {
        alerts,
        loading: alertsLoading,
    } = useSelector(
        state => state.priceAlerts
    );

    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLocation, setSelectedLocation] = useState('All');

    const [newPrice, setNewPrice] = useState({
        product: '',
        category: '',
        price: '',
        unit: 'Bag',
        location: '',
        market: '',
    });

    useEffect(() => {
        dispatch(fetchPriceIndex());
        dispatch(fetchPriceAlerts());
    }, [dispatch]);

    const handleChange = (e) => {
        setNewPrice((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !newPrice.product ||
            !newPrice.price ||
            !newPrice.location
        ) {
            return;
        }

        dispatch(submitPrice(newPrice))
            .then(() => {
                dispatch(fetchPriceIndex());
            });

        setNewPrice({
            product: '',
            category: '',
            price: '',
            unit: 'Bag',
            location: '',
            market: '',
        });
    };

    const handleCreateAlert = (data) => {
    dispatch(createPriceAlert(data))
        .then(() => {
            dispatch(fetchPriceAlerts());
        });
    };

    const handleDeleteAlert = (id) => {
    dispatch(deletePriceAlert(id))
        .then(() => {

            dispatch(fetchPriceAlerts());
        });
    };

    const categories = useMemo(
        () => [
            ...new Set(
                priceIndex
                    .map(item => item.category)
                    .filter(Boolean)
            ),
        ],
        [priceIndex]
    );

    const locations = useMemo(
        () => [
            ...new Set(
                priceIndex
                    .map(item => item.location)
                    .filter(Boolean)
            ),
        ],
        [priceIndex]
    );

    const filteredPrices = useMemo(() => {
        return priceIndex.filter((entry) => {

        const keyword = search.toLowerCase();

        const matchesSearch =
            (entry.product || '')
                .toLowerCase()
                .includes(keyword) ||
            (entry.location || '')
                .toLowerCase()
                .includes(keyword) ||
            (entry.market || '')
                .toLowerCase()
                .includes(keyword);
        const matchesCategory =
            selectedCategory === 'All' ||
            entry.category === selectedCategory;

        const matchesLocation =
            selectedLocation === 'All' ||
            entry.location === selectedLocation;
        return (
            matchesSearch &&
            matchesCategory &&
            matchesLocation
        );
        });
    }, [priceIndex, search, selectedCategory, selectedLocation]);

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
                {t('Local Price Index')}
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
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}
            <Box my={3}>
            <PriceSummaryCards
                prices={filteredPrices}
            />
            </Box>
            <Box my={3}>
            <PriceTrendSummary
                prices={filteredPrices}
            />
            </Box>
            <Box my={3}>
            <PriceSearchBar
                search={search}
                onSearchChange={setSearch}
            />
            </Box>
            <Box my={3}>
            <CategoryFilter
                categories={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
            />
            </Box>
            <Box my={3}>
            <LocationFilter
                locations={locations}
                value={selectedLocation}
                onChange={setSelectedLocation}
            />
            </Box>
            <Box my={3}>
            <MarketComparison
                prices={filteredPrices}
            />
            </Box>
            <Box my={3}>
            <PriceInsights
                prices={filteredPrices}
            />
            </Box>
            <Box my={3}>
            <PriceForm
                newPrice={newPrice}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
            </Box>
            <Typography
                variant="h5"
                fontWeight={700}
                mt={4}
                mb={2}
            >
                {t("Price Alerts")}
            </Typography>
            <Box my={3}>
            <PriceAlertForm
                loading={alertsLoading}
                onSubmit={handleCreateAlert}
            />
            </Box>
            <Box my={3}>
            <PriceAlertList
                alerts={alerts || []}
                onDelete={handleDeleteAlert}
            />
            </Box>
            <Box my={3}>
            <RecentPrices
                prices={filteredPrices}
                loading={loading}
            />
            </Box>
        </Container>
    );
};

export default PriceIndex;