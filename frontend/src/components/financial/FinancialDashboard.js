import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from 'react';

import {
    useDispatch,
    useSelector
} from 'react-redux';

import { useTranslation } from 'react-i18next';

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Stack,
    Typography
} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import {
    fetchFinancialDashboard,
    fetchExpenseBreakdown,
    fetchProjectProfitability,
    fetchCashFlow,
    clearFinancialData
} from '../../redux/actions/financialActions';

import {
    fetchSubscription
} from '../../redux/actions/subscriptionActions';

import FinancialSummaryCards from './FinancialSummaryCards';
import ExpenseBreakdown from './ExpenseBreakdown';
import ProjectProfitability from './ProjectProfitability';
import CashFlowList from './CashFlowList';
import ExportFinancialReport from './ExportFinancialReport';

import UpgradeDialog from '../subscription/UpgradeDialog';


const FinancialDashboard = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    // ============================================================
    // REDUX STATE
    // ============================================================

    const {
        dashboard,
        expenseBreakdown,
        projectProfitability,
        cashFlow,
        loading,
        error
    } = useSelector(state => state.financial);

    const token = useSelector(
        state => state.auth.token
    );

    // ============================================================
    // ACCESS STATE
    // ============================================================

    const [accessStatus, setAccessStatus] =
        useState('checking');

    const [accessError, setAccessError] =
        useState('');

    const [expiresAt, setExpiresAt] =
        useState(null);

    const [upgradeDialogOpen, setUpgradeDialogOpen] =
        useState(false);

    const verificationInProgress = useRef(false);

    const verificationVersion = useRef(0);

    const financialDataLoaded = useRef(false);

    const expiryTimer = useRef(null);

    // ============================================================
    // CLEAR EXPIRY TIMER
    // ============================================================

    const clearExpiryTimer = useCallback(() => {
        if (expiryTimer.current) {
            clearTimeout(expiryTimer.current);
            expiryTimer.current = null;
        }
    }, []);

    // ============================================================
    // VERIFY SUBSCRIPTION
    // ============================================================

    const checkPremiumAccess = useCallback(
        async () => {
            if (verificationInProgress.current) {
                return;
            }

            verificationInProgress.current = true;

            const version = ++verificationVersion.current;
            const sessionToken = token;

            setAccessStatus(previous =>
                previous === 'allowed'
                    ? previous
                    : 'checking'
            );

            setAccessError('');

            try {
                if (!sessionToken) {
                    dispatch(clearFinancialData());

                    financialDataLoaded.current = false;

                    setExpiresAt(null);
                    setAccessStatus('error');

                    setAccessError(
                        t('Please log in to continue.')
                    );

                    return;
                }

                const result = await dispatch(
                    fetchSubscription()
                );

                // Ignore results belonging to an outdated
                // verification attempt or changed session.

                if (
                    version !== verificationVersion.current ||
                    localStorage.getItem('token') !== sessionToken
                ) {
                    return;
                }

                if (!result.success) {
                    dispatch(clearFinancialData());

                    financialDataLoaded.current = false;

                    setExpiresAt(null);
                    setAccessStatus('error');

                    setAccessError(
                        result.message ||
                        t('Unable to verify your subscription.')
                    );

                    return;
                }

                const subscription = result.data;

                const hasPremiumAccess =
                    subscription?.isPremium === true &&
                    subscription?.features
                        ?.financialDashboard === true;

                if (!hasPremiumAccess) {
                    dispatch(clearFinancialData());

                    financialDataLoaded.current = false;

                    setExpiresAt(null);
                    setAccessStatus('restricted');

                    return;
                }

                const expiry =
                    subscription?.subscription?.expiresAt;

                const expiryTimestamp =
                    expiry ? new Date(expiry).getTime() : NaN;

                if (
                    !Number.isFinite(expiryTimestamp) ||
                    expiryTimestamp <= Date.now()
                ) {
                    dispatch(clearFinancialData());

                    financialDataLoaded.current = false;

                    setExpiresAt(null);
                    setAccessStatus('restricted');

                    return;
                }

                setExpiresAt(expiryTimestamp);

                setAccessStatus('allowed');
            } finally {
                verificationInProgress.current = false;
            }
        },
        [dispatch, token, t]
    );

    // ============================================================
    // INITIAL CHECK AND SESSION CHANGE
    // ============================================================

    useEffect(() => {
        verificationVersion.current += 1;

        verificationInProgress.current = false;
        financialDataLoaded.current = false;

        clearExpiryTimer();

        dispatch(clearFinancialData());

        setExpiresAt(null);
        setAccessStatus('checking');

        checkPremiumAccess();

        return () => {
            verificationVersion.current += 1;
            clearExpiryTimer();
        };
    }, [
        checkPremiumAccess,
        clearExpiryTimer,
        dispatch
    ]);

    // ============================================================
    // RECHECK WHEN PAGE BECOMES ACTIVE
    // ============================================================

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (
                document.visibilityState === 'visible'
            ) {
                checkPremiumAccess();
            }
        };

        const handleWindowFocus = () => {
            checkPremiumAccess();
        };

        document.addEventListener(
            'visibilitychange',
            handleVisibilityChange
        );

        window.addEventListener(
            'focus',
            handleWindowFocus
        );

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );

            window.removeEventListener(
                'focus',
                handleWindowFocus
            );
        };
    }, [checkPremiumAccess]);

    // ============================================================
    // AUTOMATIC EXPIRY CHECK
    // ============================================================

    useEffect(() => {
        clearExpiryTimer();

        if (
            accessStatus !== 'allowed' ||
            !expiresAt
        ) {
            return undefined;
        }

        const remainingTime =
            expiresAt - Date.now();

        if (remainingTime <= 0) {
            dispatch(clearFinancialData());

            financialDataLoaded.current = false;

            setExpiresAt(null);
            setAccessStatus('checking');

            checkPremiumAccess();

            return undefined;
        }

        expiryTimer.current = setTimeout(() => {
            dispatch(clearFinancialData());

            financialDataLoaded.current = false;

            setExpiresAt(null);
            setAccessStatus('checking');

            checkPremiumAccess();
        }, Math.min(remainingTime, 2147483647));

        return clearExpiryTimer;
    }, [
        accessStatus,
        expiresAt,
        dispatch,
        checkPremiumAccess,
        clearExpiryTimer
    ]);

    // ============================================================
    // FETCH FINANCIAL DATA ONCE PER VERIFIED ACCESS
    // ============================================================

    useEffect(() => {
        if (
            accessStatus !== 'allowed' ||
            financialDataLoaded.current
        ) {
            return;
        }

        financialDataLoaded.current = true;

        dispatch(fetchFinancialDashboard());
        dispatch(fetchExpenseBreakdown());
        dispatch(fetchProjectProfitability());
        dispatch(fetchCashFlow());
    }, [
        accessStatus,
        dispatch
    ]);

    // ============================================================
    // FINANCIAL LOADING STATE
    // ============================================================

    const financialLoading = useMemo(
        () => Boolean(
            loading?.dashboard ||
            loading?.expenses ||
            loading?.profitability ||
            loading?.cashFlow
        ),
        [
            loading?.dashboard,
            loading?.expenses,
            loading?.profitability,
            loading?.cashFlow
        ]
    );

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <Container
            maxWidth="xl"
            sx={{
                py: 3,
                pb: 10
            }}
        >
            {/* PAGE HEADER */}

            <Box
                display="flex"
                justifyContent="space-between"
                alignItems={{
                    xs: 'stretch',
                    md: 'center'
                }}
                flexDirection={{
                    xs: 'column',
                    md: 'row'
                }}
                gap={2}
                mb={4}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                    >
                        {t('Financial Dashboard')}
                    </Typography>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                    >
                        {t(
                            'Track your farm income, expenses and profits.'
                        )}
                    </Typography>
                </Box>

                {accessStatus === 'allowed' && (
                    <ExportFinancialReport
                        disabled={financialLoading}
                        dashboard={dashboard}
                        expenseBreakdown={expenseBreakdown}
                        projectProfitability={projectProfitability}
                        cashFlow={cashFlow}
                    />
                )}
            </Box>

            {/* VERIFYING ACCESS */}

            {accessStatus === 'checking' && (
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={2}
                    sx={{ py: 8 }}
                >
                    <CircularProgress />

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {t('Checking your subscription...')}
                    </Typography>
                </Stack>
            )}

            {/* SUBSCRIPTION ERROR */}

            {accessStatus === 'error' && (
                <Box sx={{ maxWidth: 600, mx: 'auto' }}>
                    <Alert
                        severity="warning"
                        sx={{ mb: 2 }}
                    >
                        {accessError}
                    </Alert>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={checkPremiumAccess}
                    >
                        {t('Try Again')}
                    </Button>
                </Box>
            )}

            {/* FREE OR EXPIRED SUBSCRIPTION */}

            {accessStatus === 'restricted' && (
                <Box
                    sx={{
                        maxWidth: 650,
                        mx: 'auto',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 3,
                        p: {
                            xs: 3,
                            sm: 4
                        },
                        textAlign: 'center'
                    }}
                >
                    <Stack
                        spacing={2}
                        alignItems="center"
                    >
                        <LockOutlinedIcon
                            color="primary"
                            sx={{ fontSize: 48 }}
                        />

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            {t(
                                'Financial Dashboard is a Premium feature'
                            )}
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                        >
                            {t(
                                'Upgrade to RoamAgro Premium to access your consolidated financial dashboard, expense breakdown, project profitability and cash flow reports.'
                            )}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t(
                                'You can still manage expenses and harvests within your existing Farm Projects on the Free plan.'
                            )}
                        </Typography>

                        <Button
                            variant="contained"
                            startIcon={
                                <WorkspacePremiumOutlinedIcon />
                            }
                            onClick={() =>
                                setUpgradeDialogOpen(true)
                            }
                            sx={{ mt: 2 }}
                        >
                            {t('View Premium Plans')}
                        </Button>
                    </Stack>
                </Box>
            )}

            {/* PREMIUM FINANCIAL CONTENT */}

            {accessStatus === 'allowed' && (
                <>
                    {loading.dashboard ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            py={6}
                        >
                            <CircularProgress />
                        </Box>
                    ) : error.dashboard ? (
                        <Alert
                            severity="error"
                            sx={{ mb: 5 }}
                        >
                            {error.dashboard}
                        </Alert>
                    ) : (
                        <Box mb={5}>
                            <FinancialSummaryCards
                                dashboard={dashboard}
                            />
                        </Box>
                    )}

                    <Box mb={5}>
                        <ExpenseBreakdown
                            loading={loading.expenses}
                            error={error.expenses}
                            data={expenseBreakdown}
                        />
                    </Box>

                    <Box mb={5}>
                        <ProjectProfitability
                            loading={loading.profitability}
                            error={error.profitability}
                            projects={projectProfitability}
                        />
                    </Box>

                    <Box mb={2}>
                        <CashFlowList
                            loading={loading.cashFlow}
                            error={error.cashFlow}
                            cashFlow={cashFlow}
                        />
                    </Box>
                </>
            )}

            {/* UPGRADE DIALOG */}

            <UpgradeDialog
                open={upgradeDialogOpen}
                onClose={() =>
                    setUpgradeDialogOpen(false)
                }
                resource="financialDashboard"
            />
        </Container>
    );
};

export default FinancialDashboard;