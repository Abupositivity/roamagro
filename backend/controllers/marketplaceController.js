const MarketplaceItem = require('../models/MarketplaceItem');
const asyncHandler = require('../middleware/asyncHandler');

// Create Marketplace Listing
exports.createMarketplaceItem = asyncHandler(async (req, res) => {

    const item = await MarketplaceItem.create({
        ...req.body,
        user: req.user._id,
    });

    console.log(`✅ Marketplace Listing Created: ${item.title}`);

    res.status(201).json({
        success: true,
        message: 'Marketplace listing created successfully.',
        data: item,
    });

});

// Get Marketplace Listings
exports.getMarketplaceItems = asyncHandler(async (req, res) => {

    const items = await MarketplaceItem.find()
        .populate('user', 'name profilePhoto')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: items.length,
        data: items,
    });

});