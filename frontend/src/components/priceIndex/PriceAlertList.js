import React from 'react';
import {
    Grid,
    Alert,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import PriceAlertCard from './PriceAlertCard';

const PriceAlertList = ({
    alerts = [],
    onDelete,
    deletingId = null,
}) => {
    const { t } = useTranslation();

    return (
        <>
            <Typography
                variant="h5"
                mb={3}
                fontWeight={700}
            >
                {t('My Price Alerts')}
            </Typography>

            {alerts.length === 0 ? (
                <Alert severity="info">
                    {t('No price alerts yet.')}
                </Alert>
            ) : (
                <Grid
                    container
                    spacing={3}
                >
                    {alerts.map((alert) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            lg={4}
                            key={alert._id}
                        >
                            <PriceAlertCard
                                alert={alert}
                                onDelete={onDelete}
                                deleting={
                                    deletingId === alert._id
                                }
                            />
                        </Grid>
                    ))}
                </Grid>
            )}
        </>
    );
};

export default PriceAlertList;