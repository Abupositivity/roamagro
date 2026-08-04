import React from 'react';
import { Chip } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import { useTranslation } from 'react-i18next';

const PriceTrendBadge = ({
    trend = 'stable',
}) => {

    const { t } = useTranslation();

    if (trend === 'rising') {

        return (
            <Chip
                icon={<TrendingUpIcon />}
                label={t('Rising')}
                color="success"
                size="small"
            />
        );

    }

    if (trend === 'falling') {

        return (
            <Chip
                icon={<TrendingDownIcon />}
                label={t('Falling')}
                color="error"
                size="small"
            />
        );
    }

    return (
        <Chip
            icon={<TrendingFlatIcon />}
            label={t('Stable')}
            color="default"
            size="small"
        />
    );

};

export default PriceTrendBadge;