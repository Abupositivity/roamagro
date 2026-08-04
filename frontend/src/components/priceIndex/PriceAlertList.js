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
}) => {

    const { t } = useTranslation();

    return (

        <>

            <Typography
                variant="h5"
                mb={3}
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

                    {alerts.map(alert => (

                        <Grid
                            item
                            xs={12}
                            md={6}
                            lg={4}
                            key={alert._id}
                        >

                            <PriceAlertCard
                                alert={alert}
                                onDelete={onDelete}
                            />

                        </Grid>

                    ))}

                </Grid>

            )}

        </>

    );

};

export default PriceAlertList;