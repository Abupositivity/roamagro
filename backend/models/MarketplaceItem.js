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
        imagePublicIds: {
            type: [String],
            default: [],
        },
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

// Default chronological marketplace retrieval.
MarketplaceItemSchema.index({
    createdAt: -1,
    _id: -1,
});

// Personal listings retrieval.
MarketplaceItemSchema.index({
    user: 1,
    createdAt: -1,
    _id: -1,
});

// Category filtering and chronological sorting.
MarketplaceItemSchema.index({
    category: 1,
    createdAt: -1,
    _id: -1,
});

// Combined availability and category filtering
// with deterministic chronological sorting.
MarketplaceItemSchema.index({
    available: 1,
    category: 1,
    createdAt: -1,
    _id: -1,
});

module.exports = mongoose.model(
    'MarketplaceItem',
    MarketplaceItemSchema
);