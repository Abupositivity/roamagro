const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    createCommunityPost,
    getCommunityPosts,
    getFeaturedPosts,
    updateCommunityPost,
    archiveCommunityPost,
    shareCommunityPost,
    addComment,
    deleteComment,
    toggleLike,
} = require('../controllers/communityController');

const {
    createCommunityValidator,
    updateCommunityValidator,
    commentCommunityValidator,
} = require('../validators');

router.get(
    '/',
    ensureAuthenticated,
    getCommunityPosts
);

router.get(
    '/featured',
    ensureAuthenticated,
    getFeaturedPosts
);

router.post(
    '/',
    ensureAuthenticated,
    createCommunityValidator,
    validateRequest,
    createCommunityPost
);

router.put(
    '/:id',
    ensureAuthenticated,
    updateCommunityValidator,
    validateRequest,
    updateCommunityPost
);

router.delete(
    '/:id',
    ensureAuthenticated,
    archiveCommunityPost
);

router.post(
    '/:id/share',
    ensureAuthenticated,
    shareCommunityPost
);

router.post(
    '/:id/comments',
    ensureAuthenticated,
    commentCommunityValidator,
    validateRequest,
    addComment
);

router.delete(
    '/:postId/comments/:commentId',
    ensureAuthenticated,
    deleteComment
);

router.post(
    '/:id/like',
    ensureAuthenticated,
    toggleLike
);

module.exports = router;