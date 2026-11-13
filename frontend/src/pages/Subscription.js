import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';

import {
    fetchSubscription,
    fetchSubscriptionPlans,
} from '../redux/actions/subscriptionActions';

import {
    initializePremiumPayment,
} from '../redux/actions/paymentActions';

const PREMIUM_FEATURES = [
    'Unlimited Farm Projects',
    'Unlimited Marketplace Listings',
    'Financial Dashboard',
    'Financial Report Exports',
    'No Ads',
];

const formatAmount = (amount) => {
    if (
        typeof amount !== 'number' ||
        !Number.isFinite(amount)
    ) {
        return null;
    }

    return `₦${amount.toLocaleString('en-NG')}`;
};

const getPrice = (pricing, cycle) => {
    if (!pricing || typeof pricing !== 'object') {
        return null;
    }

    const value = pricing[cycle];

    if (typeof value === 'number') {
        return formatAmount(value);
    }

    if (value && typeof value === 'object') {
        return formatAmount(
            value.amount ?? value.price
        );
    }

    return null;
};

const Subscription = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        data: subscription,
        loading,
        loaded,
        error,
    } = useSelector((state) => state.subscription);

    const [plans, setPlans] = useState([]);
    const [plansError, setPlansError] = useState(null);
    const [plansLoading, setPlansLoading] = useState(true);

    const [paymentLoading, setPaymentLoading] = useState(null);
    const [paymentError, setPaymentError] = useState(null);

    const checkoutInProgress = useRef(false);
    const mountedRef = useRef(true);

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
        };
    }, []);

    const loadPlans = useCallback(async (isActive) => {
        setPlansLoading(true);
        setPlansError(null);

        const result = await dispatch(
            fetchSubscriptionPlans()
        );

        if (!isActive()) {
            return;
        }

        if (result.success) {
            const nextPlans = result.data?.plans;

            if (Array.isArray(nextPlans)) {
                setPlans(nextPlans);
            } else {
                setPlans([]);
                setPlansError(
                    t('Could not load subscription plans.')
                );
            }
        } else {
            setPlans([]);
            setPlansError(result.message);
        }

        setPlansLoading(false);
    }, [dispatch, t]);

    useEffect(() => {
        let active = true;

        loadPlans(() => active);

        return () => {
            active = false;
        };
    }, [loadPlans]);

    const refreshSubscription = () => {
        dispatch(fetchSubscription());
    };

    const retryPlans = () => {
        loadPlans(() => mountedRef.current);
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

            if (!mountedRef.current) {
                return;
            }

            if (!result.success) {
                setPaymentError(result.message);
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
            if (mountedRef.current) {
                setPaymentError(
                    t('Could not start payment. Please try again.')
                );
            }
        } finally {
            checkoutInProgress.current = false;

            if (mountedRef.current) {
                setPaymentLoading(null);
            }
        }
    };

    const isPremium = subscription?.isPremium === true;
    const showSubscription = loaded && !!subscription;

    const freePlan = plans.find(
        (plan) => plan.id === 'free'
    );

    const premiumPlan = plans.find(
        (plan) => plan.id === 'premium'
    );

    const formatUsage = (usage) => {
        if (!usage) {
            return '—';
        }

        const used = Number.isFinite(usage.used)
            ? usage.used
            : 0;

        if (usage.limit === null) {
            return `${used} / ${t('Unlimited')}`;
        }

        return `${used} / ${usage.limit}`;
    };

    const renderUsage = (title, usage) => {
        if (!usage) {
            return null;
        }

        const unlimited = usage.limit === null;

        const used = Number.isFinite(usage.used)
            ? usage.used
            : 0;

        const percentage = unlimited
            ? 0
            : usage.limit > 0
                ? Math.min(
                    100,
                    Math.max(
                        0,
                        (used / usage.limit) * 100
                    )
                )
                : 100;

        return (
            <Grid item xs={12} sm={6} key={title}>
                <Card
                    variant="outlined"
                    sx={{ height: '100%' }}
                >
                    <CardContent>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            gutterBottom
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            {formatUsage(usage)}
                        </Typography>

                        {!unlimited && (
                            <LinearProgress
                                variant="determinate"
                                value={percentage}
                                sx={{ mt: 2, mb: 1 }}
                            />
                        )}

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {unlimited
                                ? t('Unlimited')
                                : usage.canCreate
                                    ? `${t('Remaining')}: ${usage.remaining}`
                                    : t('Free plan limit reached')}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        );
    };

    const expiryDate =
        subscription?.subscription?.expiresAt;

    const formattedExpiry = expiryDate
        ? new Date(expiryDate)
        : null;

    const hasValidExpiry =
        formattedExpiry &&
        !Number.isNaN(formattedExpiry.getTime());

    const premiumMonthlyPrice = getPrice(
        premiumPlan?.pricing,
        'monthly'
    );

    const premiumAnnualPrice = getPrice(
        premiumPlan?.pricing,
        'annual'
    );

    const freeLimitProjects =
        freePlan?.limits?.farmProjects ?? 3;

    const freeLimitListings =
        freePlan?.limits?.marketplaceListings ?? 3;

    const checkoutDisabled =
        !!paymentLoading ||
        !showSubscription ||
        loading;

    return (
        <Box sx={{ py: 3 }}>
            <Stack spacing={3}>
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        gutterBottom
                    >
                        {t('My Subscription')}
                    </Typography>

                    <Typography color="text.secondary">
                        {t(
                            'View your plan, usage limits and Premium benefits.'
                        )}
                    </Typography>
                </Box>

                {error && (
                    <Alert
                        severity="error"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={refreshSubscription}
                                disabled={loading}
                            >
                                {t('Retry')}
                            </Button>
                        }
                    >
                        {error}
                    </Alert>
                )}

                {loading && (
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            py: 3,
                        }}
                    >
                        <CircularProgress size={28} />
                    </Box>
                )}

                {!loading && showSubscription && (
                    <Card variant="outlined">
                        <CardContent>
                            <Stack
                                direction={{
                                    xs: 'column',
                                    sm: 'row',
                                }}
                                justifyContent="space-between"
                                alignItems={{
                                    xs: 'flex-start',
                                    sm: 'center',
                                }}
                                spacing={2}
                            >
                                <Box>
                                    <Typography
                                        variant="overline"
                                        color="text.secondary"
                                    >
                                        {t('Current Plan')}
                                    </Typography>

                                    <Typography
                                        variant="h5"
                                        fontWeight={700}
                                    >
                                        {isPremium
                                            ? t('Premium')
                                            : t('Free Plan')}
                                    </Typography>
                                </Box>

                                <Chip
                                    label={
                                        isPremium
                                            ? t('Active Subscription')
                                            : t('Free Plan')
                                    }
                                    color={
                                        isPremium
                                            ? 'primary'
                                            : 'default'
                                    }
                                />
                            </Stack>

                            {isPremium && hasValidExpiry && (
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mt: 2 }}
                                >
                                    {t('Expires On')}:{' '}
                                    {formattedExpiry.toLocaleDateString(
                                        'en-NG',
                                        {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                        }
                                    )}
                                </Typography>
                            )}

                            <Divider sx={{ my: 3 }} />

                            <Typography
                                variant="h6"
                                gutterBottom
                            >
                                {t('Subscription and Usage')}
                            </Typography>

                            <Grid container spacing={2}>
                                {renderUsage(
                                    t('Farm Projects'),
                                    subscription.usage?.farmProjects
                                )}

                                {renderUsage(
                                    t('Marketplace Listings'),
                                    subscription.usage?.marketplaceListings
                                )}
                            </Grid>

                            <Button
                                variant="outlined"
                                onClick={refreshSubscription}
                                disabled={loading}
                                sx={{ mt: 3 }}
                            >
                                {t('Refresh')}
                            </Button>
                        </CardContent>
                    </Card>
                )}

                <Typography
                    variant="h5"
                    fontWeight={700}
                >
                    {t('Subscription Plan')}
                </Typography>

                {plansLoading && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}

                {plansError && (
                    <Alert
                        severity="warning"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                onClick={retryPlans}
                                disabled={plansLoading}
                            >
                                {t('Retry')}
                            </Button>
                        }
                    >
                        {plansError}
                    </Alert>
                )}

                {!plansLoading &&
                    !plansError &&
                    plans.length > 0 && (
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <Card
                                    variant="outlined"
                                    sx={{ height: '100%' }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {t('Free Plan')}
                                            </Typography>

                                            <Typography
                                                variant="h4"
                                                fontWeight={700}
                                            >
                                                ₦0
                                            </Typography>

                                            <Typography color="text.secondary">
                                                {t(
                                                    freePlan?.description ||
                                                    'Essential tools for managing your agribusiness.'
                                                )}
                                            </Typography>

                                            <Divider />

                                            <Typography>
                                                {t('Farm Projects')}:{' '}
                                                {freeLimitProjects}
                                            </Typography>

                                            <Typography>
                                                {t('Marketplace Listings')}:{' '}
                                                {freeLimitListings}
                                            </Typography>

                                            <Typography>
                                                {t('Price Index')}
                                            </Typography>

                                            <Typography>
                                                {t('Community')}
                                                {' / '}
                                                {t('Agri-Feed')}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: '100%',
                                        borderColor: 'primary.main',
                                    }}
                                >
                                    <CardContent>
                                        <Stack spacing={2}>
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                            >
                                                <Typography
                                                    variant="h5"
                                                    fontWeight={700}
                                                >
                                                    {t('Premium')}
                                                </Typography>

                                                <Chip
                                                    label={t('Premium')}
                                                    color="primary"
                                                    size="small"
                                                />
                                            </Stack>

                                            <Box>
                                                <Typography
                                                    variant="h4"
                                                    fontWeight={700}
                                                >
                                                    {premiumMonthlyPrice}

                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {' '}
                                                        / {t('Monthly')}
                                                    </Typography>
                                                </Typography>

                                                <Typography color="text.secondary">
                                                    {premiumAnnualPrice}
                                                    {' '}
                                                    / {t('Annual')}
                                                </Typography>
                                            </Box>

                                            <Typography color="text.secondary">
                                                {t(
                                                    premiumPlan?.description ||
                                                    'Unlimited projects and listings with advanced financial tools.'
                                                )}
                                            </Typography>

                                            <Divider />

                                            {PREMIUM_FEATURES.map(
                                                (feature) => (
                                                    <Typography key={feature}>
                                                        ✓ {t(feature)}
                                                    </Typography>
                                                )
                                            )}

                                            {paymentError && (
                                                <Alert severity="error">
                                                    {paymentError}
                                                </Alert>
                                            )}

                                            <Alert severity="info">
                                                {isPremium
                                                    ? t(
                                                        'Your Premium subscription is active. You can renew it to extend your expiry date.'
                                                    )
                                                    : t(
                                                        'Choose a billing cycle to activate Premium.'
                                                    )}
                                            </Alert>

                                            <Stack
                                                direction={{
                                                    xs: 'column',
                                                    sm: 'row',
                                                }}
                                                spacing={2}
                                            >
                                                <Button
                                                    variant="contained"
                                                    fullWidth
                                                    disabled={
                                                        checkoutDisabled ||
                                                        !premiumMonthlyPrice
                                                    }
                                                    onClick={() =>
                                                        startCheckout('monthly')
                                                    }
                                                    startIcon={
                                                        paymentLoading ===
                                                        'monthly'
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
                                                        : `${t('Pay')} ${premiumMonthlyPrice} / ${t('Monthly')}`}
                                                </Button>

                                                <Button
                                                    variant="outlined"
                                                    fullWidth
                                                    disabled={
                                                        checkoutDisabled ||
                                                        !premiumAnnualPrice
                                                    }
                                                    onClick={() =>
                                                        startCheckout('annual')
                                                    }
                                                    startIcon={
                                                        paymentLoading ===
                                                        'annual'
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
                                                        : `${t('Pay')} ${premiumAnnualPrice} / ${t('Yearly')}`}
                                                </Button>
                                            </Stack>

                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {t(
                                                    'Payments are processed securely by Paystack. Subscriptions do not renew automatically.'
                                                )}
                                            </Typography>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    )}
            </Stack>
        </Box>
    );
};

export default Subscription;