const mongoose = require('mongoose');

const PriceIndexSchema = new mongoose.Schema(
    {
        product: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },

        category: {
            type: String,
            default: '',
            trim: true,
        },

        price: {
            type: Number,
            required: true,
            min: 1,
        },

        unit: {
            type: String,
            default: 'Bag',
            trim: true,
        },

        location: {
            type: String,
            required: true,
            trim: true,
        },

        market: {
            type: String,
            required: true,
            trim: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        source: {
            type: String,
            default: 'Farmer',
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports =
    mongoose.model(
        'PriceIndex',
        PriceIndexSchema
    );