const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    createCommunityPost,
    getCommunityPosts,
    getFeaturedPosts,
    archiveCommunityPost,
    addComment,
    deleteComment,
    toggleLike,
} = require('../controllers/communityController');

const {
    createCommunityValidator,
} = require('../validators');

/*
|--------------------------------------------------------------------------
| Public / Authenticated Read Routes
|--------------------------------------------------------------------------
*/

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

/*
|--------------------------------------------------------------------------
| Community Posts
|--------------------------------------------------------------------------
*/

router.post(
    '/',
    ensureAuthenticated,
    createCommunityValidator,
    validateRequest,
    createCommunityPost
);

router.delete(
    '/:id',
    ensureAuthenticated,
    archiveCommunityPost
);

/*
|--------------------------------------------------------------------------
| Comments
|--------------------------------------------------------------------------
*/

/**
 * Add comment to a post
 */
router.post(
    '/:id/comments',
    ensureAuthenticated,
    addComment
);

/**
 * Delete comment
 */
router.delete(
    '/:postId/comments/:commentId',
    ensureAuthenticated,
    deleteComment
);

/*
|--------------------------------------------------------------------------
| Like / Unlike
|--------------------------------------------------------------------------
*/
router.post(
    '/:id/like',
    ensureAuthenticated,
    toggleLike
);

module.exports = router;