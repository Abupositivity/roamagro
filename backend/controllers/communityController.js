const CommunityPost = require('../models/CommunityPost');

// create a new community post
exports.createCommunityPost = async (req, res) => {
    const { title, content, category } = req.body;

    try {
        const newPost = new CommunityPost({
            title,
            content,
            category,
            user: req.userId,
        });

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// get all community posts
exports.getCommunityPosts = async (req, res) => {
    try {
        const posts = await CommunityPost.find().populate('user', 'name');
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};