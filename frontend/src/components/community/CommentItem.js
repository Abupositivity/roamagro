import React from 'react';

import {
    Avatar,
    Box,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

import {
    getAvatarImage
} from '../../utils/cloudinaryImage';

const COMMENT_AVATAR_SIZE = 120;

const CommentItem = ({
    comment,
    canDelete = false,
    onDelete,
}) => {
    const authorName =
        comment.user?.name ||
        'Farmer';

    const profilePhoto = getAvatarImage(
        comment.user?.profilePhoto,
        COMMENT_AVATAR_SIZE
    );

    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                py: 2,
                borderBottom: '1px solid',
                borderColor: 'divider',
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
                }}
            >
                {authorName.charAt(0).toUpperCase()}
            </Avatar>

            <Box flex={1}>
                <Typography fontWeight={600}>
                    {authorName}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        mt: 0.5,
                    }}
                >
                    {comment.content}
                </Typography>

                <Typography
                    variant="caption"
                    color="text.secondary"
                >
                    {new Date(
                        comment.createdAt
                    ).toLocaleString()}
                </Typography>
            </Box>

            {canDelete && (
                <IconButton
                    color="error"
                    size="small"
                    onClick={() =>
                        onDelete(
                            comment._id
                        )
                    }
                    aria-label="Delete comment"
                >
                    <DeleteOutlineIcon />
                </IconButton>
            )}
        </Stack>
    );
};

export default CommentItem;