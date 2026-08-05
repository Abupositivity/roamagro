import React, { useState } from 'react';

import {
    Avatar,
    Box,
    Card,
    CardContent,
    CardMedia,
    Chip,
    Divider,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ShareIcon from '@mui/icons-material/Share';

import { useDispatch, useSelector } from 'react-redux';

import {
    addComment,
    deleteComment,
    likePost,
} from '../../redux/actions/communityActions';

import CommentDialog from './CommentDialog';

const AgriPostCard = ({ post }) => {

    const dispatch = useDispatch();

    const currentUser = useSelector(
        state => state.auth?.user
    );

    const [openComments, setOpenComments] =
        useState(false);

    const liked = post.likes?.some(
        like =>
            like === currentUser?._id ||
            like?._id === currentUser?._id
    );

    const handleLike = () => {
        dispatch(
            likePost(post._id)
        );
    };


    const handleAddComment = (content) => {
        dispatch(
            addComment(
                post._id,
                content
            )
        );
    };

    const handleDeleteComment = (commentId) => {
        dispatch(
            deleteComment(
                post._id,
                commentId
            )
        );
    };

    return (
        <>
            <Card
                elevation={2}
                sx={{
                    borderRadius: 3,
                }}
            >
                <CardContent>
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                    >
                        <Avatar
                            src={post.user?.profilePhoto}
                        >
                            {post.user?.name?.charAt(0)}
                        </Avatar>
                        <Box flex={1}>
                            <Typography
                                fontWeight={700}
                            >
                                {post.user?.name || 'Farmer'}
                            </Typography>
                            <Typography
                                variant="caption"
                                color="text.secondary"
                            >
                                {new Date(
                                    post.createdAt
                                ).toLocaleDateString()}
                            </Typography>
                        </Box>
                        <Chip
                            label={post.category}
                            color="success"
                            size="small"
                        />
                    </Stack>
                    <Typography
                        variant="h6"
                        mt={2}
                    >
                        {post.title}
                    </Typography>
                    <Typography
                        mt={1}
                    >
                        {post.content}
                    </Typography>
                    {post.image && (
                        <CardMedia
                            component="img"
                            image={post.image}
                            sx={{
                                mt: 2,
                                borderRadius: 2,
                                maxHeight: 280,
                                objectFit: 'cover',
                            }}
                        />
                    )}
                    <Divider sx={{ my: 2 }} />
                    <Stack
                        direction="row"
                        spacing={4}
                        alignItems="center"
                    >
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <IconButton
                                color={
                                    liked
                                        ? 'error'
                                        : 'default'
                                }
                                onClick={handleLike}
                            >
                                {liked
                                    ? <FavoriteIcon />
                                    : <FavoriteBorderIcon />
                                }
                            </IconButton>

                            <Typography>
                                {post.likes?.length || 0}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <IconButton
                                size="small"
                                onClick={() =>
                                    setOpenComments(true)
                                }
                            >
                                <ChatBubbleOutlineIcon />
                            </IconButton>
                            <Typography>
                                {post.comments?.length || 0}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                        >
                            <ShareIcon
                                fontSize="small"
                            />
                            <Typography>
                                {post.shares || 0}
                            </Typography>
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>
            <CommentDialog
                open={openComments}
                onClose={() =>
                    setOpenComments(false)
                }
                post={post}
                onAddComment={handleAddComment}
                onDeleteComment={handleDeleteComment}
            />
        </>
    );
};

export default AgriPostCard;