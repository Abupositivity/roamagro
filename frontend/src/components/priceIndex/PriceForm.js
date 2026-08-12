import React from 'react';
import { useTranslation } from 'react-i18next';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    TextField,
    Button,
    CircularProgress,
    MenuItem,
} from '@mui/material';

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

const CATEGORIES = [
    'Grain',
    'Livestock',
    'Poultry',
    'Fruit',
    'Vegetable',
    'Fishery',
    'Other',
];

const UNITS = [
    'Bag',
    'Kg',
    'Crate',
    'Basket',
    'Bunch',
    'Litre',
    'Piece',
    'Ton',
    'Carton',
    'Pack',
    'Animal',
    'Other',
];

const PriceForm = ({
    open = false,
    onClose,
    newPrice,
    loading = false,
    onChange,
    onSubmit,
}) => {
    const { t } = useTranslation();

    const handleClose = () => {
        if (!loading && onClose) {
            onClose();
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                {t('Update Price')}
            </DialogTitle>

            <Stack
                component="form"
                onSubmit={onSubmit}
            >
                <DialogContent>
                    <Stack spacing={2}>
                        <TextField
                            label={t('Product')}
                            name="product"
                            value={newPrice.product}
                            onChange={onChange}
                            fullWidth
                            required
                            autoFocus
                        />

                        <TextField
                            select
                            label={t('Category')}
                            name="category"
                            value={newPrice.category}
                            onChange={onChange}
                            fullWidth
                            helperText={t('Optional')}
                        >
                            <MenuItem value="">
                                {t('No category')}
                            </MenuItem>

                            {CATEGORIES.map((category) => (
                                <MenuItem
                                    key={category}
                                    value={category}
                                >
                                    {t(category)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Price')}
                            name="price"
                            type="number"
                            value={newPrice.price}
                            onChange={onChange}
                            fullWidth
                            required
                            inputProps={{
                                min: 1,
                                step: 'any',
                            }}
                        />

                        <TextField
                            select
                            label={t('Unit')}
                            name="unit"
                            value={newPrice.unit}
                            onChange={onChange}
                            fullWidth
                            required
                        >
                            {UNITS.map((unit) => (
                                <MenuItem
                                    key={unit}
                                    value={unit}
                                >
                                    {t(unit)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label={t('State')}
                            name="location"
                            value={newPrice.location}
                            onChange={onChange}
                            fullWidth
                            required
                        >
                            <MenuItem value="">
                                {t('Select state')}
                            </MenuItem>

                            {NIGERIAN_STATES.map((state) => (
                                <MenuItem
                                    key={state}
                                    value={state}
                                >
                                    {t(state)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Market')}
                            name="market"
                            value={newPrice.market}
                            onChange={onChange}
                            fullWidth
                            required
                            placeholder={t(
                                'e.g. Dawanau'
                            )}
                            helperText={t(
                                'Enter the specific market where the price was observed.'
                            )}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>
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
                            t('Submit Price')
                        )}
                    </Button>
                </DialogActions>
            </Stack>
        </Dialog>
    );
};

export default PriceForm;