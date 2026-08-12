import React from 'react';

import {
    Stack,
    Chip,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

const CATEGORIES = [
    'All',
    'Crop',
    'Fruit',
    'Vegetable',
    'Livestock',
    'Poultry',
    'Fishery',
    'Equipment',
    'Farm Input',
    'Service',
    'Other',
];

const CategoryFilter = ({
    value = 'All',
    onChange,
}) => {
    const { t } = useTranslation();

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                overflowX: 'auto',
                pb: 1,
                width: '100%',
            }}
        >
            {CATEGORIES.map((category) => (
                <Chip
                    key={category}
                    label={t(category)}
                    clickable
                    color={
                        value === category
                            ? 'primary'
                            : 'default'
                    }
                    onClick={() =>
                        onChange?.(category)
                    }
                />
            ))}
        </Stack>
    );
};

export default CategoryFilter;