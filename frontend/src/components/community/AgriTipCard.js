import React, { useRef, useState } from 'react';

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
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
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';

import { useDispatch, useSelector } from 'react-redux';
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

const MAX_IMAGE_SIZE = 1200;
const IMAGE_QUALITY = 0.75;

const compressImage = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const scale = Math.min(
                    1,
                    MAX_IMAGE_SIZE / Math.max(image.width, image.height)
                );
                const canvas = document.createElement('canvas');

                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);

                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                resolve(
                    canvas.toDataURL('image/jpeg', IMAGE_QUALITY)
                );
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const getId = (value) =>
    value?._id?.toString() || value?.id?.toString() || value?.toString();

const AgriTipCard = ({ tip }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth?.user);
    const fileInputRef = useRef(null);

    const [menuAnchor, setMenuAnchor] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [editError, setEditError] = useState('');
    const [commentError, setCommentError] = useState('');
    const [imageError, setImageError] = useState('');
    const [saving, setSaving] = useState(false);
    const [commenting, setCommenting] = useState(false);
    const [sharing, setSharing] = useState(false);

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

    const userId = getId(currentUser);
    const creatorId = getId(tip.createdBy);
    const isAdmin = currentUser?.role === 'admin';
    const isExtensionOfficer = currentUser?.role === 'extension_officer';
    const canManage = Boolean(
    userId &&
    (
        isAdmin ||
        (isExtensionOfficer && userId === creatorId)
    )
    );
    const liked = (tip.likes || []).some((like) => getId(like) === userId);

    const shared = (tip.sharedBy || []).some(
    (id) => getId(id) === userId
    );

    const priorityColor = () => {
        if (tip.priority === 'Urgent') return 'error';
        if (tip.priority === 'Important') return 'warning';
        return 'success';
    };

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError(t('Please select an image file.'));
            return;
        }

        try {
            setImageError('');
            const image = await compressImage(file);
            setEditData((previous) => ({ ...previous, image }));
        } catch {
            setImageError(t('Unable to process this image.'));
        }
    };

    const openEdit = () => {
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

    const handleUpdate = async () => {
        setSaving(true);
        setEditError('');

        const result = await dispatch(updateAgriTip(tip._id, editData));

        setSaving(false);

        if (!result.success) {
            setEditError(result.message || t('Unable to update tip.'));
            return;
        }

        setEditOpen(false);
    };

    const handleDelete = async () => {
        setMenuAnchor(null);

        if (!window.confirm(t('Delete this agricultural tip?'))) return;

        await dispatch(deleteAgriTip(tip._id));
    };

    const handleLike = () => {
        dispatch(likeAgriTip(tip._id));
    };

    const handleAddComment = async () => {
        const content = commentText.trim();
        if (!content) return;

        setCommenting(true);
        setCommentError('');

        const result = await dispatch(addAgriTipComment(tip._id, content));

        setCommenting(false);

        if (!result.success) {
            setCommentError(result.message || t('Unable to add comment.'));
            return;
        }

        setCommentText('');
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm(t('Delete this comment?'))) return;

        const result = await dispatch(
            deleteAgriTipComment(tip._id, commentId)
        );

        if (!result.success) {
            setCommentError(result.message || t('Unable to delete comment.'));
        }
    };

    const handleShare = async () => {
        if (shared) {
            if (
                !window.confirm(
                    t('Remove this agricultural tip from the Community?')
                )
            ) {
                return;
            }

            setSharing(true);

            const result = await dispatch(
                unshareAgriTip(tip._id)
            );

            setSharing(false);

            if (!result.success) {
                setCommentError(
                    result.message ||
                        t('Unable to remove this tip from the Community.')
                );
            }

            return;
        }

        setSharing(true);
        setCommentError('');

        const result = await dispatch(
            shareAgriTip(tip._id)
        );

        setSharing(false);

        if (!result.success) {
            setCommentError(
                result.message ||
                    t('Unable to share this tip to the Community.')
            );
        }
    };

    return (
        <>
            <Card elevation={2} sx={{ borderRadius: 3 }}>
                {tip.image && (
                    <CardMedia
                        component="img"
                        height="220"
                        image={tip.image}
                        alt={tip.title}
                    />
                )}

                <CardContent>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2} mb={2}>
                        <Typography variant="h6" fontWeight={700}>
                            {tip.title}
                        </Typography>

                        <Stack direction="row" alignItems="center" spacing={1}>
                            <Chip label={t(tip.priority)} color={priorityColor()} size="small" />
                            {canManage && (
                                <IconButton
                                    aria-label={t('Tip options')}
                                    onClick={(event) => setMenuAnchor(event.currentTarget)}
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
                        onClose={() => setMenuAnchor(null)}
                    >
                        <MenuItem onClick={openEdit}>
                            <EditOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('Edit')}
                        </MenuItem>
                        <MenuItem onClick={handleDelete}>
                            <DeleteOutlineIcon fontSize="small" sx={{ mr: 1 }} />
                            {t('Delete')}
                        </MenuItem>
                    </Menu>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap mb={2}>
                        <Chip icon={<AgricultureIcon />} label={t(tip.category)} size="small" color="success" variant="outlined" />
                        <Chip icon={<LanguageIcon />} label={t(tip.language)} size="small" variant="outlined" />
                        <Chip icon={<LocationOnIcon />} label={t(tip.region)} size="small" variant="outlined" />
                    </Stack>

                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        {tip.content}
                    </Typography>

                    <Box mt={3}>
                        {tip.createdBy?.name && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>{t('Shared by')}:</strong> {tip.createdBy.name}
                            </Typography>
                        )}

                        {tip.source && (
                            <Typography variant="body2" color="text.secondary">
                                <strong>{t('Source')}:</strong> {tip.source}
                            </Typography>
                        )}

                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                            {tip.createdAt ? new Date(tip.createdAt).toLocaleDateString() : ''}
                        </Typography>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Stack direction="row" justifyContent="space-around" alignItems="center">
                        <Button
                            startIcon={liked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                            onClick={handleLike}
                            color={liked ? 'error' : 'inherit'}
                        >
                            {t('Like')} ({tip.likes?.length || 0})
                        </Button>

                        <Button
                            startIcon={<ChatBubbleOutlineIcon />}
                            onClick={() => setCommentsOpen(true)}
                            color="inherit"
                        >
                            {t('Comment')} ({tip.comments?.length || 0})
                        </Button>

                        <Button
                            startIcon={<ShareIcon />}
                            onClick={handleShare}
                            disabled={sharing}
                            color={shared ? 'success' : 'inherit'}
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

            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{t('Edit Agricultural Tip')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {editError && <Alert severity="error">{editError}</Alert>}
                        {imageError && <Alert severity="error">{imageError}</Alert>}

                        <TextField
                            label={t('Title')}
                            value={editData.title}
                            inputProps={{ maxLength: 150 }}
                            onChange={(event) => setEditData({ ...editData, title: event.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label={t('Category')}
                            value={editData.category}
                            onChange={(event) => setEditData({ ...editData, category: event.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label={t('Content')}
                            value={editData.content}
                            onChange={(event) => setEditData({ ...editData, content: event.target.value })}
                            multiline
                            minRows={5}
                            fullWidth
                            required
                        />
                        <TextField
                            label={t('Priority')}
                            value={editData.priority}
                            onChange={(event) => setEditData({ ...editData, priority: event.target.value })}
                            select
                            fullWidth
                        >
                            {['Normal', 'Important', 'Urgent'].map((priority) => (
                                <MenuItem key={priority} value={priority}>{t(priority)}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label={t('Language')}
                            value={editData.language}
                            onChange={(event) => setEditData({ ...editData, language: event.target.value })}
                            select
                            fullWidth
                        >
                            {['English', 'Hausa'].map((language) => (
                                <MenuItem key={language} value={language}>{t(language)}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label={t('Region')}
                            value={editData.region}
                            onChange={(event) => setEditData({ ...editData, region: event.target.value })}
                            fullWidth
                        />
                        <TextField
                            label={t('Source')}
                            value={editData.source}
                            onChange={(event) => setEditData({ ...editData, source: event.target.value })}
                            fullWidth
                        />

                        {editData.image && (
                            <Box>
                                <CardMedia
                                    component="img"
                                    image={editData.image}
                                    alt={t('Tip image preview')}
                                    sx={{ maxHeight: 220, objectFit: 'contain', borderRadius: 2 }}
                                />
                                <Button color="error" onClick={() => setEditData({ ...editData, image: '' })}>
                                    {t('Remove image')}
                                </Button>
                            </Box>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            hidden
                            onChange={handleImageChange}
                        />
                        <Button
                            variant="outlined"
                            startIcon={<CameraAltIcon />}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            {t(editData.image ? 'Change image' : 'Add photo or take a picture')}
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)}>{t('Cancel')}</Button>
                    <Button onClick={handleUpdate} variant="contained" disabled={saving || !editData.title.trim() || !editData.content.trim()}>
                        {saving ? t('Saving...') : t('Save changes')}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={commentsOpen} onClose={() => setCommentsOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>{t('Comments')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {commentError && <Alert severity="error">{commentError}</Alert>}

                        {tip.comments?.length ? tip.comments.map((comment) => {
                            const commentUserId = getId(comment.user);
                            const canDelete = Boolean(userId && commentUserId === userId);

                            return (
                                <Box key={comment._id}>
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Avatar src={comment.user?.profilePhoto}>
                                            {comment.user?.name?.charAt(0) || '?'}
                                        </Avatar>
                                        <Box flex={1}>
                                            <Typography fontWeight={600}>
                                                {comment.user?.name || t('User')}
                                            </Typography>
                                            <Typography sx={{ whiteSpace: 'pre-line' }}>
                                                {comment.content}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                                            </Typography>
                                        </Box>
                                        {canDelete && (
                                            <IconButton
                                                aria-label={t('Delete comment')}
                                                size="small"
                                                onClick={() => handleDeleteComment(comment._id)}
                                            >
                                                <DeleteOutlineIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                    </Stack>
                                    <Divider sx={{ mt: 1.5 }} />
                                </Box>
                            );
                        }) : (
                            <Typography color="text.secondary">
                                {t('No comments yet. Be the first to comment.')}
                            </Typography>
                        )}

                        <TextField
                            label={t('Write a comment')}
                            value={commentText}
                            onChange={(event) => setCommentText(event.target.value)}
                            multiline
                            minRows={2}
                            fullWidth
                        />
                        <Button
                            variant="contained"
                            startIcon={<SendOutlinedIcon />}
                            onClick={handleAddComment}
                            disabled={commenting || !commentText.trim()}
                        >
                            {commenting ? t('Posting...') : t('Post comment')}
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCommentsOpen(false)}>{t('Close')}</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default AgriTipCard;