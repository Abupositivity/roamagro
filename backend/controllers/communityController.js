const CommunityPost = require('../models/CommunityPost');
const asyncHandler = require('../middleware/asyncHandler');

// Create Community Post
exports.createCommunityPost = asyncHandler(async (req, res) => {

    const post = await CommunityPost.create({
        ...req.body,
        user: req.user._id,
    });

    console.log(`✅ Community Post Created: ${post.title}`);

    res.status(201).json({
        success: true,
        message: 'Community post created successfully.',
        data: post,
    });

});

// Get Community Posts
exports.getCommunityPosts = asyncHandler(async (req, res) => {

    const posts = await CommunityPost.find()
        .populate('user', 'name profilePhoto')
        .populate('comments.user', 'name profilePhoto')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: posts.length,
        data: posts,
    });

});