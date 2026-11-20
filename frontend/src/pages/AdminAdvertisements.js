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
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

import { Link as RouterLink } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import api from '../services/api';

import AdvertisementMedia from '../components/advertising/AdvertisementMedia';

const PLACEMENTS = [
    'dashboard',
    'extension-dashboard',
];

const STATUSES = [
    'draft',
    'active',
    'paused',
];

const PACKAGES = [
    'starter',
    'growth',
    'regional',
    'custom',
];

const PAYMENT_STATUSES = [
    'unpaid',
    'paid',
];

const MAX_IMAGE_SIZE = 12 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
];

// Initial operational warning threshold.
// This does not impose a campaign limit.
const CAPACITY_WARNING_THRESHOLD = 5;

const emptyForm = {
    title: '',
    description: '',
    advertiserName: '',
    imageUrl: '',
    destinationUrl: '',
    placement: 'dashboard',
    targetStates: '',
    startsAt: '',
    endsAt: '',
    status: 'draft',
};

const emptyBillingForm = {
    packageName: 'custom',
    amountPaid: '0',
    paymentStatus: 'unpaid',
};

const toLocalDateTime = (value) => {
    if (!value) return '';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '';
    }

    const offset = date.getTimezoneOffset() * 60000;

    return new Date(date.getTime() - offset)
        .toISOString()
        .slice(0, 16);
};

