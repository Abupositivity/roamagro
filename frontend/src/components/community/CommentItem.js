import React from 'react';

import {
    Avatar,
    Box,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const CommentItem = ({
    comment,
    canDelete = false,
    onDelete,
}) => {
    return (
        <Stack
            direction="row"
            spacing={2}
            sx={{
                py: 2,
                borderBottom:
                    '1px solid',
                borderColor:
                    'divider',
            }}
        >
            <Avatar
                src={
                    comment.user
                        ?.profilePhoto
                }
            >
                {comment.user?.name?.charAt(
                    0
                )}
            </Avatar>

            <Box flex={1}>
                <Typography fontWeight={600}>
                    {comment.user
                        ?.name ||
                        'Farmer'}
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