import React from 'react';
import {
Card,
CardContent,
Typography,
Button,
Stack,
Chip,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useTranslation } from 'react-i18next';

const PriceAlertCard = ({
    alert,
    onDelete,
}) => {

    const { t } = useTranslation();

    return (

        <Card>

            <CardContent>

                <Stack
                    spacing={2}
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                    >
                        {alert.product}
                    </Typography>

                    {alert.location && (

                        <Typography
                            color="text.secondary"
                        >

                            {alert.location}

                        </Typography>

                    )}

                    <Chip
                        icon={<NotificationsActiveIcon />}
                        label={`${alert.alertType} ₦${Number(
                            alert.targetPrice
                        ).toLocaleString()}`}
                        color="primary"
                    />

                    <Button
                        color="error"
                        variant="outlined"
                        onClick={() =>
                            onDelete(alert._id)
                        }
                    >

                        {t('Delete Alert')}

                    </Button>

                </Stack>

            </CardContent>

        </Card>

    );

};

export default PriceAlertCard;