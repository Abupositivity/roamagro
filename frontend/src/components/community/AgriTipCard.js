import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import AgricultureIcon from '@mui/icons-material/Agriculture';
import LanguageIcon from '@mui/icons-material/Language';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined';

import {
    useDispatch,
    useSelector,
} from 'react-redux';

import { useTranslation } from 'react-i18next';

import {
    updateAgriTip,
    deleteAgriTip,
    likeAgriTip,
    addAgriTipComment,
    deleteAgriTipComment,
    shareAgriTip,
    unshareAgriTip,
} from '../../redux/actions/agriFeedActions';

import compressImage, {
    MAX_IMAGE_SIZE_MB,
    validateImageFile,
} from '../../utils/compressImage';

import {
    getAvatarImage,
    getFeedImage,
    getFeedImageSrcSet,
    getResponsiveImage,
} from '../../utils/cloudinaryImage';

const getId = value =>
    value?._id?.toString() ||
    value?.id?.toString() ||
    value?.toString();

const FEED_IMAGE_SIZES = [
    'auto',
    '(max-width: 599px) 100vw',
    '(max-width: 899px) 90vw',
    '800px',
].join(', ');

const categories = [
    'Crop Production',
    'Livestock',
    'Poultry',
    'Soil Health',
    'Pest Control',
    'Diseases',
    'Climate',
    'Weather',
    'Market Prices',
    'Government Support',
    'Mechanization',
    'Agribusiness',
    'Finance',
    'Technology',
    'General',
];

const getImageSource = image => {
    if (typeof image === 'string') {
        return image;
    }

    if (
        image &&
        typeof image === 'object' &&
        !(
            typeof Blob !== 'undefined' &&
            image instanceof Blob
        )
    ) {
        return (
            image.secure_url ||
            image.url ||
            image.src ||
            ''
        );
    }

    return '';
};

const OptimizedTipImage = ({
    source,
    alt,
    preview = false,
}) => {
    const { t } = useTranslation();

    const [useOriginal, setUseOriginal] =
        useState(false);

    const [imageFailed, setImageFailed] =
        useState(false);

    const optimizedImage = preview
        ? getResponsiveImage(source, 800)
        : getFeedImage(source, 800);

    const displayImage = useOriginal
        ? source
        : optimizedImage;

    const srcSet =
        !preview && !useOriginal
            ? getFeedImageSrcSet(source)
            : undefined;

    const handleImageError = () => {
        if (
            !useOriginal &&
            (
                optimizedImage !== source ||
                srcSet
            )
        ) {
            setUseOriginal(true);
            return;
        }

        setImageFailed(true);
    };

    if (!source) {
        return null;
    }

    if (imageFailed) {
        return (
            <Box
                role="status"
                sx={{
                    width: '100%',
                    aspectRatio: '16 / 9',
                    maxHeight: preview ? 220 : 260,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'action.hover',
                    color: 'text.secondary',
                    borderRadius: preview ? 2 : 0,
                }}
            >
                <Stack
                    spacing={1}
                    alignItems="center"
                >
                    <ImageNotSupportedOutlinedIcon
                        fontSize="large"
                        aria-hidden="true"
                    />

                    <Typography variant="body2">
                        {t('Image unavailable')}
                    </Typography>
                </Stack>
            </Box>
        );
    }

    return (
        <CardMedia
            key={displayImage}
            component="img"
            src={displayImage}
            srcSet={srcSet}
            sizes={
                srcSet
                    ? FEED_IMAGE_SIZES
                    : undefined
            }
            alt={alt}
            loading={preview ? 'eager' : 'lazy'}
            decoding="async"
            onError={handleImageError}
            sx={{
                display: 'block',
                width: '100%',
                aspectRatio: preview
                    ? undefined
                    : '16 / 9',
                maxHeight: preview ? 220 : 260,
                objectFit: preview
                    ? 'contain'
                    : 'cover',
                backgroundColor: 'action.hover',
                borderRadius: preview ? 2 : 0,
            }}
        />
    );
};

