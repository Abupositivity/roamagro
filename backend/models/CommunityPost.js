const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        content: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000
        }
    },
    {
        timestamps: true
    }
);

const CommunityPostSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200
        },
        content: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 5000
        },
        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
            index: true
        },
        image: {
            type: String,
            default: '',
            maxlength: 3000000
        },
        featured: {
            type: Boolean,
            default: false
        },
        shares: {
            type: Number,
            default: 0,
            min: 0
        },
        sharedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ],
        status: {
            type: String,
            enum: ['Active', 'Archived'],
            default: 'Active',
            index: true
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        agriTip: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'AgriTip',
            default: null,
            index: true
        },
        comments: [CommentSchema],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        ]
    },
    {
        timestamps: true
    }
);

CommunityPostSchema.index({
    user: 1,
    status: 1,
    createdAt: -1
});

CommunityPostSchema.index({
    status: 1,
    category: 1,
    createdAt: -1
});

CommunityPostSchema.index({
    agriTip: 1,
    user: 1
});

module.exports = mongoose.model(
    'CommunityPost',
    CommunityPostSchema
);