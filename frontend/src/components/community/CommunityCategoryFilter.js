import React from 'react';
import {
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const categories = [
    'Crop Production',
    'Livestock',
    'Poultry',
    'Soil Health',
    'Pest Control',
    'Diseases',
    'Climate',
    'Weather',
    'Market Prices',
    'Government Support',
    'Mechanization',
    'Agribusiness',
    'Finance',
    'Technology',
    'General',
];

const CommunityCategoryFilter = ({
    value = 'All',
    onChange,
}) => {
    const { t } = useTranslation();

    return (
        <Paper
            elevation={2}
            sx={{
                p: 1.5,
                borderRadius: 3,
                height: '100%',
            }}
        >
            <FormControl fullWidth size="small">
                <InputLabel>
                    {t('Category')}
                </InputLabel>

                <Select
                    label={t('Category')}
                    value={value}
                    onChange={(e) =>
                        onChange(e.target.value)
                    }
                >
                    <MenuItem value="All">
                        {t('All Categories')}
                    </MenuItem>

                    {categories.map((category) => (
                        <MenuItem
                            key={category}
                            value={category}
                        >
                            {t(category)}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
        </Paper>
    );
};

export default CommunityCategoryFilter;