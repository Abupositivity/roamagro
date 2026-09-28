import React from 'react';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Chip,
    Box,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useTranslation } from 'react-i18next';

const PriceAlertCard = ({
    alert,
    onDelete,
    deleting = false,
}) => {
    const { t } = useTranslation();

    const targetPrice = Number(alert?.targetPrice || 0);

    return (
        <Card
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <CardContent
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Stack spacing={2}>
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {alert?.product || t('Unknown Product')}
                        </Typography>

                        {alert?.location && (
                            <Typography
                                color="text.secondary"
                                variant="body2"
                                sx={{ mt: 0.5 }}
                            >
                                {alert.location}
                            </Typography>
                        )}
                    </Box>

                    <Chip
                        icon={<NotificationsActiveIcon />}
                        label={`${t(alert?.alertType || 'Above')} ₦${targetPrice.toLocaleString()}`}
                        color={alert?.active === false ? 'default' : 'primary'}
                        variant={
                            alert?.active === false
                                ? 'outlined'
                                : 'filled'
                        }
                    />

                    {alert?.active === false && (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t('This price alert is inactive.')}
                        </Typography>
                    )}

                    <Button
                        color="error"
                        variant="outlined"
                        onClick={() => onDelete(alert?._id)}
                        disabled={deleting || !alert?._id}
                        sx={{ mt: 'auto' }}
                    >
                        {deleting
                            ? t('Deleting...')
                            : t('Delete Alert')}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PriceAlertCard;