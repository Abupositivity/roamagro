import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    fetchListings,
    createListing,
} from '../../redux/actions/marketplaceActions';

import { useTranslation } from 'react-i18next';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Snackbar,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

const Marketplace = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        listings,
        loading,
        success,
        error,
    } = useSelector((state) => state.marketplace);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        price: '',
        quantity: '',
        unit: 'Bag',
        location: '',
    });

    useEffect(() => {
        dispatch(fetchListings());
    }, [dispatch]);

    useEffect(() => {
        if (success) {
            setSnackbarOpen(true);
        }
    }, [success]);

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !formData.title ||
            !formData.description ||
            !formData.category ||
            !formData.price
        ) {
            return;
        }

        dispatch(createListing(formData));

        setFormData({
            title: '',
            description: '',
            category: '',
            price: '',
            quantity: '',
            unit: 'Bag',
            location: '',
        });
    };

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
                {t('Marketplace')}
            </Typography>

            <Paper
                elevation={3}
                sx={{
                    p: 3,
                    mb: 4,
                    borderRadius: 3,
                }}
            >
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {t('Create New Listing')}
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >

                    <Stack spacing={2}>

                        <TextField
                            label={t('Title')}
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            fullWidth
                            required
                        />

                        <TextField
                            label={t('Description')}
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            multiline
                            rows={4}
                            fullWidth
                            required
                        />

                        <FormControl fullWidth required>
                            <InputLabel>
                                {t('Category')}
                            </InputLabel>

                            <Select
                                label={t('Category')}
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <MenuItem value="produce">
                                    {t('Agro Produce')}
                                </MenuItem>

                                <MenuItem value="livestock">
                                    {t('Livestock')}
                                </MenuItem>

                                <MenuItem value="equipment">
                                    {t('Farm Equipment')}
                                </MenuItem>

                                <MenuItem value="services">
                                    {t('Farm Services')}
                                </MenuItem>

                                <MenuItem value="land">
                                    {t('Farmland')}
                                </MenuItem>
                            </Select>

                        </FormControl>

                        <Grid container spacing={2}>

                            <Grid item xs={12} md={4}>

                                <TextField
                                    label={t('Price')}
                                    name="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={handleChange}
                                    fullWidth
                                    required
                                />

                            </Grid>

                            <Grid item xs={12} md={4}>

                                <TextField
                                    label={t('Quantity')}
                                    name="quantity"
                                    type="number"
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    fullWidth
                                />

                            </Grid>

                            <Grid item xs={12} md={4}>

                                <TextField
                                    label={t('Unit')}
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    fullWidth
                                />

                            </Grid>

                        </Grid>

                        <TextField
                            label={t('Location')}
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            fullWidth
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                        >
                            {loading
                                ? t('Submitting...')
                                : t('Create Listing')}
                        </Button>

                    </Stack>

                </Box>
            </Paper>

            {loading && (
                <Box
                    display="flex"
                    justifyContent="center"
                    py={5}
                >
                    <CircularProgress />
                </Box>
            )}

            {!loading && listings.length === 0 && (

                <Paper sx={{ p: 4 }}>

                    <Typography align="center">

                        {t('No marketplace listings yet.')}

                    </Typography>

                </Paper>

            )}

            <Grid container spacing={3}>

                {listings.map((listing) => (

                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        key={listing._id}
                    >

                        <Card
                            sx={{
                                height: '100%',
                                borderRadius: 3,
                            }}
                        >

                            <CardContent>

                                <Typography
                                    variant="h6"
                                    gutterBottom
                                >
                                    {listing.title}
                                </Typography>

                                <Typography
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    {listing.category}
                                </Typography>

                                <Typography
                                    sx={{ mb: 2 }}
                                >
                                    {listing.description}
                                </Typography>

                                <Typography fontWeight={700}>
                                    ₦{Number(listing.price).toLocaleString()}
                                </Typography>

                                <Typography variant="body2">
                                    {listing.quantity} {listing.unit}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    📍 {listing.location}
                                </Typography>

                                {listing.user && (

                                    <Typography
                                        variant="caption"
                                        display="block"
                                        sx={{ mt: 1 }}
                                    >
                                        {t('Seller')}:
                                        {' '}
                                        {listing.user.name}
                                    </Typography>

                                )}

                            </CardContent>

                        </Card>

                    </Grid>

                ))}

            </Grid>

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={() => setSnackbarOpen(false)}
            >
                <Alert
                    severity="success"
                    variant="filled"
                    onClose={() => setSnackbarOpen(false)}
                >
                    {t('Listing created successfully!')}
                </Alert>
            </Snackbar>

            {error && (

                <Alert
                    severity="error"
                    sx={{ mt: 3 }}
                >
                    {error}
                </Alert>

            )}

        </Container>
    );
};

export default Marketplace;