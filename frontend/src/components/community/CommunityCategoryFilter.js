import React from 'react';

import {
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';

import { useTranslation } from 'react-i18next';

const CommunityCategoryFilter = ({
    categories = [],
    value,
    onChange,
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

            <FormControl fullWidth>

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
                            {category}
                        </MenuItem>

                    ))}

                </Select>

            </FormControl>

        </Paper>

    );

};

export default CommunityCategoryFilter;