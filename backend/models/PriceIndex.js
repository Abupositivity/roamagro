const mongoose = require('mongoose');

const PriceIndexSchema = new mongoose.Schema({
    product: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    date: { type: Date, default: Date.now },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

module.exports = mongoose.model('PriceIndex', PriceIndexSchema);