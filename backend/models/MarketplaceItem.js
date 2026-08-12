const mongoose = require('mongoose');

const MarketplaceItemSchema =
    new mongoose.Schema(
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

module.exports =
    mongoose.model(
        'MarketplaceItem',
        MarketplaceItemSchema
    );