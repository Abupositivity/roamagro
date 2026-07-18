const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    createCommunityPost,
    getCommunityPosts,
} = require('../controllers/communityController');

const {
    createCommunityValidator,
} = require('../validators');

router.post(
    '/',
    ensureAuthenticated,
    createCommunityValidator,
    validateRequest,
    createCommunityPost
);

router.get(
    '/',
    ensureAuthenticated,
    getCommunityPosts
);

module.exports = router;