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

        console.log(`✅ Price submitted: ${product}`);

        res.status(201).json({
            success: true,
            message: 'Price submitted successfully.',
            entry,
        });

    } catch (error) {

        console.error('Price Index Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error.',
        });

    }

};

// Get Price Entries
exports.getPriceIndexes = async (req, res) => {

    try {

        const prices = await PriceIndex.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: prices.length,
            prices,
        });

    } catch (error) {

        console.error('Fetch Price Index Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error.',
        });

    }

};