import React from 'react';
import {
    Paper,
    TextField,
    InputAdornment,
} from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';

import { useTranslation } from 'react-i18next';

const CommunitySearchBar = ({
    search,
    onSearchChange,
}) => {

    const { t } = useTranslation();

    return (

        <Paper
            elevation={2}
            sx={{
                p: 2,
                mb: 3,
                borderRadius: 3,
            }}
        >

            <TextField
                fullWidth
                value={search}
                onChange={(e) =>
                    onSearchChange(e.target.value)
                }
                placeholder={t(
                    'Search discussions...'
                )}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon />
                        </InputAdornment>
                    ),
                }}
            />

        </Paper>

    );

};

export default CommunitySearchBar;