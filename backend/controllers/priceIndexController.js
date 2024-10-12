const PriceIndex = require('../models/PriceIndex');

// create a new price entry
exports.createPriceIndex = async (req, res) => {
    const { product, price, location } = req.body;

    try {
        const newPriceIndex = new PriceIndex({
            product,
            price,
            location,
        });

        await newPriceIndex.save();
        res.status(201).json(newPriceIndex);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// get all price entries for a product
exports.getPriceIndexes = async (req, res) => {
    const { product } = req.query;

    try {
        const prices = await PriceIndex.find({ product });
        res.status(200).json(prices);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};