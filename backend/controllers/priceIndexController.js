const PriceIndex = require('../models/PriceIndex');

// Create Price Entry
exports.createPriceIndex = async (req, res) => {
    try {

        const {
            product,
            price,
            location,
        } = req.body;

        if (!product || !price || !location) {
            return res.status(400).json({
                success: false,
                message: 'Product, price and location are required.',
            });
        }

        const entry = await PriceIndex.create({
            product,
            price,
            location,
            user: req.user._id,
        });

        console.log(`✅ Price submitted: ${entry.product}`);

        return res.status(201).json({
            success: true,
            message: 'Price submitted successfully.',
            data: entry,
        });

    } catch (error) {

        console.error('❌ Price Index Create Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while submitting price.',
        });
    }
};

// Get Price Entries
exports.getPriceIndexes = async (req, res) => {
    try {

        const prices = await PriceIndex.find()
            .populate('submittedBy', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: prices.length,
            data: prices,
        });

    } catch (error) {

        console.error('❌ Price Index Fetch Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching price index.',
        });
    }
};