const AgriTipCard = ({ tip }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const theme = useTheme();
    const fullScreen = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    const currentUser = useSelector(
        state =>
            state.auth?.user ||
            state.auth?.currentUser
    );

    const galleryInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const imageSelectionRef = useRef(0);

    const [menuAnchor, setMenuAnchor] =
        useState(null);

    const [editOpen, setEditOpen] =
        useState(false);

    const [commentsOpen, setCommentsOpen] =
        useState(false);

    const [confirmation, setConfirmation] =
        useState(null);

    const [confirmLoading, setConfirmLoading] =
        useState(false);

    const [confirmError, setConfirmError] =
        useState('');

    const [commentText, setCommentText] =
        useState('');

    const [editError, setEditError] =
        useState('');

    const [commentError, setCommentError] =
        useState('');

    const [imageError, setImageError] =
        useState('');

    const [imageProcessing, setImageProcessing] =
        useState(false);

    const [imagePreview, setImagePreview] =
        useState('');

    const [saving, setSaving] =
        useState(false);

    const [commenting, setCommenting] =
        useState(false);

    const [sharing, setSharing] =
        useState(false);

    const [editData, setEditData] = useState({
        title: tip.title || '',
        content: tip.content || '',
        category: tip.category || 'General',
        priority: tip.priority || 'Normal',
        language: tip.language || 'English',
        region: tip.region || 'Nigeria',
        source: tip.source || '',
        image: tip.image || '',
    });

    useEffect(() => {
        const image = editData.image;

        if (
            typeof Blob !== 'undefined' &&
            image instanceof Blob
        ) {
            const previewUrl =
                URL.createObjectURL(image);

            setImagePreview(previewUrl);

            return () => {
                URL.revokeObjectURL(previewUrl);
            };
        }

        setImagePreview(
            getImageSource(image)
        );

        return undefined;
    }, [editData.image]);

    useEffect(() => {
        return () => {
            imageSelectionRef.current += 1;
        };
    }, []);

    const userId = getId(currentUser);
    const creatorId = getId(tip.createdBy);

    const isAdmin =
        currentUser?.role === 'admin';

    const isExtensionOfficer =
        currentUser?.role === 'extension_officer';

    const canManage = Boolean(
        userId &&
        (
            isAdmin ||
            (
                isExtensionOfficer &&
                userId === creatorId
            )
        )
    );

    const liked = (tip.likes || []).some(
        like => getId(like) === userId
    );

    const shared = (tip.sharedBy || []).some(
        id => getId(id) === userId
    );

    const priorityColor = () => {
        if (tip.priority === 'Urgent') {
            return 'error';
        }

        if (tip.priority === 'Important') {
            return 'warning';
        }

        return 'success';
    };

    const resetFileInputs = () => {
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    const handleImageChange = async event => {
        const file = event.target.files?.[0];

        event.target.value = '';

        if (
            !file ||
            imageProcessing ||
            saving
        ) {
            return;
        }

        const selectionId =
            ++imageSelectionRef.current;

        setImageError('');

        try {
            validateImageFile(file);
        } catch (error) {
            setImageError(
                t(
                    error?.message ||
                    'Please select a valid image.'
                )
            );
            return;
        }

        setImageProcessing(true);

        try {
            const compressedFile =
                await compressImage(file);

            if (
                selectionId !==
                imageSelectionRef.current
            ) {
                return;
            }

            if (
                typeof File === 'undefined' ||
                !(compressedFile instanceof File)
            ) {
                throw new Error(
                    'Unable to process the selected image.'
                );
            }

            setEditData(previous => ({
                ...previous,
                image: compressedFile,
            }));

            setImageError('');
        } catch (error) {
            if (
                selectionId !==
                imageSelectionRef.current
            ) {
                return;
            }

            setImageError(
                t(
                    error?.message ||
                    'Unable to process this image.'
                )
            );
        } finally {
            if (
                selectionId ===
                imageSelectionRef.current
            ) {
                setImageProcessing(false);
            }
        }
    };

    const handleRemoveImage = () => {
        imageSelectionRef.current += 1;

        setImageProcessing(false);
        setImageError('');

        resetFileInputs();

        setEditData(previous => ({
            ...previous,
            image: '',
        }));
    };

    const openEdit = () => {
        imageSelectionRef.current += 1;

        setImageProcessing(false);

        setEditData({
            title: tip.title || '',
            content: tip.content || '',
            category: tip.category || 'General',
            priority: tip.priority || 'Normal',
            language: tip.language || 'English',
            region: tip.region || 'Nigeria',
            source: tip.source || '',
            image: tip.image || '',
        });

        setEditError('');
        setImageError('');
        setEditOpen(true);
        setMenuAnchor(null);
    };

    const handleCloseEdit = () => {
        if (saving) return;

        imageSelectionRef.current += 1;

        setImageProcessing(false);
        setEditOpen(false);
        setImageError('');
        setEditError('');

        resetFileInputs();

        setEditData(previous => ({
            ...previous,
            image: tip.image || '',
        }));
    };

    const handleUpdate = async () => {
        if (
            saving ||
            imageProcessing ||
            !editData.title.trim() ||
            !editData.content.trim()
        ) {
            return;
        }

        setSaving(true);
        setEditError('');

        try {
            const result = await dispatch(
                updateAgriTip(tip._id, {
                    ...editData,
                    priority: isAdmin
                        ? editData.priority
                        : tip.priority || 'Normal',
                })
            );

            if (!result?.success) {
                setEditError(
                    result?.message ||
                    t('Unable to update tip.')
                );
                return;
            }

            imageSelectionRef.current += 1;
            setEditOpen(false);
        } catch (error) {
            setEditError(
                error?.message ||
                t('Unable to update tip.')
            );
        } finally {
            setSaving(false);
        }
    };

    // Open a responsive confirmation dialog.
    const requestConfirmation = (
        type,
        commentId = null
    ) => {
        setMenuAnchor(null);
        setConfirmError('');

        setConfirmation({
            type,
            commentId,
        });
    };

    const closeConfirmation = () => {
        if (confirmLoading) return;

        setConfirmation(null);
        setConfirmError('');
    };

    const handleConfirmAction = async () => {
        if (
            !confirmation ||
            confirmLoading
        ) {
            return;
        }

        const { type, commentId } = confirmation;

        setConfirmLoading(true);
        setConfirmError('');

        try {
            let result;

            if (type === 'deleteTip') {
                result = await dispatch(
                    deleteAgriTip(tip._id)
                );
            } else if (type === 'deleteComment') {
                result = await dispatch(
                    deleteAgriTipComment(
                        tip._id,
                        commentId
                    )
                );
            } else if (type === 'unshare') {
                result = await dispatch(
                    unshareAgriTip(tip._id)
                );
            } else {
                return;
            }

            if (!result?.success) {
                setConfirmError(
                    result?.message ||
                    t('Unable to complete this action.')
                );
                return;
            }

            setConfirmation(null);
            setConfirmError('');
        } catch (error) {
            setConfirmError(
                error?.message ||
                t('Unable to complete this action.')
            );
        } finally {
            setConfirmLoading(false);
        }
    };

    const handleLike = () => {
        dispatch(
            likeAgriTip(tip._id)
        );
    };

    const handleAddComment = async () => {
        const content = commentText.trim();

        if (
            !content ||
            commenting
        ) {
            return;
        }

        setCommenting(true);
        setCommentError('');

        try {
            const result = await dispatch(
                addAgriTipComment(
                    tip._id,
                    content
                )
            );

            if (!result?.success) {
                setCommentError(
                    result?.message ||
                    t('Unable to add comment.')
                );
                return;
            }

            setCommentText('');
        } catch (error) {
            setCommentError(
                error?.message ||
                t('Unable to add comment.')
            );
        } finally {
            setCommenting(false);
        }
    };

    const handleShare = async () => {
        if (sharing) return;

        if (shared) {
            requestConfirmation('unshare');
            return;
        }

        setSharing(true);
        setCommentError('');

        try {
            const result = await dispatch(
                shareAgriTip(tip._id)
            );

            if (!result?.success) {
                setCommentError(
                    result?.message ||
                    t(
                        'Unable to share this tip to the Community.'
                    )
                );
            }
        } catch (error) {
            setCommentError(
                error?.message ||
                t(
                    'Unable to share this tip to the Community.'
                )
            );
        } finally {
            setSharing(false);
        }
    };

    const confirmationDetails = {
        deleteTip: {
            title: t('Delete agricultural tip?'),
            message: t(
                'Are you sure you want to delete this agricultural tip? This action cannot be undone.'
            ),
            button: t('Delete Tip'),
        },
        deleteComment: {
            title: t('Delete comment?'),
            message: t(
                'Are you sure you want to delete this comment? This action cannot be undone.'
            ),
            button: t('Delete Comment'),
        },
        unshare: {
            title: t('Remove shared tip?'),
            message: t(
                'Remove this agricultural tip from the Community?'
            ),
            button: t('Remove Share'),
        },
    };

    const activeConfirmation =
        confirmationDetails[confirmation?.type];

    return (
        <>
            <Card
                elevation={2}
                sx={{
                    borderRadius: 3,
                }}
            >
                {tip.image && (
                    <OptimizedTipImage
                        key={getImageSource(tip.image)}
                        source={getImageSource(tip.image)}
                        alt={
                            tip.title ||
                            t('Agricultural tip image')
                        }
                    />
                )}

                <CardContent>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        spacing={2}
                        mb={2}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                overflowWrap: 'anywhere',
                            }}
                        >
                            {tip.title}
                        </Typography>

                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1}
                        >
                            <Chip
                                label={t(tip.priority)}
                                color={priorityColor()}
                                size="small"
                            />

                            {canManage && (
                                <IconButton
                                    aria-label={t(
                                        'Tip options'
                                    )}
                                    onClick={event =>
                                        setMenuAnchor(
                                            event.currentTarget
                                        )
                                    }
                                    size="small"
                                >
                                    <MoreVertIcon />
                                </IconButton>
                            )}
                        </Stack>
                    </Stack>

                    <Menu
                        anchorEl={menuAnchor}
                        open={Boolean(menuAnchor)}
                        onClose={() =>
                            setMenuAnchor(null)
                        }
                    >
                        <MenuItem onClick={openEdit}>
                            <EditOutlinedIcon
                                fontSize="small"
                                sx={{ mr: 1 }}
                            />
                            {t('Edit')}
                        </MenuItem>

                        <MenuItem
                            onClick={() =>
                                requestConfirmation(
                                    'deleteTip'
                                )
                            }
                        >
                            <DeleteOutlineIcon
                                fontSize="small"
                                sx={{ mr: 1 }}
                            />
                            {t('Delete')}
                        </MenuItem>
                    </Menu>

                    <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        useFlexGap
                        mb={2}
                    >
                        <Chip
                            icon={<AgricultureIcon />}
                            label={t(tip.category)}
                            size="small"
                            color="success"
                            variant="outlined"
                        />

                        <Chip
                            icon={<LanguageIcon />}
                            label={t(tip.language)}
                            size="small"
                            variant="outlined"
                        />

                        <Chip
                            icon={<LocationOnIcon />}
                            label={t(tip.region)}
                            size="small"
                            variant="outlined"
                        />
                    </Stack>

                    <Typography
                        variant="body1"
                        sx={{
                            whiteSpace: 'pre-line',
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {tip.content}
                    </Typography>

                    <Box mt={3}>
                        {tip.createdBy?.name && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                <strong>
                                    {t('Shared by')}:
                                </strong>
                                {' '}
                                {tip.createdBy.name}
                            </Typography>
                        )}

                        {tip.source && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                <strong>
                                    {t('Source')}:
                                </strong>
                                {' '}
                                {tip.source}
                            </Typography>
                        )}

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mt={1}
                        >
                            {tip.createdAt
                                ? new Date(
                                    tip.createdAt
                                ).toLocaleDateString()
                                : ''}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack
                        direction="row"
                        justifyContent="space-around"
                        alignItems="center"
                        flexWrap="wrap"
                        useFlexGap
                        spacing={1}
                    >
                        <Button
                            startIcon={
                                liked
                                    ? (
                                        <FavoriteIcon color="error" />
                                    )
                                    : (
                                        <FavoriteBorderIcon />
                                    )
                            }
                            onClick={handleLike}
                            color={
                                liked
                                    ? 'error'
                                    : 'inherit'
                            }
                            size="small"
                        >
                            {t('Like')} ({tip.likes?.length || 0})
                        </Button>

                        <Button
                            startIcon={
                                <ChatBubbleOutlineIcon />
                            }
                            onClick={() => {
                                setCommentError('');
                                setCommentsOpen(true);
                            }}
                            color="inherit"
                            size="small"
                        >
                            {t('Comment')} ({tip.comments?.length || 0})
                        </Button>

                        <Button
                            startIcon={
                                sharing
                                    ? (
                                        <CircularProgress
                                            size={16}
                                            color="inherit"
                                        />
                                    )
                                    : <ShareIcon />
                            }
                            onClick={handleShare}
                            disabled={sharing}
                            color={
                                shared
                                    ? 'success'
                                    : 'inherit'
                            }
                            size="small"
                        >
                            {sharing
                                ? t('Updating...')
                                : shared
                                    ? t('Unshare')
                                    : t('Share')}
                            {' '}({tip.shares || 0})
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Edit agricultural tip */}
            <Dialog
                open={editOpen}
                onClose={handleCloseEdit}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {t('Edit Agricultural Tip')}
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ pt: 1 }}
                    >
                        {editError && (
                            <Alert severity="error">
                                {editError}
                            </Alert>
                        )}

                        {imageError && (
                            <Alert
                                severity="error"
                                sx={{
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {imageError}
                            </Alert>
                        )}

                        <TextField
                            label={t('Title')}
                            value={editData.title}
                            inputProps={{
                                maxLength: 150,
                            }}
                            onChange={event =>
                                setEditData(previous => ({
                                    ...previous,
                                    title: event.target.value,
                                }))
                            }
                            fullWidth
                            required
                        />

                        <TextField
                            select
                            label={t('Category')}
                            value={editData.category}
                            onChange={event =>
                                setEditData(previous => ({
                                    ...previous,
                                    category: event.target.value,
                                }))
                            }
                            fullWidth
                            required
                        >
                            {categories.map(category => (
                                <MenuItem
                                    key={category}
                                    value={category}
                                >
                                    {t(category)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Content')}
                            value={editData.content}
                            onChange={event =>
                                setEditData(previous => ({
                                    ...previous,
                                    content: event.target.value,
                                }))
                            }
                            multiline
                            minRows={5}
                            fullWidth
                            required
                        />

                        <TextField
                            label={t('Priority')}
                            value={
                                isAdmin
                                    ? editData.priority
                                    : tip.priority || 'Normal'
                            }
                            onChange={event =>
                                setEditData(previous => ({
                                    ...previous,
                                    priority: event.target.value,
                                }))
                            }
                            select
                            fullWidth
                            disabled={!isAdmin}
                        >
                            {[
                                'Normal',
                                'Important',
                                'Urgent',
                            ].map(priority => (
                                <MenuItem
                                    key={priority}
                                    value={priority}
                                >
                                    {t(priority)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Language')}
                            value={editData.language}
                            onChange={event =>
                                setEditData(previous => ({
                                    ...previous,
                                    language: event.target.value,
                                }))
                            }
                            select
                            fullWidth
                        >
                            {[
                                'English',
                                'Hausa',
                            ].map(language => (
                                <MenuItem
                                    key={language}
                                    value={language}
                                >
                                    {t(language)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label={t('Region')}
                            value={editData.region}
                            onChange={event =>
                                setEditData(previous => ({
                                    ...previous,
                                    region: event.target.value,
                                }))
                            }
                            fullWidth
                        />

                        <TextField
                            label={t('Source')}
                            value={editData.source}
                            onChange={event =>
                                setEditData(previous => ({
                                    ...previous,
                                    source: event.target.value,
                                }))
                            }
                            fullWidth
                        />

                        {editOpen && imagePreview && (
                            <Box>
                                <OptimizedTipImage
                                    key={imagePreview}
                                    source={imagePreview}
                                    alt={t('Tip image preview')}
                                    preview
                                />

                                <Button
                                    color="error"
                                    onClick={handleRemoveImage}
                                    disabled={
                                        saving ||
                                        imageProcessing
                                    }
                                    sx={{ mt: 1 }}
                                >
                                    {t('Remove image')}
                                </Button>
                            </Box>
                        )}

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >
                            {t(
                                'Supported formats: JPG, PNG, WebP. Maximum {{max}} MB per photo.',
                                {
                                    max: MAX_IMAGE_SIZE_MB,
                                }
                            )}
                        </Typography>

                        {/* Gallery selection */}
                        <input
                            ref={galleryInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            hidden
                            onChange={handleImageChange}
                        />

                        {/* Rear camera capture */}
                        <input
                            ref={cameraInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            hidden
                            onChange={handleImageChange}
                        />

                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={1}
                        >
                            <Button
                                variant="outlined"
                                startIcon={
                                    imageProcessing
                                        ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        )
                                        : (
                                            <AddPhotoAlternateOutlinedIcon />
                                        )
                                }
                                onClick={() =>
                                    galleryInputRef.current?.click()
                                }
                                disabled={
                                    saving ||
                                    imageProcessing
                                }
                                fullWidth
                                sx={{ minHeight: 44 }}
                            >
                                {imageProcessing
                                    ? t('Processing image...')
                                    : t(
                                        editData.image
                                            ? 'Change Photo'
                                            : 'Choose Photo'
                                    )}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<CameraAltIcon />}
                                onClick={() =>
                                    cameraInputRef.current?.click()
                                }
                                disabled={
                                    saving ||
                                    imageProcessing
                                }
                                fullWidth
                                sx={{ minHeight: 44 }}
                            >
                                {t('Take Photo')}
                            </Button>
                        </Stack>

                        {imageProcessing && (
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                role="status"
                            >
                                <CircularProgress size={16} />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('Processing image...')}
                                </Typography>
                            </Stack>
                        )}
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 2,
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={handleCloseEdit}
                        disabled={saving}
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        onClick={handleUpdate}
                        variant="contained"
                        disabled={
                            saving ||
                            imageProcessing ||
                            !editData.title.trim() ||
                            !editData.content.trim()
                        }
                        startIcon={
                            saving
                                ? (
                                    <CircularProgress
                                        size={16}
                                        color="inherit"
                                    />
                                )
                                : null
                        }
                    >
                        {saving
                            ? t('Saving...')
                            : t('Save changes')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Comments */}
            <Dialog
                open={commentsOpen}
                onClose={() =>
                    setCommentsOpen(false)
                }
                fullScreen={fullScreen}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {t('Comments')}
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ pt: 1 }}
                    >
                        {commentError && (
                            <Alert severity="error">
                                {commentError}
                            </Alert>
                        )}

                        {commentsOpen && (
                            tip.comments?.length
                                ? tip.comments.map(comment => {
                                    const commentUserId =
                                        getId(comment.user);

                                    const canDelete = Boolean(
                                        userId &&
                                        commentUserId === userId
                                    );

                                    return (
                                        <Box key={comment._id}>
                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                                alignItems="flex-start"
                                            >
                                                <Avatar
                                                    src={
                                                        getAvatarImage(
                                                            comment.user?.profilePhoto,
                                                            120
                                                        ) || undefined
                                                    }
                                                    alt={
                                                        comment.user?.name ||
                                                        t('User')
                                                    }
                                                    slotProps={{
                                                        img: {
                                                            loading: 'lazy',
                                                            decoding: 'async',
                                                            width: 40,
                                                            height: 40,
                                                        },
                                                    }}
                                                    sx={{
                                                        width: 40,
                                                        height: 40,
                                                    }}
                                                >
                                                    {comment.user?.name?.charAt(0) || '?'}
                                                </Avatar>

                                                <Box
                                                    flex={1}
                                                    minWidth={0}
                                                >
                                                    <Typography fontWeight={600}>
                                                        {comment.user?.name ||
                                                            t('User')}
                                                    </Typography>

                                                    <Typography
                                                        sx={{
                                                            whiteSpace: 'pre-line',
                                                            overflowWrap: 'anywhere',
                                                        }}
                                                    >
                                                        {comment.content}
                                                    </Typography>

                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {comment.createdAt
                                                            ? new Date(
                                                                comment.createdAt
                                                            ).toLocaleString()
                                                            : ''}
                                                    </Typography>
                                                </Box>

                                                {canDelete && (
                                                    <IconButton
                                                        aria-label={t(
                                                            'Delete comment'
                                                        )}
                                                        size="small"
                                                        onClick={() =>
                                                            requestConfirmation(
                                                                'deleteComment',
                                                                comment._id
                                                            )
                                                        }
                                                    >
                                                        <DeleteOutlineIcon
                                                            fontSize="small"
                                                        />
                                                    </IconButton>
                                                )}
                                            </Stack>

                                            <Divider sx={{ mt: 1.5 }} />
                                        </Box>
                                    );
                                })
                                : (
                                    <Typography color="text.secondary">
                                        {t(
                                            'No comments yet. Be the first to comment.'
                                        )}
                                    </Typography>
                                )
                        )}

                        <TextField
                            label={t('Write a comment')}
                            value={commentText}
                            onChange={event =>
                                setCommentText(
                                    event.target.value
                                )
                            }
                            multiline
                            minRows={2}
                            fullWidth
                        />

                        <Button
                            variant="contained"
                            startIcon={
                                commenting
                                    ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    )
                                    : <SendOutlinedIcon />
                            }
                            onClick={handleAddComment}
                            disabled={
                                commenting ||
                                !commentText.trim()
                            }
                        >
                            {commenting
                                ? t('Posting...')
                                : t('Post comment')}
                        </Button>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setCommentsOpen(false)
                        }
                    >
                        {t('Close')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Responsive confirmation dialog */}
            <Dialog
                open={Boolean(confirmation)}
                onClose={closeConfirmation}
                fullWidth
                maxWidth="xs"
                aria-labelledby="agri-tip-confirm-title"
                aria-describedby="agri-tip-confirm-description"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        m: 2,
                        width: 'calc(100% - 32px)',
                    },
                }}
            >
                <DialogTitle
                    id="agri-tip-confirm-title"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pb: 1,
                    }}
                >
                    <DeleteOutlineIcon color="error" />

                    {activeConfirmation?.title}
                </DialogTitle>

                <DialogContent>
                    <DialogContentText
                        id="agri-tip-confirm-description"
                    >
                        {activeConfirmation?.message}
                    </DialogContentText>

                    {confirmError && (
                        <Alert
                            severity="error"
                            sx={{ mt: 2 }}
                        >
                            {confirmError}
                        </Alert>
                    )}
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={closeConfirmation}
                        disabled={confirmLoading}
                        color="inherit"
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        onClick={handleConfirmAction}
                        disabled={confirmLoading}
                        variant="contained"
                        color="error"
                        startIcon={
                            confirmLoading
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : (
                                    <DeleteOutlineIcon />
                                )
                        }
                    >
                        {confirmLoading
                            ? t('Processing...')
                            : activeConfirmation?.button}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AgriTipCard;