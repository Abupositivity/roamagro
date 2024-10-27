const express = require('express');
const { createCommunityPost, getCommunityPosts } = require('../controllers/communityController');
const router = express.Router();

// routes for community post
router.post('/', createCommunityPost);
router.get('/', getCommunityPosts);

module.exports = router;