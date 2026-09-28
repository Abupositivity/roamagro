
const mongoose = require('mongoose');

const MarketplaceItemSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 1,
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1,
        },
        unit: {
            type: String,
            default: 'Bag(s)',
            trim: true,
        },
        location: {
            type: String,
            default: '',
            trim: true,
        },
        coordinates: {
            latitude: {
                type: Number,
                min: -90,
                max: 90,
            },
            longitude: {
                type: Number,
                min: -180,
                max: 180,
            },
        },
        images: [
            {
                type: String,
            },
        ],
        available: {
            type: Boolean,
            default: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

MarketplaceItemSchema.index({
    available: 1,
    category: 1,
    createdAt: -1,
});

module.exports = mongoose.model(
    'MarketplaceItem',
    MarketplaceItemSchema
);