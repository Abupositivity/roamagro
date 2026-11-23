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
    CircularProgress,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Snackbar,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
    addComment,
    deleteComment,
    likePost,
    updateTopic,
    deleteTopic,
    sharePost,
} from '../../redux/actions/communityActions';

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

import CommentDialog from './CommentDialog';

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

const AUTHOR_AVATAR_SIZE = 132;
const POST_IMAGE_WIDTH = 800;
const PREVIEW_IMAGE_WIDTH = 800;

const COMMUNITY_IMAGE_SIZES = [
    'auto',
    '(max-width: 599px) 90vw',
    '(max-width: 899px) 90vw',
    '800px',
].join(', ');

const POST_IMAGE_STYLES = {
    mt: 2,
    width: '100%',
    aspectRatio: '4 / 3',
    maxHeight: {
        xs: 280,
        sm: 380,
    },
    borderRadius: 2,
    objectFit: 'cover',
    backgroundColor: 'action.hover',
    display: 'block',
};

const PREVIEW_IMAGE_STYLES = {
    width: '100%',
    maxHeight: 250,
    objectFit: 'contain',
    display: 'block',
    backgroundColor: 'action.hover',
};

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

const getInitial = name => {
    if (!name) return 'F';

    return name
        .trim()
        .charAt(0)
        .toUpperCase();
};

const formatDate = date => {
    if (!date) return '';

    const postDate = new Date(date);

    if (Number.isNaN(postDate.getTime())) {
        return '';
    }

    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const target = new Date(
        postDate.getFullYear(),
        postDate.getMonth(),
        postDate.getDate()
    );

    const difference = Math.round(
        (today - target) / 86400000
    );

    if (difference === 0) return 'Today';
    if (difference === 1) return 'Yesterday';

    if (difference > 1 && difference < 7) {
        return `${difference} days ago`;
    }

    return postDate.toLocaleDateString(
        undefined,
        {
            day: 'numeric',
            month: 'short',
            year:
                postDate.getFullYear() !==
                now.getFullYear()
                    ? 'numeric'
                    : undefined,
        }
    );
};

const OptimizedPostImage = ({
    source,
    alt,
    preview = false,
}) => {
    const { t } = useTranslation();

    const [useOriginal, setUseOriginal] =
        useState(false);

    const [imageFailed, setImageFailed] =
        useState(false);

    const [imageLoaded, setImageLoaded] =
        useState(false);

    const [retryCount, setRetryCount] =
        useState(0);

    const optimizedSource = source
        ? preview
            ? getResponsiveImage(
                source,
                PREVIEW_IMAGE_WIDTH
            )
            : getFeedImage(
                source,
                POST_IMAGE_WIDTH
            )
        : '';

    const imageSource = useOriginal
        ? source
        : optimizedSource;

    const srcSet =
        source && !preview && !useOriginal
            ? getFeedImageSrcSet(source)
            : undefined;

    const handleImageError = () => {
        setImageLoaded(false);

        if (
            !useOriginal &&
            (
                optimizedSource !== source ||
                srcSet
            )
        ) {
            setUseOriginal(true);
            return;
        }

        setImageFailed(true);
    };

    const handleRetry = () => {
        setImageFailed(false);
        setImageLoaded(false);
        setUseOriginal(false);
        setRetryCount(previous => previous + 1);
    };

    const imageStyles = preview
        ? PREVIEW_IMAGE_STYLES
        : POST_IMAGE_STYLES;

    if (!source) return null;

    if (imageFailed) {
        return (
            <Box
                role="group"
                aria-label={
                    alt ||
                    t('Image unavailable')
                }
                sx={{
                    ...imageStyles,
                    minHeight: preview
                        ? 150
                        : {
                            xs: 180,
                            sm: 220,
                        },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    gap: 1,
                    p: 2,
                }}
            >
                <BrokenImageOutlinedIcon
                    fontSize="large"
                />

                <Typography
                    variant="body2"
                    textAlign="center"
                >
                    {t('Image unavailable')}
                </Typography>

                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={handleRetry}
                >
                    {t('Retry')}
                </Button>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                ...imageStyles,
                position: 'relative',
                overflow: 'hidden',
                minHeight: preview
                    ? 150
                    : undefined,
            }}
        >
            {preview && !imageLoaded && (
                <Box
                    role="status"
                    aria-label={t(
                        'Loading image...'
                    )}
                    sx={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'action.hover',
                    }}
                >
                    <CircularProgress size={26} />
                </Box>
            )}

            <CardMedia
                key={`${retryCount}:${useOriginal ? 'original' : 'optimized'}`}
                component="img"
                image={imageSource}
                srcSet={srcSet}
                sizes={
                    srcSet
                        ? COMMUNITY_IMAGE_SIZES
                        : undefined
                }
                alt={alt}
                loading={
                    preview
                        ? 'eager'
                        : 'lazy'
                }
                decoding="async"
                onLoad={() =>
                    setImageLoaded(true)
                }
                onError={handleImageError}
                sx={{
                    width: '100%',
                    height: '100%',
                    aspectRatio: preview
                        ? undefined
                        : '4 / 3',
                    maxHeight: preview
                        ? 250
                        : {
                            xs: 280,
                            sm: 380,
                        },
                    objectFit: preview
                        ? 'contain'
                        : 'cover',
                    display: 'block',
                    opacity:
                        preview && !imageLoaded
                            ? 0
                            : 1,
                }}
            />
        </Box>
    );
};

