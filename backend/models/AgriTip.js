const mongoose = require('mongoose');

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
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    bookmarks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
},
{
    timestamps: true,
});

module.exports = mongoose.model('AgriTip', AgriTipSchema);