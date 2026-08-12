import React, { useState } from 'react';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    TextField,
    MenuItem,
    Button,
    CircularProgress,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

const PriceAlertForm = ({
    open = false,
    onClose,
    onSubmit,
    loading = false,
}) => {
    const { t } = useTranslation();

    const [form, setForm] = useState({
        product: '',
        location: '',
        targetPrice: '',
        alertType: 'Above',
    });

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !form.product.trim() ||
            !form.targetPrice
        ) {
            return;
        }

        onSubmit(form);
    };

    const handleClose = () => {
        if (loading) {
            return;
        }

        setForm({
            product: '',
            location: '',
            targetPrice: '',
            alertType: 'Above',
        });

        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                {t('Create Price Alert')}
            </DialogTitle>

            <Stack
                component="form"
                onSubmit={handleSubmit}
            >
                <DialogContent>
                    <Stack spacing={2}>
                        <TextField
                            label={t('Product')}
                            name="product"
                            value={form.product}
                            onChange={handleChange}
                            fullWidth
                            required
                            autoFocus
                        />

                        <TextField
                            label={t('State')}
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            fullWidth
                            placeholder={t(
                                'e.g. Kaduna'
                            )}
                        />

                        <TextField
                            label={t('Target Price')}
                            name="targetPrice"
                            type="number"
                            value={form.targetPrice}
                            onChange={handleChange}
                            fullWidth
                            required
                            inputProps={{
                                min: 1,
                            }}
                        />

                        <TextField
                            select
                            label={t('Notify Me')}
                            name="alertType"
                            value={form.alertType}
                            onChange={handleChange}
                            fullWidth
                        >
                            <MenuItem value="Above">
                                {t(
                                    'When price is Above'
                                )}
                            </MenuItem>

                            <MenuItem value="Below">
                                {t(
                                    'When price is Below'
                                )}
                            </MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 3,
                    }}
                >
                    <Button
                        onClick={handleClose}
                        disabled={loading}
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress
                                size={22}
                                color="inherit"
                            />
                        ) : (
                            t('Save Alert')
                        )}
                    </Button>
                </DialogActions>
            </Stack>
        </Dialog>
    );
};

export default PriceAlertForm;