import React from 'react';
import { useTranslation } from 'react-i18next';

import {
    Paper,
    Typography,
    Stack,
    TextField,
    Button,
    CircularProgress,
} from '@mui/material';

const PriceForm = ({
    newPrice,
    loading,
    onChange,
    onSubmit,
}) => {
    const { t } = useTranslation();

    return (
        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 3,
                mb: 4,
            }}
        >
            <Typography
                variant="h6"
                mb={2}
            >
                {t('Update Price')}
            </Typography>
            <Stack
                component="form"
                spacing={2}
                onSubmit={onSubmit}
            >
                <TextField
                    label={t('Product')}
                    name="product"
                    value={newPrice.product}
                    onChange={onChange}
                    fullWidth
                    required
                />
                <TextField
                    label={t('Category')}
                    name="category"
                    value={newPrice.category}
                    onChange={onChange}
                    fullWidth
                />
                <TextField
                    label={t('Price')}
                    name="price"
                    type="number"
                    value={newPrice.price}
                    onChange={onChange}
                    fullWidth
                    required
                />
                <TextField
                    label={t('Unit')}
                    name="unit"
                    value={newPrice.unit}
                    onChange={onChange}
                    fullWidth
                />
                <TextField
                    label={t('Location')}
                    name="location"
                    value={newPrice.location}
                    onChange={onChange}
                    fullWidth
                    required
                />
                <TextField
                    label={t('Market')}
                    name="market"
                    value={newPrice.market}
                    onChange={onChange}
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
    );
};

export default PriceForm;