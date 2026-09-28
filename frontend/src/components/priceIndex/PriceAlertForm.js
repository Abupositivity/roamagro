import React, { useEffect, useState } from 'react';
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
    Alert,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const INITIAL_FORM = {
    product: '',
    location: '',
    targetPrice: '',
    alertType: 'Above',
};

const PriceAlertForm = ({
    open = false,
    onClose,
    onSubmit,
    loading = false,
}) => {
    const { t } = useTranslation();

    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState('');

    useEffect(() => {
        if (open) {
            setError('');
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        if (error) {
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const product = form.product.trim();
        const location = form.location.trim();
        const targetPrice = Number(form.targetPrice);

        if (!product) {
            setError(t('Product is required.'));
            return;
        }

        if (!Number.isFinite(targetPrice) || targetPrice <= 0) {
            setError(
                t('Target price must be greater than zero.')
            );
            return;
        }

        if (!['Above', 'Below'].includes(form.alertType)) {
            setError(t('Please select a valid alert type.'));
            return;
        }

        const result = await onSubmit({
            product,
            location,
            targetPrice,
            alertType: form.alertType,
        });

        if (result?.success === false) {
            setError(
                result.error ||
                result.message ||
                t('Unable to create price alert.')
            );
        }
    };

    const handleClose = () => {
        if (loading) {
            return;
        }

        setForm(INITIAL_FORM);
        setError('');
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
                        {error && (
                            <Alert severity="error">
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label={t('Product')}
                            name="product"
                            value={form.product}
                            onChange={handleChange}
                            fullWidth
                            required
                            autoFocus
                            disabled={loading}
                        />

                        <TextField
                            label={t('State')}
                            name="location"
                            value={form.location}
                            onChange={handleChange}
                            fullWidth
                            placeholder={t('e.g. Kaduna')}
                            disabled={loading}
                        />

                        <TextField
                            label={t('Target Price')}
                            name="targetPrice"
                            type="number"
                            value={form.targetPrice}
                            onChange={handleChange}
                            fullWidth
                            required
                            disabled={loading}
                            inputProps={{
                                min: 1,
                                step: 1,
                            }}
                        />

                        <TextField
                            select
                            label={t('Notify Me')}
                            name="alertType"
                            value={form.alertType}
                            onChange={handleChange}
                            fullWidth
                            disabled={loading}
                        >
                            <MenuItem value="Above">
                                {t('When price is Above')}
                            </MenuItem>

                            <MenuItem value="Below">
                                {t('When price is Below')}
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