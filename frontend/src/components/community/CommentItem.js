import React from 'react';

import {
    Avatar,
    Box,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import { useTranslation } from 'react-i18next';

import {
    getAvatarImage,
} from '../../utils/cloudinaryImage';

const COMMENT_AVATAR_SIZE = 120;

const CommentItem = ({
    comment,
    canDelete = false,
    onDelete,
}) => {
    const { t } = useTranslation();

    const authorName =
        comment.user?.name ||
        t('Farmer');

    const profilePhoto = getAvatarImage(
        comment.user?.profilePhoto,
        COMMENT_AVATAR_SIZE
    );

    const createdAt = comment.createdAt
        ? new Date(comment.createdAt)
        : null;

    const formattedDate =
        createdAt &&
        !Number.isNaN(createdAt.getTime())
            ? createdAt.toLocaleString()
            : '';

    const handleDelete = () => {
        if (
            !canDelete ||
            !comment._id ||
            typeof onDelete !== 'function'
        ) {
            return;
        }

        // Confirmation is handled by CommentDialog.
        onDelete(comment._id);
    };

    return (
        <Stack
            direction="row"
            spacing={1.5}
            alignItems="flex-start"
            sx={{
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
                minWidth: 0,
            }}
        >
            <Avatar
                src={profilePhoto || undefined}
                alt={authorName}
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
                    flexShrink: 0,
                    fontWeight: 600,
                }}
            >
                {authorName
                    .trim()
                    .charAt(0)
                    .toUpperCase() || 'F'}
            </Avatar>

            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                }}
            >
                <Typography
                    fontWeight={600}
                    variant="body2"
                    sx={{
                        wordBreak: 'break-word',
                    }}
                >
                    {authorName}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.5,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'anywhere',
                        lineHeight: 1.6,
                    }}
                >
                    {comment.content}
                </Typography>

                {formattedDate && (
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: 'block',
                            mt: 0.75,
                        }}
                    >
                        {formattedDate}
                    </Typography>
                )}
            </Box>

            {canDelete && (
                <IconButton
                    color="error"
                    size="small"
                    onClick={handleDelete}
                    disabled={
                        !comment._id ||
                        typeof onDelete !== 'function'
                    }
                    aria-label={t('Delete comment')}
                    title={t('Delete comment')}
                    sx={{
                        flexShrink: 0,
                        width: 40,
                        height: 40,
                    }}
                >
                    <DeleteOutlineIcon
                        fontSize="small"
                    />
                </IconButton>
            )}
        </Stack>
    );
};

export default CommentItem;