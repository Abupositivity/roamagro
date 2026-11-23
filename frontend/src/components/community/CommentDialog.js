import React, {
    useState,
} from 'react';

import {
    Alert,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import CommentItem from './CommentItem';

const CommentDialog = ({
    open,
    onClose,
    post,
    onAddComment,
    onDeleteComment,
}) => {
    const { t } = useTranslation();

    const theme = useTheme();

    const fullScreen = useMediaQuery(
        theme.breakpoints.down('sm')
    );

    const [comment, setComment] =
        useState('');

    const [commentLoading, setCommentLoading] =
        useState(false);

    const [commentError, setCommentError] =
        useState('');

    const [deleteCommentId, setDeleteCommentId] =
        useState(null);

    const [deleteLoading, setDeleteLoading] =
        useState(false);

    const [deleteError, setDeleteError] =
        useState('');

    const currentUser = useSelector(
        state =>
            state.auth?.user ||
            state.auth?.currentUser
    );

    const currentUserId =
        currentUser?._id ||
        currentUser?.id;

    const canDeleteComment = item => {
        const commentUserId =
            item.user?._id ||
            item.user?.id ||
            item.user;

        return Boolean(
            currentUserId &&
            commentUserId &&
            currentUserId.toString() ===
                commentUserId.toString()
        );
    };

    const handleSubmit = async () => {
        const content = comment.trim();

        if (
            !content ||
            commentLoading
        ) {
            return;
        }

        setCommentLoading(true);
        setCommentError('');

        try {
            const result = await onAddComment(content);

            if (!result?.success) {
                setCommentError(
                    result?.error ||
                    t('Unable to add comment.')
                );
                return;
            }

            setComment('');
        } catch (error) {
            setCommentError(
                error?.message ||
                t('Unable to add comment.')
            );
        } finally {
            setCommentLoading(false);
        }
    };

    const handleRequestDelete = commentId => {
        if (
            !commentId ||
            deleteLoading
        ) {
            return;
        }

        setDeleteError('');
        setDeleteCommentId(commentId);
    };

    const handleCloseDelete = () => {
        if (deleteLoading) return;

        setDeleteCommentId(null);
        setDeleteError('');
    };

    const handleConfirmDelete = async () => {
        if (
            !deleteCommentId ||
            deleteLoading
        ) {
            return;
        }

        const selectedComment =
            post.comments?.find(
                item =>
                    String(item._id) ===
                    String(deleteCommentId)
            );

        if (
            !selectedComment ||
            !canDeleteComment(selectedComment)
        ) {
            setDeleteError(
                t('You cannot delete this comment.')
            );
            return;
        }

        setDeleteLoading(true);
        setDeleteError('');

        try {
            const result =
                await onDeleteComment(
                    deleteCommentId
                );

            if (!result?.success) {
                setDeleteError(
                    result?.error ||
                    t('Unable to delete comment.')
                );
                return;
            }

            setDeleteCommentId(null);
        } catch (error) {
            setDeleteError(
                error?.message ||
                t('Unable to delete comment.')
            );
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleClose = () => {
        if (
            commentLoading ||
            deleteLoading
        ) {
            return;
        }

        setCommentError('');
        setDeleteError('');
        setDeleteCommentId(null);

        onClose();
    };

    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="sm"
                aria-labelledby="community-comments-title"
            >
                <DialogTitle
                    id="community-comments-title"
                >
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

                        {post.comments?.length > 0 ? (
                            post.comments.map(item => (
                                <CommentItem
                                    key={item._id}
                                    comment={item}
                                    canDelete={canDeleteComment(
                                        item
                                    )}
                                    onDelete={handleRequestDelete}
                                />
                            ))
                        ) : (
                            <Typography
                                color="text.secondary"
                            >
                                {t('No comments yet.')}
                            </Typography>
                        )}

                        <TextField
                            multiline
                            minRows={3}
                            fullWidth
                            label={t('Write a comment')}
                            value={comment}
                            onChange={event =>
                                setComment(
                                    event.target.value
                                )
                            }
                            disabled={commentLoading}
                        />
                    </Stack>
                </DialogContent>

                <DialogActions
                    sx={{
                        px: 2,
                        pb: 2,
                        gap: 1,
                    }}
                >
                    <Button
                        onClick={handleClose}
                        disabled={
                            commentLoading ||
                            deleteLoading
                        }
                        color="inherit"
                    >
                        {t('Close')}
                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleSubmit}
                        disabled={
                            commentLoading ||
                            !comment.trim()
                        }
                        startIcon={
                            commentLoading
                                ? (
                                    <CircularProgress
                                        size={18}
                                        color="inherit"
                                    />
                                )
                                : null
                        }
                    >
                        {commentLoading
                            ? t('Posting...')
                            : t('Comment')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete comment confirmation */}
            <Dialog
                open={Boolean(deleteCommentId)}
                onClose={handleCloseDelete}
                fullWidth
                maxWidth="xs"
                aria-labelledby="delete-community-comment-title"
                aria-describedby="delete-community-comment-description"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        m: 2,
                        width: 'calc(100% - 32px)',
                    },
                }}
            >
                <DialogTitle
                    id="delete-community-comment-title"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        pb: 1,
                    }}
                >
                    <DeleteOutlineIcon color="error" />

                    {t('Delete Comment?')}
                </DialogTitle>

                <DialogContent>
                    <DialogContentText
                        id="delete-community-comment-description"
                    >
                        {t(
                            'Are you sure you want to delete this comment? This action cannot be undone.'
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
                        variant="contained"
                        color="error"
                        onClick={handleConfirmDelete}
                        disabled={deleteLoading}
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
                            : t('Delete Comment')}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default CommentDialog;