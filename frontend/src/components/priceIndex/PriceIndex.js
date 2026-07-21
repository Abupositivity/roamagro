import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchPriceIndex,
    updatePriceIndex,
} from '../../redux/actions/priceIndexActions';

import { useTranslation } from 'react-i18next';

import {
    Container,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Stack,
    CircularProgress,
    Alert,
    Divider,
} from '@mui/material';

const PriceIndex = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        priceIndex,
        loading,
        error,
    } = useSelector((state) => state.priceIndex);

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

        dispatch(updatePriceIndex(newPrice));

        setNewPrice({
            product: '',
            category: '',
            price: '',
            unit: 'Bag',
            location: '',
            market: '',
        });
    };

    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 3,
                pb: 12, // Prevent Bottom Navigation overlap
            }}
        >
            <Typography variant="h4" fontWeight={700} gutterBottom>
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
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Paper
                elevation={2}
                sx={{
                    p: 3,
                    borderRadius: 3,
                    mb: 4,
                }}
            >
                <Typography variant="h6" mb={2}>
                    {t('Update Price')}
                </Typography>

                <Stack
                    spacing={2}
                    component="form"
                    onSubmit={handleSubmit}
                >
                    <TextField
                        label={t('Product')}
                        name="product"
                        value={newPrice.product}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label={t('Category')}
                        name="category"
                        value={newPrice.category}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label={t('Price')}
                        name="price"
                        type="number"
                        value={newPrice.price}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label={t('Unit')}
                        name="unit"
                        value={newPrice.unit}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label={t('Location')}
                        name="location"
                        value={newPrice.location}
                        onChange={handleChange}
                        fullWidth
                    />

                    <TextField
                        label={t('Market')}
                        name="market"
                        value={newPrice.market}
                        onChange={handleChange}
                        fullWidth
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress
                                size={22}
                                color="inherit"
                            />
                        ) : (
                            t('Submit Price')
                        )}
                    </Button>
                </Stack>
            </Paper>

            <Typography variant="h5" gutterBottom>
                {t('Recent Market Prices')}
            </Typography>

            <Divider sx={{ mb: 3 }} />

            {loading ? (
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    sx={{ py: 5 }}
                >
                    <CircularProgress />
                </Stack>
            ) : priceIndex.length === 0 ? (
                <Alert severity="info">
                    {t('No price records available yet.')}
                </Alert>
            ) : (
                <Grid container spacing={3}>
                    {priceIndex.map((entry) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={entry._id}
                        >
                            <Paper
                                elevation={2}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 3,
                                }}
                            >
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    gutterBottom
                                >
                                    {entry.product}
                                </Typography>

                                {entry.category && (
                                    <Typography
                                        color="text.secondary"
                                        gutterBottom
                                    >
                                        {entry.category}
                                    </Typography>
                                )}

                                <Typography>
                                    <strong>{t('Price')}:</strong>{' '}
                                    ₦
                                    {Number(
                                        entry.price
                                    ).toLocaleString()}
                                </Typography>

                                <Typography>
                                    <strong>{t('Unit')}:</strong>{' '}
                                    {entry.unit}
                                </Typography>

                                <Typography>
                                    <strong>{t('Location')}:</strong>{' '}
                                    {entry.location}
                                </Typography>

                                {entry.market && (
                                    <Typography>
                                        <strong>{t('Market')}:</strong>{' '}
                                        {entry.market}
                                    </Typography>
                                )}

                                {entry.submittedBy?.name && (
                                    <Typography
                                        mt={2}
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {t('Submitted by')}:{' '}
                                        {entry.submittedBy.name}
                                    </Typography>
                                )}

                                <Typography
                                    variant="caption"
                                    display="block"
                                    mt={1}
                                    color="text.secondary"
                                >
                                    {new Date(
                                        entry.createdAt
                                    ).toLocaleDateString()}
                                </Typography>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            )}
        </Container>
    );
};

export default PriceIndex;