const AgriPostCard = ({
    post,
    onOpenProfile,
}) => {
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
    const imageSelectionIdRef = useRef(0);

    const [openComments, setOpenComments] =
        useState(false);

    const [menuAnchor, setMenuAnchor] =
        useState(null);

    const [editOpen, setEditOpen] =
        useState(false);

    const [deleteOpen, setDeleteOpen] =
        useState(false);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [deleteError, setDeleteError] =
        useState('');

    const [editSaving, setEditSaving] =
        useState(false);

    const [editError, setEditError] =
        useState('');

    const [shareLoading, setShareLoading] =
        useState(false);

    const [imageLoading, setImageLoading] =
        useState(false);

    const [imageError, setImageError] =
        useState('');

    const [imagePreview, setImagePreview] =
        useState('');

    const [copyLinkOpen, setCopyLinkOpen] =
        useState(false);

    const [shareUrl, setShareUrl] =
        useState('');

    const [notification, setNotification] =
        useState({
            open: false,
            message: '',
            severity: 'success',
        });

    const [editData, setEditData] =
        useState({
            title: post.title || '',
            content: post.content || '',
            category:
                post.category ||
                'General',
            image: post.image || '',
        });

    useEffect(() => {
        return () => {
            imageSelectionIdRef.current += 1;
        };
    }, []);

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

    const userId =
        currentUser?._id ||
        currentUser?.id;

    const postUserId =
        post.user?._id ||
        post.user?.id ||
        post.user;

    const isOwner = Boolean(
        userId &&
        postUserId &&
        userId.toString() ===
            postUserId.toString()
    );

    const isOwnProfile = isOwner;

    const liked = Boolean(
        post.likes?.some(like => {
            const likeId =
                like?._id ||
                like?.id ||
                like;

            return (
                likeId?.toString() ===
                userId?.toString()
            );
        })
    );

    const likeCount =
        post.likes?.length || 0;

    const commentCount =
        post.comments?.length || 0;

    const shareCount =
        post.shares || 0;

    const authorName =
        post.user?.name ||
        'Farmer';

    const authorPhoto = getAvatarImage(
        post.user?.profilePhoto,
        AUTHOR_AVATAR_SIZE
    );

    const showNotification = (
        message,
        severity = 'success'
    ) => {
        setNotification({
            open: true,
            message,
            severity,
        });
    };

    const resetFileInputs = () => {
        if (galleryInputRef.current) {
            galleryInputRef.current.value = '';
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    const handleOpenProfile = () => {
        if (
            !onOpenProfile ||
            !postUserId ||
            isOwnProfile
        ) {
            return;
        }

        onOpenProfile(
            postUserId.toString()
        );
    };

    const handleLike = () => {
        dispatch(
            likePost(post._id)
        );
    };

    const handleAddComment = content => {
        return dispatch(
            addComment(
                post._id,
                content
            )
        );
    };

    const handleDeleteComment = commentId => {
        return dispatch(
            deleteComment(
                post._id,
                commentId
            )
        );
    };

    const handleOpenEdit = () => {
        imageSelectionIdRef.current += 1;

        setImageLoading(false);

        setEditData({
            title: post.title || '',
            content: post.content || '',
            category:
                post.category ||
                'General',
            image: post.image || '',
        });

        setEditError('');
        setImageError('');
        setMenuAnchor(null);
        setEditOpen(true);
    };

    const handleEditChange = event => {
        const { name, value } =
            event.target;

        setEditData(previous => ({
            ...previous,
            [name]: value,
        }));
    };

    const handleImageSelect = async event => {
        const file =
            event.target.files?.[0];

        event.target.value = '';

        if (
            !file ||
            imageLoading ||
            editSaving
        ) {
            return;
        }

        const selectionId =
            ++imageSelectionIdRef.current;

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

        setImageLoading(true);

        try {
            const compressedFile =
                await compressImage(file);

            if (
                selectionId !==
                imageSelectionIdRef.current
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
                imageSelectionIdRef.current
            ) {
                return;
            }

            setImageError(
                t(
                    error?.message ||
                    'Unable to add image.'
                )
            );
        } finally {
            if (
                selectionId ===
                imageSelectionIdRef.current
            ) {
                setImageLoading(false);
            }
        }
    };

    const handleRemoveImage = () => {
        imageSelectionIdRef.current += 1;

        setImageLoading(false);
        setImageError('');

        resetFileInputs();

        setEditData(previous => ({
            ...previous,
            image: '',
        }));
    };

    const handleCloseEdit = () => {
        if (editSaving) return;

        imageSelectionIdRef.current += 1;

        setImageLoading(false);
        setImageError('');
        setEditError('');
        setEditOpen(false);

        resetFileInputs();
    };

    const handleUpdate = async () => {
        if (
            editSaving ||
            imageLoading ||
            !editData.title.trim() ||
            !editData.content.trim()
        ) {
            return;
        }

        setEditSaving(true);
        setEditError('');

        try {
            const result = await dispatch(
                updateTopic(
                    post._id,
                    editData
                )
            );

            if (!result?.success) {
                setEditError(
                    result?.error ||
                    t('Unable to update post.')
                );
                return;
            }

            imageSelectionIdRef.current += 1;
            setEditOpen(false);

            showNotification(
                t('Post updated successfully.')
            );
        } catch (error) {
            setEditError(
                error?.message ||
                t('Unable to update post.')
            );
        } finally {
            setEditSaving(false);
        }
    };

    const handleDelete = () => {
        setMenuAnchor(null);
        setDeleteError('');
        setDeleteOpen(true);
    };

    const handleCloseDelete = () => {
        if (deleteLoading) return;

        setDeleteOpen(false);
        setDeleteError('');
    };

    const handleConfirmDelete = async () => {
        if (
            deleteLoading ||
            !isOwner
        ) {
            return;
        }

        setDeleteLoading(true);
        setDeleteError('');

        try {
            const result = await dispatch(
                deleteTopic(post._id)
            );

            if (!result?.success) {
                setDeleteError(
                    result?.error ||
                    t('Unable to delete post.')
                );
                return;
            }

            setDeleteOpen(false);
        } catch (error) {
            setDeleteError(
                error?.message ||
                t('Unable to delete post.')
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleShare = async () => {
        if (shareLoading) return;

        setShareLoading(true);

        const url =
            `${window.location.origin}/community?post=${post._id}`;

        try {
            if (navigator.share) {
                await navigator.share({
                    title:
                        post.title ||
                        'RoamAgro Community',
                    text:
                        post.content ||
                        '',
                    url,
                });

                const result = await dispatch(
                    sharePost(post._id)
                );

                if (result?.success === false) {
                    showNotification(
                        result.error ||
                        t('Unable to record share.'),
                        'error'
                    );
                }

                return;
            }

            if (navigator.clipboard) {
                await navigator.clipboard.writeText(
                    url
                );

                const result = await dispatch(
                    sharePost(post._id)
                );

                if (result?.success === false) {
                    showNotification(
                        result.error ||
                        t('Unable to record share.'),
                        'error'
                    );
                } else {
                    showNotification(
                        t('Post link copied.')
                    );
                }

                return;
            }

            setShareUrl(url);
            setCopyLinkOpen(true);
        } catch (error) {
            if (
                error?.name ===
                'AbortError'
            ) {
                return;
            }

            setShareUrl(url);
            setCopyLinkOpen(true);
        } finally {
            setShareLoading(false);
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(
                shareUrl
            );

            setCopyLinkOpen(false);

            showNotification(
                t('Post link copied.')
            );
        } catch {
            showNotification(
                t(
                    'Unable to copy link. Please copy it manually.'
                ),
                'error'
            );
        }
    };

    return (
        <>
            <Card
                elevation={1}
                sx={{
                    borderRadius: 3,
                    overflow: 'hidden',
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <CardContent
                    sx={{
                        p: {
                            xs: 2,
                            sm: 2.5,
                        },
                        '&:last-child': {
                            pb: {
                                xs: 2,
                                sm: 2.5,
                            },
                        },
                    }}
                >
                    <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                    >
                        <Avatar
                            src={
                                authorPhoto ||
                                undefined
                            }
                            alt={authorName}
                            onClick={handleOpenProfile}
                            slotProps={{
                                img: {
                                    loading: 'lazy',
                                    decoding: 'async',
                                    width: 44,
                                    height: 44,
                                },
                            }}
                            sx={{
                                width: 44,
                                height: 44,
                                fontWeight: 700,
                                cursor:
                                    onOpenProfile &&
                                    postUserId &&
                                    !isOwnProfile
                                        ? 'pointer'
                                        : 'default',
                                '&:hover':
                                    onOpenProfile &&
                                    postUserId &&
                                    !isOwnProfile
                                        ? {
                                            boxShadow:
                                                '0 0 0 3px rgba(0,191,99,0.18)',
                                        }
                                        : {},
                            }}
                        >
                            {getInitial(authorName)}
                        </Avatar>

                        <Box
                            sx={{
                                flex: 1,
                                minWidth: 0,
                            }}
                        >
                            <Typography
                                fontWeight={700}
                                onClick={handleOpenProfile}
                                sx={{
                                    fontSize: {
                                        xs: '0.95rem',
                                        sm: '1rem',
                                    },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    cursor:
                                        onOpenProfile &&
                                        postUserId &&
                                        !isOwnProfile
                                            ? 'pointer'
                                            : 'default',
                                    '&:hover':
                                        onOpenProfile &&
                                        postUserId &&
                                        !isOwnProfile
                                            ? {
                                                color:
                                                    'primary.main',
                                            }
                                            : {},
                                }}
                            >
                                {authorName}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {formatDate(
                                    post.createdAt
                                )}
                            </Typography>
                        </Box>

                        <Chip
                            label={
                                post.category ||
                                'General'
                            }
                            color="success"
                            size="small"
                            sx={{
                                maxWidth: {
                                    xs: 120,
                                    sm: 180,
                                },
                                '& .MuiChip-label': {
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                },
                            }}
                        />

                        {isOwner && (
                            <IconButton
                                size="large"
                                onClick={event =>
                                    setMenuAnchor(
                                        event.currentTarget
                                    )
                                }
                                aria-label={t(
                                    'Post options'
                                )}
                                sx={{ ml: -0.5 }}
                            >
                                <MoreVertIcon />
                            </IconButton>
                        )}
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{
                                fontSize: {
                                    xs: '1.05rem',
                                    sm: '1.2rem',
                                },
                                lineHeight: 1.35,
                                wordBreak: 'break-word',
                            }}
                        >
                            {post.title}
                        </Typography>

                        <Typography
                            color="text.primary"
                            sx={{
                                mt: 1,
                                lineHeight: 1.65,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontSize: {
                                    xs: '0.95rem',
                                    sm: '1rem',
                                },
                            }}
                        >
                            {post.content}
                        </Typography>
                    </Box>

                    {getImageSource(post.image) && (
                        <OptimizedPostImage
                            key={getImageSource(post.image)}
                            source={getImageSource(post.image)}
                            alt={
                                post.title ||
                                t('Community post image')
                            }
                        />
                    )}

                    <Divider sx={{ my: 1.5 }} />

                    <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        sx={{
                            width: '100%',
                            gap: 0.5,
                        }}
                    >
                        <Button
                            size="medium"
                            color={
                                liked
                                    ? 'error'
                                    : 'inherit'
                            }
                            onClick={handleLike}
                            startIcon={
                                liked
                                    ? <FavoriteIcon />
                                    : <FavoriteBorderIcon />
                            }
                            sx={{
                                minWidth: 0,
                                px: {
                                    xs: 1,
                                    sm: 1.5,
                                },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {likeCount}

                            <Box
                                component="span"
                                sx={{
                                    display: {
                                        xs: 'none',
                                        sm: 'inline',
                                    },
                                    ml: 0.5,
                                }}
                            >
                                {liked
                                    ? t('Liked')
                                    : t('Like')}
                            </Box>
                        </Button>

                        <Button
                            size="medium"
                            color="inherit"
                            onClick={() =>
                                setOpenComments(true)
                            }
                            startIcon={
                                <ChatBubbleOutlineIcon />
                            }
                            sx={{
                                minWidth: 0,
                                px: {
                                    xs: 1,
                                    sm: 1.5,
                                },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            {commentCount}

                            <Box
                                component="span"
                                sx={{
                                    display: {
                                        xs: 'none',
                                        sm: 'inline',
                                    },
                                    ml: 0.5,
                                }}
                            >
                                {t('Comment')}
                            </Box>
                        </Button>

                        <Button
                            size="medium"
                            color="inherit"
                            onClick={handleShare}
                            disabled={shareLoading}
                            startIcon={
                                shareLoading
                                    ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    )
                                    : <ShareIcon />
                            }
                            sx={{
                                minWidth: 0,
                                px: {
                                    xs: 1,
                                    sm: 1.5,
                                },
                                textTransform: 'none',
                                fontWeight: 600,
                            }}
                        >
                            <Box
                                component="span"
                                sx={{
                                    display: {
                                        xs: 'none',
                                        sm: 'inline',
                                    },
                                }}
                            >
                                {shareLoading
                                    ? t('Sharing...')
                                    : t('Share')}
                            </Box>

                            <Box
                                component="span"
                                sx={{
                                    display: {
                                        xs: 'inline',
                                        sm: 'none',
                                    },
                                }}
                            >
                                {shareCount}
                            </Box>
                        </Button>
                    </Stack>
                </CardContent>
            </Card>

            {/* Post options */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() =>
                    setMenuAnchor(null)
                }
            >
                <MenuItem
                    onClick={handleOpenEdit}
                    sx={{ minHeight: 48 }}
                >
                    <EditOutlinedIcon
                        fontSize="small"
                        sx={{ mr: 1.5 }}
                    />

                    {t('Edit Post')}
                </MenuItem>

                <MenuItem
                    onClick={handleDelete}
                    disabled={deleteLoading}
                    sx={{ minHeight: 48 }}
                >
                    <DeleteOutlineIcon
                        fontSize="small"
                        sx={{ mr: 1.5 }}
                    />

                    {t('Delete Post')}
                </MenuItem>
            </Menu>

            {/* Edit post */}
            <Dialog
                open={editOpen}
                onClose={handleCloseEdit}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    {t('Edit Post')}
                </DialogTitle>

                <DialogContent>
                    <Stack
                        spacing={2}
                        sx={{ mt: 1 }}
                    >
                        {editError && (
                            <Alert severity="error">
                                {editError}
                            </Alert>
                        )}

                        <TextField
                            fullWidth
                            label={t('Title')}
                            name="title"
                            value={editData.title}
                            onChange={handleEditChange}
                            disabled={editSaving}
                            autoFocus
                        />

                        <TextField
                            fullWidth
                            multiline
                            minRows={5}
                            label={t(
                                'What do you want to share?'
                            )}
                            name="content"
                            value={editData.content}
                            onChange={handleEditChange}
                            disabled={editSaving}
                        />

                        <TextField
                            select
                            fullWidth
                            label={t('Category')}
                            name="category"
                            value={editData.category}
                            onChange={handleEditChange}
                            disabled={editSaving}
                        >
                            {categories.map(
                                category => (
                                    <MenuItem
                                        key={category}
                                        value={category}
                                    >
                                        {t(category)}
                                    </MenuItem>
                                )
                            )}
                        </TextField>

                        <Box>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={0.5}
                            >
                                {t('Photo (optional)')}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                mb={1.5}
                            >
                                {t(
                                    'Maximum {{max}} MB per photo.',
                                    {
                                        max: MAX_IMAGE_SIZE_MB,
                                    }
                                )}
                            </Typography>

                            {/* Gallery input */}
                            <input
                                ref={galleryInputRef}
                                type="file"
                                accept="image/*"
                                hidden
                                onChange={handleImageSelect}
                            />

                            {/* Camera input */}
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                hidden
                                onChange={handleImageSelect}
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
                                        imageLoading
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
                                        imageLoading ||
                                        editSaving
                                    }
                                    sx={{
                                        flex: 1,
                                        minHeight: 44,
                                        textTransform: 'none',
                                    }}
                                >
                                    {imageLoading
                                        ? t('Processing...')
                                        : t('Choose Photo')}
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<CameraAltIcon />}
                                    onClick={() =>
                                        cameraInputRef.current?.click()
                                    }
                                    disabled={
                                        imageLoading ||
                                        editSaving
                                    }
                                    sx={{
                                        flex: 1,
                                        minHeight: 44,
                                        textTransform: 'none',
                                    }}
                                >
                                    {t('Take Photo')}
                                </Button>
                            </Stack>

                            {imageError && (
                                <Alert
                                    severity="error"
                                    sx={{ mt: 1.5 }}
                                >
                                    {imageError}
                                </Alert>
                            )}

                            {imagePreview && (
                                <Box
                                    sx={{
                                        position: 'relative',
                                        mt: 2,
                                        width: '100%',
                                        maxWidth: 400,
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                    }}
                                >
                                    <OptimizedPostImage
                                        key={imagePreview}
                                        source={imagePreview}
                                        alt={t(
                                            'Community post'
                                        )}
                                        preview
                                    />

                                    <IconButton
                                        size="small"
                                        onClick={handleRemoveImage}
                                        disabled={
                                            imageLoading ||
                                            editSaving
                                        }
                                        aria-label={t(
                                            'Remove photo'
                                        )}
                                        sx={{
                                            position: 'absolute',
                                            top: 8,
                                            right: 8,
                                            backgroundColor:
                                                'rgba(255,255,255,0.9)',
                                            '&:hover': {
                                                backgroundColor:
                                                    'white',
                                            },
                                        }}
                                    >
                                        <DeleteOutlineIcon
                                            fontSize="small"
                                        />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 3,
                        pb: 2,
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={handleCloseEdit}
                        disabled={editSaving}
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleUpdate}
                        disabled={
                            editSaving ||
                            imageLoading ||
                            !editData.title.trim() ||
                            !editData.content.trim()
                        }
                        startIcon={
                            editSaving
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : null
                        }
                    >
                        {editSaving
                            ? t('Saving...')
                            : t('Save Changes')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Responsive delete confirmation */}
            <Dialog
                open={deleteOpen}
                onClose={handleCloseDelete}
                fullWidth
                maxWidth="xs"
                aria-labelledby="delete-community-post-title"
                aria-describedby="delete-community-post-description"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        m: 2,
                        width: 'calc(100% - 32px)',
                    },
                }}
            >
                <DialogTitle
                    id="delete-community-post-title"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pb: 1,
                    }}
                >
                    <DeleteOutlineIcon color="error" />

                    {t('Delete Post?')}
                </DialogTitle>

                <DialogContent>
                    <DialogContentText
                        id="delete-community-post-description"
                    >
                        {t(
                            'Are you sure you want to delete this post? This action cannot be undone.'
                        )}
                    </DialogContentText>

                    {deleteError && (
                        <Alert
                            severity="error"
                            sx={{ mt: 2 }}
                        >
                            {deleteError}
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
                        onClick={handleCloseDelete}
                        disabled={deleteLoading}
                        color="inherit"
                    >
                        {t('Cancel')}
                    </Button>

                    <Button
                        onClick={handleConfirmDelete}
                        disabled={deleteLoading}
                        variant="contained"
                        color="error"
                        startIcon={
                            deleteLoading
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : <DeleteOutlineIcon />
                        }
                    >
                        {deleteLoading
                            ? t('Deleting...')
                            : t('Delete Post')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Comments */}
            <CommentDialog
                open={openComments}
                onClose={() =>
                    setOpenComments(false)
                }
                post={post}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
            />

            {/* Share-link fallback */}
            <Dialog
                open={copyLinkOpen}
                onClose={() =>
                    setCopyLinkOpen(false)
                }
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>
                    {t('Share Post')}
                </DialogTitle>

                <DialogContent>
                    <DialogContentText>
                        {t(
                            'Copy this link to share the post.'
                        )}
                    </DialogContentText>

                    <TextField
                        label={t('Post Link')}
                        value={shareUrl}
                        fullWidth
                        margin="normal"
                        InputProps={{
                            readOnly: true,
                        }}
                        onFocus={event =>
                            event.target.select()
                        }
                    />
                </DialogContent>

                <DialogActions>
                    <Button
                        onClick={() =>
                            setCopyLinkOpen(false)
                        }
                    >
                        {t('Close')}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleCopyLink}
                    >
                        {t('Copy Link')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* In-app notifications */}
            <Snackbar
                open={notification.open}
                autoHideDuration={4000}
                onClose={() =>
                    setNotification(previous => ({
                        ...previous,
                        open: false,
                    }))
                }
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'center',
                }}
            >
                <Alert
                    severity={notification.severity}
                    variant="filled"
                    onClose={() =>
                        setNotification(previous => ({
                            ...previous,
                            open: false,
                        }))
                    }
                    sx={{
                        width: '100%',
                    }}
                >
                    {notification.message}
                </Alert>
            </Snackbar>
        </>
    );
};

export default AgriPostCard;