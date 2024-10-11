const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    category: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    comments: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, content: String }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);