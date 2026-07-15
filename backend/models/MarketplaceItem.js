const mongoose = require('mongoose');

const MarketplaceItemSchema = new mongoose.Schema(
{
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    quantity: {
        type: Number,
        default: 1
    },

    unit: {
        type: String,
        default: 'Bag'
    },

    location: {
        type: String,
        default: ''
    },

    images: [{
        type: String
    }],

    available: {
        type: Boolean,
        default: true
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }

},
{
    timestamps: true
});

module.exports = mongoose.model('MarketplaceItem', MarketplaceItemSchema);