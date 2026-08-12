const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

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
            min: 0,
        },
        status: {
            type: String,
            enum: ['Active', 'Archived'],
            default: 'Active',
            index: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
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
    }
);

CommunityPostSchema.index({
    user: 1,
    status: 1,
    createdAt: -1,
});

CommunityPostSchema.index({
    status: 1,
    category: 1,
    createdAt: -1,
});

module.exports =
    mongoose.model(
        'CommunityPost',
        CommunityPostSchema
    );