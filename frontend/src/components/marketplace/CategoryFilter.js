import React from 'react';

import {
    Stack,
    Chip,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

const defaultCategories = [
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
    categories = [],
    selected = 'All',
    onChange,
}) => {
    const { t } = useTranslation();

    const availableCategories = [
        ...new Set(
            [
                ...defaultCategories,
                ...categories,
            ].filter(Boolean)
        ),
    ];

    return (
        <Stack
            direction="row"
            spacing={1}
            sx={{
                overflowX: 'auto',
                pb: 1,
            }}
        >
            {availableCategories.map(
                (category) => (
                    <Chip
                        key={category}
                        label={t(category)}
                        clickable
                        color={
                            selected === category
                                ? 'primary'
                                : 'default'
                        }
                        onClick={() =>
                            onChange(category)
                        }
                    />
                )
            )}
        </Stack>
    );
};

export default CategoryFilter;