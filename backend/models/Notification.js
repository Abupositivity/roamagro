const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
{
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },

    type: {
        type: String,
        enum: [
            'like',
            'comment',
            'follow',
            'marketplace',
            'price_alert',
            'farm',
            'system'
        ],
        default: 'system',
        index: true
    },

    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },

    message: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },

    link: {
        type: String,
        default: ''
    },

    read: {
        type: Boolean,
        default: false,
        index: true
    }
},
{
    timestamps: true
});

NotificationSchema.index({
    recipient: 1,
    createdAt: -1
});

module.exports = mongoose.model(
    'Notification',
    NotificationSchema
);