import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Grid,
    LinearProgress,
    Stack,
    Typography,
} from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';

import api from '../services/api';

import AdvertisementMedia from '../components/advertising/AdvertisementMedia';

const formatDate = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleDateString();
};

const formatDateTime = (value) => {
    if (!value) return '—';

    const date = new Date(value);

    return Number.isNaN(date.getTime())
        ? '—'
        : date.toLocaleString();
};

const formatMoney = (amount) =>
    new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 2,
    }).format(Number(amount) || 0);

const getProgress = (startsAt, endsAt) => {
    const start = new Date(startsAt).getTime();
    const end = new Date(endsAt).getTime();

    if (
        !Number.isFinite(start) ||
        !Number.isFinite(end) ||
        end <= start
    ) {
        return 0;
    }

    return Math.min(
        100,
        Math.max(
            0,
            ((Date.now() - start) / (end - start)) * 100
        )
    );
};

const MetricCard = ({ label, value }) => (
    <Card variant="outlined" sx={{ height: '100%' }}>
        <CardContent>
            <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
            >
                {label}
            </Typography>

            <Typography
                variant="h5"
                fontWeight={700}
                sx={{ overflowWrap: 'anywhere' }}
            >
                {value}
            </Typography>
        </CardContent>
    </Card>
);

const AdvertiserReport = () => {
    const { token } = useParams();
    const { t } = useTranslation();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchReport = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const response = await api.get(
                `/advertisements/report/${token}`
            );

            setReport(response.data?.data || null);
        } catch (requestError) {
            setReport(null);
            setError(
                requestError.response?.data?.message ||
                t('Report unavailable or link invalid.')
            );
        } finally {
            setLoading(false);
        }
    }, [token, t]);

    useEffect(() => {
        const referrer = document.createElement('meta');
        referrer.name = 'referrer';
        referrer.content = 'no-referrer';
        document.head.appendChild(referrer);

        const robots = document.createElement('meta');
        robots.name = 'robots';
        robots.content = 'noindex,nofollow,noarchive';
        document.head.appendChild(robots);

        fetchReport();

        return () => {
            referrer.remove();
            robots.remove();
        };
    }, [fetchReport]);

    const progress = report
        ? getProgress(report.startsAt, report.endsAt)
        : 0;

    const statusColor =
        report?.status === 'active'
            ? 'success'
            : report?.status === 'scheduled'
                ? 'info'
                : report?.status === 'paused'
                    ? 'warning'
                    : 'default';

    const metricDefinitions =
        report?.metricDefinitions || {};

    return (
        <Container
            maxWidth="md"
            sx={{ py: { xs: 3, sm: 5 }, pb: 8 }}
        >
            <Stack spacing={3}>
                <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    spacing={2}
                >
                    <Box>
                        <Typography
                            variant="overline"
                            color="primary.main"
                            fontWeight={700}
                        >
                            ROAMAGRO
                        </Typography>

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            {t('Advertising Report')}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchReport}
                        disabled={loading}
                    >
                        {t('Refresh')}
                    </Button>
                </Stack>

                {loading && (
                    <Box
                        sx={{
                            textAlign: 'center',
                            py: 4,
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}

                {error && (
                    <Alert severity="error">
                        {error}
                    </Alert>
                )}

                {!loading && report && (
                    <>
                        <Card variant="outlined">
                            {report.imageUrl && (
                                <AdvertisementMedia
                                    source={report.imageUrl}
                                    alt={report.title}
                                    variant="report"
                                />
                            )}

                            <CardContent>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="flex-start"
                                    spacing={2}
                                >
                                    <Box>
                                        <Typography
                                            variant="h6"
                                            fontWeight={700}
                                        >
                                            {report.title}
                                        </Typography>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {report.advertiserName}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={t(report.status)}
                                        color={statusColor}
                                        size="small"
                                    />
                                </Stack>

                                <Typography
                                    variant="body2"
                                    sx={{ mt: 2 }}
                                >
                                    {report.description}
                                </Typography>
                            </CardContent>
                        </Card>

                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <MetricCard
                                    label={t('Impressions')}
                                    value={Number(
                                        report.impressions || 0
                                    ).toLocaleString()}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <MetricCard
                                    label={t('Clicks')}
                                    value={Number(
                                        report.clicks || 0
                                    ).toLocaleString()}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <MetricCard
                                    label={t('Click-through rate')}
                                    value={`${Number(
                                        report.ctr || 0
                                    ).toFixed(2)}%`}
                                />
                            </Grid>

                            <Grid item xs={6}>
                                <MetricCard
                                    label={t('Effective cost per click')}
                                    value={
                                        report.effectiveCpc == null
                                            ? '—'
                                            : formatMoney(
                                                report.effectiveCpc
                                            )
                                    }
                                />
                            </Grid>
                        </Grid>

                        <Card variant="outlined">
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    gutterBottom
                                >
                                    {t('Campaign Progress')}
                                </Typography>

                                <LinearProgress
                                    variant="determinate"
                                    value={progress}
                                    sx={{
                                        height: 10,
                                        borderRadius: 5,
                                        my: 2,
                                    }}
                                />

                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                >
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {formatDate(report.startsAt)}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                    >
                                        {formatDate(report.endsAt)}
                                    </Typography>
                                </Stack>

                                <Divider sx={{ my: 2 }} />

                                <Stack spacing={1.5}>
                                    <Typography variant="body2">
                                        {t('Package')}: {' '}
                                        <strong>
                                            {t(
                                                report.packageName ||
                                                'custom'
                                            )}
                                        </strong>
                                    </Typography>

                                    <Typography variant="body2">
                                        {t('Campaign fee')}: {' '}
                                        <strong>
                                            {formatMoney(
                                                report.amountPaid
                                            )}
                                        </strong>
                                    </Typography>

                                    <Typography variant="body2">
                                        {t('Payment status')}: {' '}
                                        <strong>
                                            {t(
                                                report.paymentStatus ||
                                                'unpaid'
                                            )}
                                        </strong>
                                    </Typography>

                                    <Typography variant="body2">
                                        {t('Placement')}: {' '}
                                        <strong>
                                            {t(report.placement)}
                                        </strong>
                                    </Typography>

                                    <Typography variant="body2">
                                        {t('Target states')}: {' '}
                                        <strong>
                                            {report.targetStates?.length
                                                ? report.targetStates.join(', ')
                                                : t('All states')}
                                        </strong>
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Card variant="outlined">
                            <CardContent>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    gutterBottom
                                >
                                    {t('Understanding Your Report')}
                                </Typography>

                                <Stack spacing={2} sx={{ mt: 2 }}>
                                    {[
                                        [
                                            'Impressions',
                                            metricDefinitions.impressions,
                                        ],
                                        [
                                            'Clicks',
                                            metricDefinitions.clicks,
                                        ],
                                        [
                                            'Click-through rate',
                                            metricDefinitions.ctr,
                                        ],
                                        [
                                            'Effective cost per click',
                                            metricDefinitions.effectiveCpc,
                                        ],
                                    ]
                                        .filter(
                                            ([, definition]) =>
                                                Boolean(definition)
                                        )
                                        .map(([label, definition]) => (
                                            <Box key={label}>
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={700}
                                                >
                                                    {t(label)}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {t(definition)}
                                                </Typography>
                                            </Box>
                                        ))}

                                    <Alert severity="info">
                                        {t(
                                            metricDefinitions.limitations ||
                                            'Impressions and clicks are approximate engagement metrics, not unique customers or confirmed sales.'
                                        )}
                                    </Alert>
                                </Stack>
                            </CardContent>
                        </Card>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {t('Report generated')}: {' '}
                            {formatDateTime(
                                report.generatedAt || report.updatedAt
                            )}
                        </Typography>
                    </>
                )}
            </Stack>
        </Container>
    );
};

export default AdvertiserReport;