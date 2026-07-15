const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    content: {
        type: String,
        required: true
    }

},
{
    timestamps: true
});

const CommunityPostSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true
    },

    content: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    comments: [CommentSchema],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]

},
{
    timestamps: true
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);