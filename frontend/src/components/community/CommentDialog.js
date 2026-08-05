import React, { useState } from 'react';

import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import CommentItem from './CommentItem';

const CommentDialog = ({
    open,
    onClose,
    post,
    onAddComment,
    onDeleteComment,
}) => {

    const [comment, setComment] = useState('');

    const handleSubmit = () => {
        if (!comment.trim()) return;
        onAddComment(comment);
        setComment('');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle>
                Comments
            </DialogTitle>

            <DialogContent>
                <Stack spacing={2}>
                    {post.comments?.length > 0 ? (
                        post.comments.map((item) => (
                            <CommentItem
                                key={item._id}
                                comment={item}
                                canDelete={true}
                                onDelete={onDeleteComment}
                            />
                        ))
                    ) : (
                        <Typography
                            color="text.secondary"
                        >
                            No comments yet.
                        </Typography>
                    )}
                    <TextField
                        multiline
                        rows={3}
                        fullWidth
                        label="Write a comment"
                        value={comment}
                        onChange={(e) =>
                            setComment(e.target.value)
                        }
                    />
                </Stack>
            </DialogContent>

            <DialogActions>
                <Button
                    onClick={onClose}
                >
                    Close
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                >
                    Comment
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CommentDialog;