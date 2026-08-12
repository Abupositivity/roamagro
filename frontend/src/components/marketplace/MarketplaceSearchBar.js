import React from 'react';

import {
    TextField,
    InputAdornment,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

import { useTranslation } from 'react-i18next';

const MarketplaceSearchBar = ({
    search = '',
    onSearchChange,
}) => {
    const { t } = useTranslation();

    return (
        <TextField
            fullWidth
            value={search}
            onChange={(event) =>
                onSearchChange(
                    event.target.value
                )
            }
            placeholder={t(
                'Search products, category or location'
            )}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
        />
    );
};

export default MarketplaceSearchBar;