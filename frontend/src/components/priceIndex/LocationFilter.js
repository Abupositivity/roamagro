import React from 'react';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

const LocationFilter = ({
    locations = [],
    value = 'All',
    onChange,
}) => {

    const { t } = useTranslation();

    return (
        <FormControl
            fullWidth
            size="small"
        >
            <InputLabel>
                {t('State')}
            </InputLabel>

            <Select
                value={value}
                label={t('State')}
                onChange={(e) =>
                    onChange(e.target.value)
                }
            >
                <MenuItem value="All">
                    {t('All States')}
                </MenuItem>

                {locations.map((location) => (
                    <MenuItem
                        key={location}
                        value={location}
                    >
                        {t(location)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default LocationFilter;