const formatDate = (value) => {
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

const getErrorMessage = (error) =>
    error.response?.data?.message ||
    error.message ||
    'Something went wrong. Please try again.';

const isValidHttpsUrl = (value) => {
    try {
        const url = new URL(value);

        return (
            url.protocol === 'https:' &&
            Boolean(url.hostname) &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
};

const getCampaignStatus = (advertisement) => {
    if (advertisement.status !== 'active') {
        return advertisement.status;
    }

    const now = Date.now();

    if (
        new Date(advertisement.startsAt).getTime() > now
    ) {
        return 'scheduled';
    }

    if (
        new Date(advertisement.endsAt).getTime() <= now
    ) {
        return 'expired';
    }

    return 'active';
};

const getStatusColor = (status) => {
    if (status === 'active') return 'success';
    if (status === 'paused') return 'warning';
    if (status === 'scheduled') return 'info';

    return 'default';
};

const getCtr = (advertisement) => {
    const impressions = Number(
        advertisement.impressions || 0
    );

    const clicks = Number(
        advertisement.clicks || 0
    );

    return impressions > 0
        ? ((clicks / impressions) * 100).toFixed(2)
        : '0.00';
};

// --------------------------------------
// Campaign capacity monitoring
// --------------------------------------

const normalizeTargetStates = (states) => {
    const values = Array.isArray(states)
        ? states
        : typeof states === 'string'
            ? states.split(',')
            : [];

    return [
        ...new Set(
            values
                .filter((state) => typeof state === 'string')
                .map((state) => state.trim().toLowerCase())
                .filter(Boolean)
        ),
    ];
};

const targetStatesOverlap = (firstStates, secondStates) => {
    const first = normalizeTargetStates(firstStates);
    const second = normalizeTargetStates(secondStates);

    // Empty targeting means all states.
    if (first.length === 0 || second.length === 0) {
        return true;
    }

    const secondSet = new Set(second);

    return first.some((state) => secondSet.has(state));
};

const campaignDatesOverlap = (first, second) => {
    const firstStart = new Date(first.startsAt).getTime();
    const firstEnd = new Date(first.endsAt).getTime();
    const secondStart = new Date(second.startsAt).getTime();
    const secondEnd = new Date(second.endsAt).getTime();

    if (
        !Number.isFinite(firstStart) ||
        !Number.isFinite(firstEnd) ||
        !Number.isFinite(secondStart) ||
        !Number.isFinite(secondEnd) ||
        firstEnd <= firstStart ||
        secondEnd <= secondStart
    ) {
        return false;
    }

    // End dates are exclusive, matching backend eligibility.
    return firstStart < secondEnd && secondStart < firstEnd;
};

const campaignsCompete = (first, second) => {
    if (
        first.status !== 'active' ||
        second.status !== 'active' ||
        first.placement !== second.placement
    ) {
        return false;
    }

    return (
        campaignDatesOverlap(first, second) &&
        targetStatesOverlap(
            first.targetStates,
            second.targetStates
        )
    );
};

const getCompetingCampaignCount = (
    campaign,
    advertisements
) => {
    if (campaign.status !== 'active') {
        return 0;
    }

    const now = Date.now();
    const campaignEnd = new Date(campaign.endsAt).getTime();

    // Expired campaigns do not contribute to future capacity.
    if (
        !Number.isFinite(campaignEnd) ||
        campaignEnd <= now
    ) {
        return 0;
    }

    const competitors = advertisements.filter(
        (advertisement) =>
            advertisement._id !== campaign._id &&
            campaignsCompete(campaign, advertisement) &&
            new Date(advertisement.endsAt).getTime() > now
    );

    return competitors.length + 1;
};

const AdminAdvertisements = () => {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    const [advertisements, setAdvertisements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({ ...emptyForm });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');

    // Advertiser billing.
    const [billingDialogOpen, setBillingDialogOpen] =
        useState(false);

    const [billingId, setBillingId] = useState(null);
    const [billingSaving, setBillingSaving] = useState(false);

    const [billingForm, setBillingForm] = useState({
        ...emptyBillingForm,
    });

    // Private advertiser report links.
    const [reportId, setReportId] = useState(null);
    const [generatedLinks, setGeneratedLinks] = useState({});

    const fetchAdvertisements = useCallback(async () => {
        setLoading(true);

        try {
            const response = await api.get(
                '/advertisements/admin'
            );

            setAdvertisements(
                Array.isArray(response.data?.data)
                    ? response.data.data
                    : []
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAdvertisements();
    }, [fetchAdvertisements]);

    // Release browser memory when a selected image changes.
    useEffect(() => {
        if (!imageFile) {
            setImagePreview('');
            return undefined;
        }

        const objectUrl = URL.createObjectURL(imageFile);
        setImagePreview(objectUrl);

        return () => {
            URL.revokeObjectURL(objectUrl);
        };
    }, [imageFile]);

    const resetImageSelection = () => {
        setImageFile(null);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleImageChange = (event) => {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
            setError(
                t('Only JPEG, PNG, and WebP images are allowed.')
            );

            event.target.value = '';
            return;
        }

        if (file.size > MAX_IMAGE_SIZE) {
            setError(
                t('Image must not exceed 12 MB.')
            );

            event.target.value = '';
            return;
        }

        setImageFile(file);
        setError('');
    };

    const handleCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm });
        resetImageSelection();

        setError('');
        setSuccess('');
        setDialogOpen(true);
    };

    const handleEdit = (advertisement) => {
        setEditingId(advertisement._id);

        setForm({
            title: advertisement.title || '',
            description: advertisement.description || '',
            advertiserName:
                advertisement.advertiserName || '',
            imageUrl: advertisement.imageUrl || '',
            destinationUrl:
                advertisement.destinationUrl || '',
            placement:
                advertisement.placement || 'dashboard',
            targetStates: (
                advertisement.targetStates || []
            ).join(', '),
            startsAt: toLocalDateTime(
                advertisement.startsAt
            ),
            endsAt: toLocalDateTime(
                advertisement.endsAt
            ),
            status: advertisement.status || 'draft',
        });

        resetImageSelection();

        setError('');
        setSuccess('');
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        if (saving) return;

        setDialogOpen(false);
        setEditingId(null);
        resetImageSelection();
        setError('');
    };

    const validateForm = () => {
        if (
            !form.title.trim() ||
            !form.description.trim() ||
            !form.advertiserName.trim()
        ) {
            return t('Please complete all required fields.');
        }

        if (!editingId && !imageFile) {
            return t('Please select an advertisement image.');
        }

        if (!isValidHttpsUrl(form.destinationUrl)) {
            return t(
                'Enter a valid HTTPS destination URL.'
            );
        }

        const start = new Date(form.startsAt);
        const end = new Date(form.endsAt);

        if (
            !form.startsAt ||
            !form.endsAt ||
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            return t(
                'Advertisement end date must be after its start date.'
            );
        }

        return '';
    };

    // Preview capacity before creating or editing a campaign.
    const capacityCandidate = {
        _id: editingId,
        placement: form.placement,
        targetStates: form.targetStates,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        status: form.status,
    };

    const capacityCount = getCompetingCampaignCount(
        capacityCandidate,
        advertisements
    );

    const capacityWarning =
        capacityCount >= CAPACITY_WARNING_THRESHOLD;

    const handleSave = async () => {
        const validationError = validateForm();

        if (validationError) {
            setError(validationError);
            return;
        }

        const targetStates = normalizeTargetStates(
            form.targetStates
        );

        if (targetStates.length > 37) {
            setError(
                t('Too many target states selected.')
            );
            return;
        }

        const payload = new FormData();

        payload.append('title', form.title.trim());

        payload.append(
            'description',
            form.description.trim()
        );

        payload.append(
            'advertiserName',
            form.advertiserName.trim()
        );

        payload.append(
            'destinationUrl',
            form.destinationUrl.trim()
        );

        payload.append('placement', form.placement);

        payload.append(
            'targetStates',
            JSON.stringify(targetStates)
        );

        payload.append(
            'startsAt',
            new Date(form.startsAt).toISOString()
        );

        payload.append(
            'endsAt',
            new Date(form.endsAt).toISOString()
        );

        payload.append('status', form.status);

        if (imageFile) {
            payload.append('image', imageFile);
        }

        const wasEditing = Boolean(editingId);

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            if (wasEditing) {
                await api.put(
                    `/advertisements/admin/${editingId}`,
                    payload
                );
            } else {
                await api.post(
                    '/advertisements/admin',
                    payload
                );
            }

            setDialogOpen(false);
            setEditingId(null);
            resetImageSelection();

            await fetchAdvertisements();

            setSuccess(
                wasEditing
                    ? t('Advertisement updated successfully.')
                    : t('Advertisement created successfully.')
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (
        advertisement,
        status
    ) => {
        setUpdatingId(advertisement._id);
        setError('');
        setSuccess('');

        try {
            await api.put(
                `/advertisements/admin/${advertisement._id}`,
                { status }
            );

            await fetchAdvertisements();

            setSuccess(
                t('Advertisement status updated successfully.')
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (advertisement) => {
        const confirmed = window.confirm(
            t(
                'Are you sure you want to delete this advertisement?'
            )
        );

        if (!confirmed) return;

        setDeletingId(advertisement._id);
        setError('');
        setSuccess('');

        try {
            await api.delete(
                `/advertisements/admin/${advertisement._id}`
            );

            setGeneratedLinks((previous) => {
                const updated = { ...previous };
                delete updated[advertisement._id];
                return updated;
            });

            await fetchAdvertisements();

            setSuccess(
                t('Advertisement deleted successfully.')
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setDeletingId(null);
        }
    };

    // -----------------------------
    // Campaign billing management
    // -----------------------------

    const openBillingDialog = (advertisement) => {
        setBillingId(advertisement._id);

        setBillingForm({
            packageName:
                advertisement.packageName || 'custom',
            amountPaid: String(
                advertisement.amountPaid || 0
            ),
            paymentStatus:
                advertisement.paymentStatus || 'unpaid',
        });

        setError('');
        setSuccess('');
        setBillingDialogOpen(true);
    };

    const closeBillingDialog = () => {
        if (billingSaving) return;

        setBillingDialogOpen(false);
        setBillingId(null);
    };

    const handleBillingChange = (event) => {
        const { name, value } = event.target;

        setBillingForm((previous) => ({
            ...previous,
            [name]: value,
        }));
    };

    const saveBilling = async () => {
        const amount = Number(billingForm.amountPaid);

        if (
            billingForm.amountPaid.trim() === '' ||
            !Number.isFinite(amount) ||
            amount < 0 ||
            amount > 100000000
        ) {
            setError(
                t('Enter a valid campaign amount.')
            );
            return;
        }

        setBillingSaving(true);
        setError('');
        setSuccess('');

        try {
            await api.put(
                `/advertisements/admin/${billingId}/billing`,
                {
                    packageName: billingForm.packageName,
                    amountPaid: amount,
                    paymentStatus: billingForm.paymentStatus,
                }
            );

            setBillingDialogOpen(false);
            setBillingId(null);

            await fetchAdvertisements();

            setSuccess(
                t('Campaign billing updated successfully.')
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setBillingSaving(false);
        }
    };

    // -----------------------------
    // Private advertiser reports
    // -----------------------------

    const generateReportLink = async (advertisement) => {
        const existingLink =
            generatedLinks[advertisement._id];

        if (
            (advertisement.hasReportLink || existingLink) &&
            !window.confirm(
                t(
                    'This advertisement already has a report link. Generating another link will immediately invalidate the previous one. Continue?'
                )
            )
        ) {
            return;
        }

        setReportId(advertisement._id);
        setError('');
        setSuccess('');

        try {
            const response = await api.post(
                `/advertisements/admin/${advertisement._id}/report-link`
            );

            const token = response.data?.token;

            if (!token) {
                throw new Error(
                    'Report token was not returned.'
                );
            }

            const link =
                `${window.location.origin}/ads/report/${token}`;

            setGeneratedLinks((previous) => ({
                ...previous,
                [advertisement._id]: link,
            }));

            setAdvertisements((previous) =>
                previous.map((item) =>
                    item._id === advertisement._id
                        ? {
                            ...item,
                            hasReportLink: true,
                        }
                        : item
                )
            );

            try {
                await navigator.clipboard.writeText(link);

                setSuccess(
                    t('Private report link generated and copied.')
                );
            } catch {
                setSuccess(
                    t('Private report link generated. Copy it below.')
                );
            }
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setReportId(null);
        }
    };

    const copyReportLink = async (advertisementId) => {
        const link = generatedLinks[advertisementId];

        if (!link) return;

        try {
            await navigator.clipboard.writeText(link);

            setSuccess(
                t('Report link copied.')
            );
        } catch {
            setError(
                t('Unable to copy the report link.')
            );
        }
    };

    const revokeReportLink = async (advertisement) => {
        if (
            !advertisement.hasReportLink &&
            !generatedLinks[advertisement._id]
        ) {
            setError(
                t('This advertisement has no active report link.')
            );
            return;
        }

        const confirmed = window.confirm(
            t(
                'Revoke this report link? The advertiser will immediately lose access.'
            )
        );

        if (!confirmed) return;

        setReportId(advertisement._id);
        setError('');
        setSuccess('');

        try {
            await api.delete(
                `/advertisements/admin/${advertisement._id}/report-link`
            );

            setGeneratedLinks((previous) => {
                const updated = { ...previous };
                delete updated[advertisement._id];
                return updated;
            });

            setAdvertisements((previous) =>
                previous.map((item) =>
                    item._id === advertisement._id
                        ? {
                            ...item,
                            hasReportLink: false,
                        }
                        : item
                )
            );

            setSuccess(
                t('Report link revoked successfully.')
            );
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setReportId(null);
        }
    };

    const previewSource = imagePreview || form.imageUrl;

    return (
        <Container
            maxWidth="lg"
            sx={{ py: 3, pb: 8 }}
        >
            <Stack
                direction={{
                    xs: 'column',
                    md: 'row',
                }}
                spacing={2}
                alignItems={{
                    xs: 'stretch',
                    md: 'center',
                }}
                justifyContent="space-between"
                sx={{ mb: 3 }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                    >
                        {t('Advertisement Management')}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        {t(
                            'Manage agricultural advertisements displayed on RoamAgro.'
                        )}
                    </Typography>
                </Box>

                <Stack
                    direction={{
                        xs: 'column',
                        sm: 'row',
                    }}
                    spacing={1}
                    useFlexGap
                    flexWrap="wrap"
                    sx={{
                        flexShrink: 0,
                    }}
                >
                    <Button
                        component={RouterLink}
                        to="/admin/advertising-guide"
                        variant="outlined"
                        startIcon={<MenuBookOutlinedIcon />}
                    >
                        {t('Advertising Guide')}
                    </Button>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchAdvertisements}
                        disabled={loading}
                    >
                        {t('Refresh')}
                    </Button>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreate}
                    >
                        {t('New Advertisement')}
                    </Button>
                </Stack>
            </Stack>

            {error && !dialogOpen && !billingDialogOpen && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert
                    severity="success"
                    sx={{ mb: 2 }}
                    onClose={() => setSuccess('')}
                >
                    {success}
                </Alert>
            )}

            {loading ? (
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        py: 6,
                    }}
                >
                    <CircularProgress />
                </Box>
            ) : advertisements.length === 0 ? (
                <Card variant="outlined">
                    <CardContent sx={{ py: 5 }}>
                        <Typography
                            textAlign="center"
                            color="text.secondary"
                        >
                            {t('No advertisements created yet.')}
                        </Typography>
                    </CardContent>
                </Card>
            ) : (
                <Grid container spacing={2}>
                    {advertisements.map((advertisement) => {
                        const status = getCampaignStatus(
                            advertisement
                        );

                        const busy =
                            deletingId === advertisement._id ||
                            updatingId === advertisement._id ||
                            reportId === advertisement._id;

                        const reportLink =
                            generatedLinks[advertisement._id];

                        const competingCampaignCount =
                            getCompetingCampaignCount(
                                advertisement,
                                advertisements
                            );

                        return (
                            <Grid
                                item
                                xs={12}
                                md={6}
                                key={advertisement._id}
                            >
                                <Card
                                    variant="outlined"
                                    sx={{
                                        height: '100%',
                                        borderRadius: 3,
                                    }}
                                >
                                    <AdvertisementMedia
                                        source={advertisement.imageUrl}
                                        alt={advertisement.title}
                                        variant="thumbnail"
                                    />

                                    <CardContent>
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="flex-start"
                                            spacing={1}
                                        >
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography
                                                    variant="h6"
                                                    fontWeight={700}
                                                >
                                                    {advertisement.title}
                                                </Typography>

                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                >
                                                    {advertisement.advertiserName}
                                                </Typography>
                                            </Box>

                                            <Chip
                                                label={t(status)}
                                                color={getStatusColor(status)}
                                                size="small"
                                            />
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            sx={{
                                                mt: 2,
                                                mb: 2,
                                                overflowWrap: 'anywhere',
                                            }}
                                        >
                                            {advertisement.description}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                        >
                                            {t('Placement')}: {t(advertisement.placement)}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                        >
                                            {t('Starts')}: {formatDate(advertisement.startsAt)}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                        >
                                            {t('Ends')}: {formatDate(advertisement.endsAt)}
                                        </Typography>

                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            display="block"
                                            sx={{ mt: 1 }}
                                        >
                                            {t('Target states')}: {' '}
                                            {advertisement.targetStates?.length
                                                ? advertisement.targetStates.join(', ')
                                                : t('All states')}
                                        </Typography>

                                        {competingCampaignCount >=
                                            CAPACITY_WARNING_THRESHOLD && (
                                            <Alert
                                                severity="warning"
                                                sx={{ mt: 2 }}
                                            >
                                                {t(
                                                    'Capacity warning: {{count}} active or scheduled campaigns may compete for this placement and audience during overlapping dates. Individual exposure may be limited.',
                                                    {
                                                        count: competingCampaignCount,
                                                    }
                                                )}
                                            </Alert>
                                        )}

                                        <Divider sx={{ my: 2 }} />

                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            spacing={2}
                                        >
                                            <Typography variant="body2">
                                                {t('Impressions')}: {' '}
                                                <strong>
                                                    {advertisement.impressions || 0}
                                                </strong>
                                            </Typography>

                                            <Typography variant="body2">
                                                {t('Clicks')}: {' '}
                                                <strong>
                                                    {advertisement.clicks || 0}
                                                </strong>
                                            </Typography>

                                            <Typography variant="body2">
                                                {t('CTR')}: {' '}
                                                <strong>
                                                    {getCtr(advertisement)}%
                                                </strong>
                                            </Typography>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            sx={{
                                                mt: 2,
                                                flexWrap: 'wrap',
                                                gap: 1,
                                            }}
                                        >
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                startIcon={<EditIcon />}
                                                disabled={busy}
                                                onClick={() =>
                                                    handleEdit(advertisement)
                                                }
                                            >
                                                {t('Edit')}
                                            </Button>

                                            {advertisement.status === 'active' ? (
                                                <Button
                                                    size="small"
                                                    color="warning"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            advertisement,
                                                            'paused'
                                                        )
                                                    }
                                                >
                                                    {t('Pause')}
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="small"
                                                    color="success"
                                                    disabled={busy}
                                                    onClick={() =>
                                                        handleStatusChange(
                                                            advertisement,
                                                            'active'
                                                        )
                                                    }
                                                >
                                                    {t('Activate')}
                                                </Button>
                                            )}

                                            <IconButton
                                                size="small"
                                                color="error"
                                                disabled={busy}
                                                onClick={() =>
                                                    handleDelete(advertisement)
                                                }
                                                aria-label={t('Delete')}
                                            >
                                                <DeleteIcon />
                                            </IconButton>

                                            <IconButton
                                                size="small"
                                                component="a"
                                                href={advertisement.destinationUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                aria-label={t('Open destination')}
                                            >
                                                <OpenInNewIcon />
                                            </IconButton>
                                        </Stack>

                                        <Divider sx={{ my: 2 }} />

                                        <Stack spacing={1.5}>
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={700}
                                            >
                                                {t('Advertiser Reporting')}
                                            </Typography>

                                            <Chip
                                                size="small"
                                                color={
                                                    advertisement.hasReportLink
                                                        ? 'success'
                                                        : 'default'
                                                }
                                                label={
                                                    advertisement.hasReportLink
                                                        ? t('Report Link Active')
                                                        : t('No Report Link')
                                                }
                                                sx={{ alignSelf: 'flex-start' }}
                                            />

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {t('Package')}: {' '}
                                                <strong>
                                                    {t(
                                                        advertisement.packageName ||
                                                        'custom'
                                                    )}
                                                </strong>
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {t('Amount')}: {' '}
                                                <strong>
                                                    {formatMoney(
                                                        advertisement.amountPaid
                                                    )}
                                                </strong>
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {t('Payment')}: {' '}
                                                <strong>
                                                    {t(
                                                        advertisement.paymentStatus ||
                                                        'unpaid'
                                                    )}
                                                </strong>
                                            </Typography>

                                            <Stack
                                                direction="row"
                                                spacing={1}
                                                flexWrap="wrap"
                                                useFlexGap
                                            >
                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<ReceiptLongIcon />}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        openBillingDialog(
                                                            advertisement
                                                        )
                                                    }
                                                >
                                                    {t('Billing')}
                                                </Button>

                                                <Button
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<LinkIcon />}
                                                    disabled={busy}
                                                    onClick={() =>
                                                        generateReportLink(
                                                            advertisement
                                                        )
                                                    }
                                                >
                                                    {reportId === advertisement._id
                                                        ? t('Processing...')
                                                        : advertisement.hasReportLink
                                                            ? t('Replace Report Link')
                                                            : t('Generate Report Link')}
                                                </Button>

                                                <Button
                                                    size="small"
                                                    color="error"
                                                    startIcon={<LinkOffIcon />}
                                                    disabled={
                                                        busy ||
                                                        (
                                                            !advertisement.hasReportLink &&
                                                            !reportLink
                                                        )
                                                    }
                                                    onClick={() =>
                                                        revokeReportLink(
                                                            advertisement
                                                        )
                                                    }
                                                >
                                                    {t('Revoke Link')}
                                                </Button>
                                            </Stack>

                                            {reportLink && (
                                                <Stack spacing={1}>
                                                    <Alert severity="info">
                                                        {t(
                                                            'Copy this private link now. It will not be shown again after leaving this page.'
                                                        )}
                                                    </Alert>

                                                    <TextField
                                                        size="small"
                                                        value={reportLink}
                                                        fullWidth
                                                        InputProps={{
                                                            readOnly: true,
                                                            endAdornment: (
                                                                <InputAdornment position="end">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() =>
                                                                            copyReportLink(
                                                                                advertisement._id
                                                                            )
                                                                        }
                                                                        aria-label={t(
                                                                            'Copy report link'
                                                                        )}
                                                                    >
                                                                        <ContentCopyIcon fontSize="small" />
                                                                    </IconButton>
                                                                </InputAdornment>
                                                            ),
                                                        }}
                                                    />
                                                </Stack>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {/* Advertisement create/edit dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleCloseDialog}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {editingId
                        ? t('Edit Advertisement')
                        : t('New Advertisement')}
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {error && (
                            <Alert severity="error">
                                {error}
                            </Alert>
                        )}

                        <TextField
                            label={t('Advertisement Title')}
                            name="title"
                            value={form.title}
                            onChange={handleChange}
                            required
                            fullWidth
                            inputProps={{ maxLength: 150 }}
                        />

                        <TextField
                            label={t('Advertiser Name')}
                            name="advertiserName"
                            value={form.advertiserName}
                            onChange={handleChange}
                            required
                            fullWidth
                            inputProps={{ maxLength: 150 }}
                        />

                        <TextField
                            label={t('Description')}
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            multiline
                            minRows={3}
                            required
                            fullWidth
                            inputProps={{ maxLength: 1000 }}
                        />

                        <Box>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                                id="advertisement-image-input"
                            />

                            <Button
                                component="label"
                                htmlFor="advertisement-image-input"
                                variant="outlined"
                                startIcon={<AddPhotoAlternateIcon />}
                                disabled={saving}
                                fullWidth
                            >
                                {imageFile
                                    ? t('Change Image')
                                    : editingId
                                        ? t('Replace Image')
                                        : t('Select Advertisement Image')}
                            </Button>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                sx={{ mt: 1 }}
                            >
                                {t(
                                    'JPEG, PNG or WebP. Maximum size: 12 MB.'
                                )}
                            </Typography>

                            {imageFile && (
                                <Typography
                                    variant="body2"
                                    sx={{
                                        mt: 1,
                                        overflowWrap: 'anywhere',
                                    }}
                                >
                                    {imageFile.name}
                                </Typography>
                            )}
                        </Box>

                        {previewSource && (
                            <AdvertisementMedia
                                source={previewSource}
                                alt={t('Advertisement preview')}
                                variant="preview"
                            />
                        )}

                        <TextField
                            label={t('Destination URL')}
                            name="destinationUrl"
                            value={form.destinationUrl}
                            onChange={handleChange}
                            required
                            fullWidth
                        />

                        <TextField
                            select
                            label={t('Placement')}
                            name="placement"
                            value={form.placement}
                            onChange={handleChange}
                            fullWidth
                        >
                            {PLACEMENTS.map((placement) => (
                                <MenuItem
                                    key={placement}
                                    value={placement}
                                >
                                    {t(placement)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Target States')}
                            name="targetStates"
                            value={form.targetStates}
                            onChange={handleChange}
                            fullWidth
                            helperText={t(
                                'Optional. Separate states with commas. Leave empty to target all states.'
                            )}
                        />

                        <TextField
                            label={t('Start Date')}
                            name="startsAt"
                            type="datetime-local"
                            value={form.startsAt}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                            fullWidth
                        />

                        <TextField
                            label={t('End Date')}
                            name="endsAt"
                            type="datetime-local"
                            value={form.endsAt}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                            required
                            fullWidth
                        />

                        <TextField
                            select
                            label={t('Status')}
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            fullWidth
                        >
                            {STATUSES.map((status) => (
                                <MenuItem
                                    key={status}
                                    value={status}
                                >
                                    {t(status)}
                                </MenuItem>
                            ))}
                        </TextField>

                        {capacityWarning && (
                            <Alert severity="warning">
                                {t(
                                    'Capacity warning: This campaign would compete with {{count}} active or scheduled campaigns for overlapping dates, placement, and audience. Consider adjusting its schedule or targeting.',
                                    {
                                        count: capacityCount - 1,
                                    }
                                )}
                            </Alert>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={handleCloseDialog}
                        disabled={saving}
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                        startIcon={
                            saving
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : null
                        }
                    >
                        {saving
                            ? t('Saving...')
                            : t('Save Advertisement')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Campaign billing dialog */}
            <Dialog
                open={billingDialogOpen}
                onClose={closeBillingDialog}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    {t('Campaign Billing')}
                </DialogTitle>

                <DialogContent dividers>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {error && (
                            <Alert severity="error">
                                {error}
                            </Alert>
                        )}

                        <TextField
                            select
                            label={t('Advertising Package')}
                            name="packageName"
                            value={billingForm.packageName}
                            onChange={handleBillingChange}
                            fullWidth
                        >
                            {PACKAGES.map((name) => (
                                <MenuItem
                                    key={name}
                                    value={name}
                                >
                                    {t(name)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Campaign Amount (₦)')}
                            name="amountPaid"
                            type="number"
                            value={billingForm.amountPaid}
                            onChange={handleBillingChange}
                            inputProps={{
                                min: 0,
                                max: 100000000,
                                step: 1,
                            }}
                            fullWidth
                        />

                        <TextField
                            select
                            label={t('Payment Status')}
                            name="paymentStatus"
                            value={billingForm.paymentStatus}
                            onChange={handleBillingChange}
                            fullWidth
                        >
                            {PAYMENT_STATUSES.map((status) => (
                                <MenuItem
                                    key={status}
                                    value={status}
                                >
                                    {t(status)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Alert severity="info">
                            {t(
                                'Confirm payment manually before marking this campaign as paid.'
                            )}
                        </Alert>
                    </Stack>
                </DialogContent>

                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={closeBillingDialog}
                        disabled={billingSaving}
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={saveBilling}
                        disabled={billingSaving}
                        startIcon={
                            billingSaving
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : null
                        }
                    >
                        {billingSaving
                            ? t('Saving...')
                            : t('Save Billing')}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminAdvertisements;