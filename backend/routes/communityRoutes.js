const express = require('express');
const { createCommunityPost, getCommunityPosts } = require('../controllers/communityController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// routes for community post
router.post('/', createCommunityPost);
router.get('/', getCommunityPosts);

module.exports = router;