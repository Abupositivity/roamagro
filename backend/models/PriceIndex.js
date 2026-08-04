const mongoose = require('mongoose');

const PriceIndexSchema = new mongoose.Schema(
{
    product: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    category: {
        type: String,
        default: ''
    },

    price: {
        type: Number,
        required: true
    },

    unit: {
        type: String,
        default: 'Bag'
    },

    location: {
        type: String,
        required: true
    },

    market: {
        type: String,
        default: ''
    },

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    source: {
        type: String,
        default: 'Farmer'
    }

},
{
    timestamps: true
});

module.exports = mongoose.model('PriceIndex', PriceIndexSchema);