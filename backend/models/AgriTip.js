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

const AgriTipSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        content: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            index: true,
        },
        language: {
            type: String,
            enum: ['English', 'Hausa'],
            default: 'English',
            index: true,
        },
        region: {
            type: String,
            default: 'Nigeria',
            index: true,
        },
        image: {
            type: String,
            default: '',
        },
        source: {
            type: String,
            default: '',
        },
        priority: {
            type: String,
            enum: ['Normal', 'Important', 'Urgent'],
            default: 'Normal',
        },
        status: {
            type: String,
            enum: ['Draft', 'Published', 'Archived'],
            default: 'Published',
            index: true,
        },
        views: {
            type: Number,
            default: 0,
        },
        shares: {
            type: Number,
            default: 0,
            min: 0,
        },
        sharedBy: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        likes: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        bookmarks: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        comments: [CommentSchema],
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

AgriTipSchema.index({
    status: 1,
    category: 1,
    createdAt: -1,
});

AgriTipSchema.index({
    sharedBy: 1,
});

module.exports = mongoose.model('AgriTip', AgriTipSchema);