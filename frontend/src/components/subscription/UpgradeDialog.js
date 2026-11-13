
import React, {
    useRef,
    useState,
} from 'react';

import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Stack,
    Typography,
} from '@mui/material';

import {
    initializePremiumPayment,
} from '../../redux/actions/paymentActions';

const PREMIUM_FEATURES = [
    'Unlimited Farm Projects',
    'Unlimited Marketplace Listings',
    'Financial Dashboard',
    'Financial Report Exports',
    'No Ads',
];

const UpgradeDialog = ({
    open,
    onClose,
    resource = 'farmProjects',
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [paymentLoading, setPaymentLoading] = useState(null);
    const [paymentError, setPaymentError] = useState(null);

    const checkoutInProgress = useRef(false);

    const messages = {
        farmProjects:
            'Your Free plan allows up to 3 Farm Projects. Delete an existing project or upgrade to Premium to create more.',

        marketplaceListings:
            'Your Free plan allows up to 3 Marketplace listings. Delete an existing listing or upgrade to Premium to create more.',

        financialDashboard:
            'The Financial Dashboard is available on Premium. Upgrade to access financial summaries, expense breakdowns, project profitability and cash flow reports.',
    };

    const resourceMessage =
        messages[resource] || messages.farmProjects;

    const handleClose = () => {
        if (checkoutInProgress.current) {
            return;
        }

        setPaymentError(null);
        onClose();
    };

    const handleViewPlans = () => {
        if (checkoutInProgress.current) {
            return;
        }

        setPaymentError(null);
        onClose();
        navigate('/subscription');
    };

    const startCheckout = async (billingCycle) => {
        if (checkoutInProgress.current) {
            return;
        }

        checkoutInProgress.current = true;

        setPaymentLoading(billingCycle);
        setPaymentError(null);

        try {
            const result = await dispatch(
                initializePremiumPayment(billingCycle)
            );

            if (!result.success) {
                setPaymentError(
                    result.message ||
                    t(
                        'Could not start payment. Please try again.'
                    )
                );
                return;
            }

            const authorizationUrl =
                result.data?.authorizationUrl;

            let checkoutUrl;

            try {
                checkoutUrl = new URL(authorizationUrl);
            } catch {
                setPaymentError(
                    t('Invalid payment checkout URL.')
                );
                return;
            }

            if (
                checkoutUrl.protocol !== 'https:' ||
                !(
                    checkoutUrl.hostname === 'paystack.com' ||
                    checkoutUrl.hostname.endsWith('.paystack.com')
                )
            ) {
                setPaymentError(
                    t('Invalid payment checkout URL.')
                );
                return;
            }

            window.location.assign(checkoutUrl.href);
        } catch {
            setPaymentError(
                t(
                    'Could not start payment. Please try again.'
                )
            );
        } finally {
            checkoutInProgress.current = false;
            setPaymentLoading(null);
        }
    };

    const isLoading = paymentLoading !== null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="sm"
            aria-labelledby="upgrade-dialog-title"
        >
            <DialogTitle id="upgrade-dialog-title">
                {t('Upgrade to Premium')}
            </DialogTitle>

            <DialogContent>
                <Stack spacing={3}>
                    <Typography
                        variant="body1"
                        color="text.secondary"
                    >
                        {t(resourceMessage)}
                    </Typography>

                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t('RoamAgro Premium')}
                        </Typography>

                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            useFlexGap
                        >
                            {PREMIUM_FEATURES.map((feature) => (
                                <Chip
                                    key={feature}
                                    label={t(feature)}
                                    color="primary"
                                    variant="outlined"
                                />
                            ))}
                        </Stack>
                    </Box>

                    <Divider />

                    <Stack
                        direction={{
                            xs: 'column',
                            sm: 'row',
                        }}
                        spacing={2}
                    >
                        <Box
                            sx={{
                                flex: 1,
                                border: 1,
                                borderColor: 'divider',
                                borderRadius: 2,
                                p: 2,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                {t('Monthly')}
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                ₦500
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {t('per month')}
                            </Typography>

                            <Button
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                                disabled={isLoading}
                                onClick={() =>
                                    startCheckout('monthly')
                                }
                                startIcon={
                                    paymentLoading === 'monthly'
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : null
                                }
                            >
                                {paymentLoading === 'monthly'
                                    ? t('Starting Payment...')
                                    : `${t('Pay')} ₦500`}
                            </Button>
                        </Box>

                        <Box
                            sx={{
                                flex: 1,
                                border: 1,
                                borderColor: 'primary.main',
                                borderRadius: 2,
                                p: 2,
                            }}
                        >
                            <Typography
                                variant="subtitle2"
                                color="text.secondary"
                            >
                                {t('Yearly')}
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                ₦5,000
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {t('per year')}
                            </Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                sx={{ mt: 2 }}
                                disabled={isLoading}
                                onClick={() =>
                                    startCheckout('annual')
                                }
                                startIcon={
                                    paymentLoading === 'annual'
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : null
                                }
                            >
                                {paymentLoading === 'annual'
                                    ? t('Starting Payment...')
                                    : `${t('Pay')} ₦5,000`}
                            </Button>
                        </Box>
                    </Stack>

                    {paymentError && (
                        <Alert severity="error">
                            {paymentError}
                        </Alert>
                    )}

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {t(
                            'Payments are processed securely by Paystack. Subscriptions do not renew automatically.'
                        )}
                    </Typography>
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2,
                    flexWrap: 'wrap',
                    gap: 1,
                }}
            >
                <Button
                    onClick={handleClose}
                    disabled={isLoading}
                >
                    {t('Close')}
                </Button>

                <Button
                    variant="text"
                    onClick={handleViewPlans}
                    disabled={isLoading}
                >
                    {t('View Premium Plans')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default UpgradeDialog;