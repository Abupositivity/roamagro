import React from 'react';
import {
Stack,
Chip,
Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

const LocationFilter = ({
    locations = [],
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
                {t('Location')}
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

                {locations.map((location) => (
                    <Chip
                        key={location}
                        label={location}
                        clickable
                        color={
                            value === location
                                ? 'primary'
                                : 'default'
                        }
                        onClick={() =>
                            onChange(location)
                        }
                    />
                ))}
            </Stack>
        </>
    );
};

export default LocationFilter;