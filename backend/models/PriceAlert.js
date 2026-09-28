const mongoose = require('mongoose');

const PriceAlertSchema = new mongoose.Schema(
    {
        product: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        location: {
            type: String,
            default: '',
            trim: true,
            maxlength: 100,
        },

        targetPrice: {
            type: Number,
            required: true,
            min: 1,
        },

        alertType: {
            type: String,
            enum: [
                'Above',
                'Below',
            ],
            default: 'Above',
        },

        active: {
            type: Boolean,
            default: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

PriceAlertSchema.index({
    user: 1,
    createdAt: -1,
});

PriceAlertSchema.index({
    user: 1,
    product: 1,
    location: 1,
    targetPrice: 1,
    alertType: 1,
    active: 1,
});

module.exports = mongoose.model(
    'PriceAlert',
    PriceAlertSchema
);