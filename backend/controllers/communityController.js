const CommunityPost = require('../models/CommunityPost');

// Create Community Post
exports.createCommunityPost = async (req, res) => {
    try {
        const { title, content, category } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({
                success: false,
                message: 'Title, content and category are required.',
            });
        }

        const post = await CommunityPost.create({
            title,
            content,
            category,
            user: req.user._id,
        });

        console.log(`✅ Community post created: ${post.title}`);

        return res.status(201).json({
            success: true,
            message: 'Community post created successfully.',
            data: post,
        });

    } catch (error) {
        console.error('❌ Community Create Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while creating community post.',
        });
    }
};

// Get Community Posts
exports.getCommunityPosts = async (req, res) => {
    try {
        const posts = await CommunityPost.find()
            .populate('user', 'name')
            .populate('comments.user', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: posts.length,
            data: posts,
        });

    } catch (error) {
        console.error('❌ Community Fetch Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching community posts.',
        });
    }
};