const PriceIndex = require('../models/PriceIndex');

const asyncHandler = require('../middleware/asyncHandler');

// Create Price Entry
exports.createPriceIndex = asyncHandler(async (req, res) => {

    const entry = await PriceIndex.create({
        ...req.body,
        user: req.user._id,
    });

    console.log(
        `✅ Price Submitted: ${entry.product} (${entry.location})`
    );

    res.status(201).json({
        success: true,
        message: 'Price submitted successfully.',
        data: entry,
    });

});

// Get Price Index
exports.getPriceIndexes = asyncHandler(async (req, res) => {

    const prices = await PriceIndex.find()
        .populate('user', 'name')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: prices.length,
        data: prices,
    });

});