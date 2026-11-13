import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';

import {
    useNavigate,
    useSearchParams,
} from 'react-router-dom';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import { useTranslation } from 'react-i18next';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PaymentIcon from '@mui/icons-material/Payment';

import {
    verifyPremiumPayment,
} from '../redux/actions/paymentActions';

import {
    fetchSubscription,
} from '../redux/actions/subscriptionActions';

const REFERENCE_PATTERN = /^roamagro_[a-f0-9]{36}$/;

const PaymentResult = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [searchParams] = useSearchParams();

    const reference =
        searchParams.get('reference') ||
        searchParams.get('trxref') ||
        '';

    const token = useSelector(
        (state) => state.auth.token
    );

    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const verificationKey = `${token}:${reference}`;

    const lastAttemptRef = useRef(null);
    const attemptIdRef = useRef(0);

    const verifyPayment = useCallback(async () => {
        if (!REFERENCE_PATTERN.test(reference)) {
            setError(t('Invalid payment reference.'));
            setResult(null);
            return;
        }

        const attemptId = ++attemptIdRef.current;

        setLoading(true);
        setError(null);
        setResult(null);

        const response = await dispatch(
            verifyPremiumPayment(reference)
        );

        if (attemptId !== attemptIdRef.current) {
            return;
        }

        if (!response.success) {
            setError(response.message);
            setLoading(false);
            return;
        }

        const payment = response.data;

        if (payment?.status === 'success') {
            const refresh = await dispatch(
                fetchSubscription()
            );

            if (attemptId !== attemptIdRef.current) {
                return;
            }

            setResult({
                status: 'success',
                subscriptionRefreshed:
                    refresh.success === true,
            });
        } else {
            setResult({
                status: payment?.status || 'pending',
            });
        }

        setLoading(false);
    }, [dispatch, reference, t]);

    useEffect(() => {
        if (lastAttemptRef.current === verificationKey) {
            return;
        }

        lastAttemptRef.current = verificationKey;

        verifyPayment();
    }, [verificationKey, verifyPayment]);

    useEffect(() => {
        return () => {
            attemptIdRef.current += 1;
        };
    }, []);

    const status = result?.status;

    const isSuccess = status === 'success';

    const isPending = status === 'pending';

    const isFailed =
        status === 'failed' ||
        status === 'abandoned';

    const isUnknown =
        status &&
        !isSuccess &&
        !isPending &&
        !isFailed;

    const statusIcon = loading
        ? null
        : isSuccess
            ? (
                <CheckCircleOutlineIcon
                    sx={{
                        fontSize: {
                            xs: 48,
                            sm: 60,
                        },
                        color: 'success.main',
                    }}
                />
            )
            : error || isFailed
                ? (
                    <ErrorOutlineIcon
                        sx={{
                            fontSize: {
                                xs: 48,
                                sm: 60,
                            },
                            color: 'error.main',
                        }}
                    />
                )
                : isPending || isUnknown
                    ? (
                        <HourglassEmptyIcon
                            sx={{
                                fontSize: {
                                    xs: 48,
                                    sm: 60,
                                },
                                color: 'warning.main',
                            }}
                        />
                    )
                    : (
                        <PaymentIcon
                            sx={{
                                fontSize: {
                                    xs: 48,
                                    sm: 60,
                                },
                                color: 'primary.main',
                            }}
                        />
                    );

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 640,
                mx: 'auto',
                py: {
                    xs: 2,
                    sm: 4,
                },
                px: {
                    xs: 0,
                    sm: 2,
                },
                minWidth: 0,
            }}
        >
            <Card
                variant="outlined"
                sx={{
                    width: '100%',
                    borderRadius: {
                        xs: 2,
                        sm: 3,
                    },
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                }}
            >
                <CardContent
                    sx={{
                        p: {
                            xs: 2,
                            sm: 3,
                            md: 4,
                        },
                        '&:last-child': {
                            pb: {
                                xs: 2,
                                sm: 3,
                                md: 4,
                            },
                        },
                    }}
                >
                    <Stack
                        spacing={{
                            xs: 2.5,
                            sm: 3,
                        }}
                        alignItems="center"
                        sx={{
                            width: '100%',
                            minWidth: 0,
                        }}
                    >
                        <Box
                            aria-hidden="true"
                            sx={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                width: {
                                    xs: 76,
                                    sm: 92,
                                },
                                height: {
                                    xs: 76,
                                    sm: 92,
                                },
                                borderRadius: '50%',
                                bgcolor: 'action.hover',
                            }}
                        >
                            {loading ? (
                                <CircularProgress
                                    size={42}
                                    thickness={4}
                                />
                            ) : (
                                statusIcon
                            )}
                        </Box>

                        <Box
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                textAlign: 'center',
                            }}
                        >
                            <Typography
                                variant="h4"
                                component="h1"
                                fontWeight={700}
                                sx={{
                                    fontSize: {
                                        xs: '1.5rem',
                                        sm: '1.875rem',
                                        md: '2rem',
                                    },
                                    lineHeight: 1.3,
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {t('Payment Status')}
                            </Typography>

                            {loading && (
                                <Typography
                                    variant="body1"
                                    color="text.secondary"
                                    sx={{ mt: 1.5 }}
                                >
                                    {t(
                                        'Verifying your payment...'
                                    )}
                                </Typography>
                            )}
                        </Box>

                        <Box
                            role="status"
                            aria-live="polite"
                            sx={{
                                width: '100%',
                                minWidth: 0,
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {!loading && error && (
                                <Alert
                                    severity="error"
                                    sx={{
                                        alignItems: 'flex-start',
                                        '& .MuiAlert-message': {
                                            minWidth: 0,
                                            overflowWrap: 'anywhere',
                                        },
                                    }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {!loading && isSuccess && (
                                <Alert
                                    severity="success"
                                    sx={{
                                        alignItems: 'flex-start',
                                        '& .MuiAlert-message': {
                                            minWidth: 0,
                                            overflowWrap: 'anywhere',
                                        },
                                    }}
                                >
                                    {t(
                                        'Payment successful! Your Premium subscription is active.'
                                    )}

                                    {!result.subscriptionRefreshed && (
                                        <Typography
                                            variant="body2"
                                            sx={{ mt: 1 }}
                                        >
                                            {t(
                                                'Payment was confirmed, but subscription information could not be refreshed. Please refresh your subscription page.'
                                            )}
                                        </Typography>
                                    )}
                                </Alert>
                            )}

                            {!loading && isPending && (
                                <Alert severity="info">
                                    {t(
                                        'Your payment is still pending. Please try verifying again shortly.'
                                    )}
                                </Alert>
                            )}

                            {!loading && isFailed && (
                                <Alert severity="warning">
                                    {t(
                                        'Payment was not completed. You can try again from the subscription page.'
                                    )}
                                </Alert>
                            )}

                            {!loading && isUnknown && (
                                <Alert severity="info">
                                    {t(
                                        'Payment confirmation is not available yet. Please retry verification.'
                                    )}
                                </Alert>
                            )}
                        </Box>

                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={1.5}
                            sx={{
                                width: '100%',
                                pt: {
                                    xs: 0.5,
                                    sm: 1,
                                },
                            }}
                        >
                            {!isSuccess && (
                                <Button
                                    variant="contained"
                                    size="large"
                                    fullWidth
                                    disabled={loading}
                                    onClick={verifyPayment}
                                    sx={{
                                        minHeight: 48,
                                        fontWeight: 600,
                                        textTransform: 'none',
                                        whiteSpace: 'normal',
                                        textAlign: 'center',
                                        py: 1.25,
                                    }}
                                >
                                    {t('Verify Payment')}
                                </Button>
                            )}

                            <Button
                                variant={
                                    isSuccess
                                        ? 'contained'
                                        : 'outlined'
                                }
                                size="large"
                                fullWidth
                                onClick={() =>
                                    navigate('/subscription')
                                }
                                sx={{
                                    minHeight: 48,
                                    fontWeight: 600,
                                    textTransform: 'none',
                                    whiteSpace: 'normal',
                                    textAlign: 'center',
                                    py: 1.25,
                                }}
                            >
                                {t('Back to Subscription')}
                            </Button>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PaymentResult;