import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPriceIndex,
    submitPrice,
} from '../../redux/actions/priceIndexActions';
import { useTranslation } from 'react-i18next';

import {
    Container,
    Typography,
    Alert,
} from '@mui/material';

import PriceSummaryCards from './PriceSummaryCards';
import PriceTrendSummary from './PriceTrendSummary';
import PriceForm from './PriceForm';
import PriceSearchBar from './PriceSearchBar';
import CategoryFilter from './CategoryFilter';
import LocationFilter from './LocationFilter';
import RecentPrices from './RecentPrices';
import MarketComparison from './MarketComparison';

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

        dispatch(submitPrice(newPrice));

        setNewPrice({
            product: '',
            category: '',
            price: '',
            unit: 'Bag',
            location: '',
            market: '',
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

    const filteredPrices = priceIndex.filter((entry) => {

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
            <PriceSummaryCards
                prices={filteredPrices}
            />
            <PriceTrendSummary
                prices={filteredPrices}
            />
            <PriceSearchBar
                search={search}
                onSearchChange={setSearch}
            />
            <CategoryFilter
                categories={categories}
                value={selectedCategory}
                onChange={setSelectedCategory}
            />
            <LocationFilter
                locations={locations}
                value={selectedLocation}
                onChange={setSelectedLocation}
            />
            <PriceForm
                newPrice={newPrice}
                loading={loading}
                onChange={handleChange}
                onSubmit={handleSubmit}
            />
            <RecentPrices
                prices={filteredPrices}
                loading={loading}
            />
            <MarketComparison
                prices={filteredPrices}
            />
        </Container>
    );
};

export default PriceIndex;