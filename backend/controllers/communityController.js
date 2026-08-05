const CommunityPost = require('../models/CommunityPost');
const asyncHandler = require('../middleware/asyncHandler');

/*
|--------------------------------------------------------------------------
| Create Community Post
|--------------------------------------------------------------------------
*/
exports.createCommunityPost = asyncHandler(async (req, res) => {
    const post = await CommunityPost.create({
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
        image: req.body.image || '',
        user: req.user._id,
    });
    await post.populate('user', 'name profilePhoto');
    res.status(201).json({
        success: true,
        message: 'Community post created successfully.',
        data: post,
    });
});

/*
|--------------------------------------------------------------------------
| Get Community Posts
|--------------------------------------------------------------------------
*/
exports.getCommunityPosts = asyncHandler(async (req, res) => {
    const posts = await CommunityPost.find({
        status: 'Active',
    })
        .populate('user', 'name profilePhoto')
        .populate('comments.user', 'name profilePhoto')
        .sort({
            featured: -1,
            createdAt: -1,
        });
    res.status(200).json({
        success: true,
        count: posts.length,
        data: posts,
    });
});

/*
|--------------------------------------------------------------------------
| Featured Posts
|--------------------------------------------------------------------------
*/
exports.getFeaturedPosts = asyncHandler(async (req, res) => {
    const posts = await CommunityPost.find({
        featured: true,
        status: 'Active',
    })
        .populate('user', 'name profilePhoto')
        .limit(5);
    res.status(200).json({
        success: true,
        data: posts,
    });
});

/*
|--------------------------------------------------------------------------
| Add Comment
|--------------------------------------------------------------------------
*/

exports.addComment = asyncHandler(async (req, res) => {
    const post = await CommunityPost.findById(
        req.params.id
    );
    if (!post) {
        return res.status(404).json({
            success: false,
            message: 'Community post not found.',
        });
    }

    post.comments.push({
        user: req.user._id,
        content: req.body.content,
    });

    await post.save();
    await post.populate('comments.user', 'name profilePhoto');
    res.status(200).json({
        success: true,
        message: 'Comment added successfully.',
        data: post,
    });
});

/*
|--------------------------------------------------------------------------
| Delete Comment
|--------------------------------------------------------------------------
*/
exports.deleteComment = asyncHandler(async (req, res) => {
    const post = await CommunityPost.findById(
        req.params.postId
    );

    if (!post) {
        return res.status(404).json({
            success: false,
            message: 'Community post not found.',
        });
    }

    post.comments = post.comments.filter(
        comment =>
            comment._id.toString() !== req.params.commentId
    );
    await post.save();
    res.status(200).json({
        success: true,
        message: 'Comment deleted.',
        data: post,
    });
});

/*
|--------------------------------------------------------------------------
| Archive Post
|--------------------------------------------------------------------------
*/
exports.archiveCommunityPost = asyncHandler(async (req, res) => {
    const post = await CommunityPost.findById(
        req.params.id
    );
    if (!post) {
        return res.status(404).json({
            success: false,
            message: 'Community post not found.',
        });
    }
    post.status = 'Archived';
    await post.save();
    res.status(200).json({
        success: true,
        message: 'Community post archived.',
    });
});

/*
|--------------------------------------------------------------------------
| Toggle Like
|--------------------------------------------------------------------------
*/
exports.toggleLike = asyncHandler(async (req, res) => {
    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
        return res.status(404).json({
            success:false,
            message:'Post not found.'
        });
    }
    const alreadyLiked = post.likes.some(
        id => id.toString() === req.user._id.toString()
    );
    if (alreadyLiked) {
        post.likes = post.likes.filter(
            id => id.toString() !== req.user._id.toString()
        );
    } else {
        post.likes.push(req.user._id);
    }
    await post.save();
    res.json({
        success:true,
        data:post
    });
});