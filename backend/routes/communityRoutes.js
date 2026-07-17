const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const {
    createCommunityPost,
    getCommunityPosts,
} = require('../controllers/communityController');

router.post('/', ensureAuthenticated, createCommunityPost);

router.get('/', ensureAuthenticated, getCommunityPosts);

module.exports = router;