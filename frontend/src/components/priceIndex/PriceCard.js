import React from 'react';
import {
Paper,
Typography,
Chip,
Stack,
Box,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PriceTrendBadge from './PriceTrendBadge';

const PriceCard = ({
    entry,
    bestPrice = false,
    trend = 'stable',
}) => {

    const { t } = useTranslation();

    return (

        <Paper
            elevation={2}
            sx={{
                p:3,
                borderRadius:3,
                height:'100%',
                display:'flex',
                flexDirection:'column',
                justifyContent:'space-between',
            }}
        >

            <Box>

                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="flex-start"
                    mb={2}
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        {entry.product}
                    </Typography>

                    <Stack spacing={1}>

                        {bestPrice && (

                            <Chip
                                label={t('Best Price')}
                                color="success"
                                size="small"
                            />

                        )}

                        <PriceTrendBadge
                            trend={trend}
                        />

                    </Stack>

                </Stack>

                {entry.category && (

                    <Typography
                        color="text.secondary"
                        gutterBottom
                    >
                        {entry.category}
                    </Typography>

                )}

                <Typography gutterBottom>

                    <strong>{t('Price')}:</strong>{' '}

                    ₦{Number(entry.price).toLocaleString()}

                </Typography>

                <Typography gutterBottom>

                    <strong>{t('Unit')}:</strong>{' '}

                    {entry.unit}

                </Typography>

                <Typography gutterBottom>

                    <strong>{t('Location')}:</strong>{' '}

                    {entry.location}

                </Typography>

                {entry.market && (

                    <Typography gutterBottom>

                        <strong>{t('Market')}:</strong>{' '}

                        {entry.market}

                    </Typography>

                )}

            </Box>

            <Box mt={2}>

                {entry.user?.name && (

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >

                        {t('Submitted by')}:{' '}

                        {entry.user.name}

                    </Typography>

                )}

                <Typography
                    variant="caption"
                    color="text.secondary"
                >

                    {new Date(
                        entry.createdAt
                    ).toLocaleDateString()}

                </Typography>

            </Box>

        </Paper>

    );

};

export default PriceCard;