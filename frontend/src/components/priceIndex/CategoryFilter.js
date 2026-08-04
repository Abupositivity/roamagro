import React from 'react';
import {
Stack,
Chip,
Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const CategoryFilter = ({
    categories = [],
    value,
    onChange,
}) => {

    const { t } = useTranslation();

    return (
        <>
            <Typography
                variant="subtitle2"
                fontWeight={600}
                mb={1}
            >
                {t('Category')}
            </Typography>

            <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                mb={3}
            >
                <Chip
                    label={t('All')}
                    clickable
                    color={
                        value === 'All'
                            ? 'primary'
                            : 'default'
                    }
                    onClick={() => onChange('All')}
                />

                {categories.map((category) => (
                    <Chip
                        key={category}
                        label={category}
                        clickable
                        color={
                            value === category
                                ? 'primary'
                                : 'default'
                        }
                        onClick={() =>
                            onChange(category)
                        }
                    />
                ))}
            </Stack>
        </>
    );
};

export default CategoryFilter;