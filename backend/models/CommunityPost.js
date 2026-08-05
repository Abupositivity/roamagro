const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
{
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    content: {
        type: String,
        required: true,
        trim: true,
    },

},
{
    timestamps: true,
});

const CommunityPostSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true,
    },

    content: {
        type: String,
        required: true,
        trim: true,
    },

    category: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },

    image: {
        type: String,
        default: '',
    },

    featured: {
        type: Boolean,
        default: false,
    },

    shares: {
        type: Number,
        default: 0,
    },

    status: {
        type: String,
        enum: ['Active', 'Archived'],
        default: 'Active',
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },

    comments: [CommentSchema],

    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    ],

},
{
    timestamps: true,
});

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);