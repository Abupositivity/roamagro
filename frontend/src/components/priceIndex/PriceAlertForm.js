import React, { useState } from 'react';
import {
Paper,
Typography,
Stack,
TextField,
MenuItem,
Button,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const PriceAlertForm = ({
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

        setForm(prev => ({

            ...prev,

            [e.target.name]: e.target.value,

        }));

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (
            !form.product ||
            !form.targetPrice
        ) {
            return;
        }

        onSubmit(form);

        setForm({

            product: '',

            location: '',

            targetPrice: '',

            alertType: 'Above',

        });

    };

    return (

        <Paper
            sx={{
                p:3,
                borderRadius:3,
                mb:4,
            }}
        >

            <Typography
                variant="h6"
                mb={2}
            >
                {t('Create Price Alert')}
            </Typography>

            <Stack
                spacing={2}
                component="form"
                onSubmit={handleSubmit}
            >

                <TextField
                    label={t('Product')}
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    fullWidth
                />

                <TextField
                    label={t('Location')}
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    fullWidth
                />

                <TextField
                    label={t('Target Price')}
                    name="targetPrice"
                    type="number"
                    value={form.targetPrice}
                    onChange={handleChange}
                    fullWidth
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

                        {t('When price is Above')}

                    </MenuItem>

                    <MenuItem value="Below">

                        {t('When price is Below')}

                    </MenuItem>

                </TextField>

                <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                >

                    {t('Save Alert')}

                </Button>

            </Stack>

        </Paper>

    );

};

export default PriceAlertForm;