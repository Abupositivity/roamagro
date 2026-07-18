const MarketplaceItem = require('../models/MarketplaceItem');

// Create Marketplace Item
exports.createMarketplaceItem = async (req, res) => {
    try {

        const {
            title,
            description,
            category,
            price,
            location,
        } = req.body;

        if (!title || !category || !price) {
            return res.status(400).json({
                success: false,
                message: 'Title, category and price are required.',
            });
        }

        const item = await MarketplaceItem.create({
            title,
            description,
            category,
            price,
            location,
            user: req.user._id,
        });

        console.log(`✅ Marketplace item created: ${item.title}`);

        return res.status(201).json({
            success: true,
            message: 'Marketplace item created successfully.',
            data: item,
        });

    } catch (error) {

        console.error('❌ Marketplace Create Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while creating marketplace item.',
        });
    }
};

// Get Marketplace Items
exports.getMarketplaceItems = async (req, res) => {
    try {

        const items = await MarketplaceItem.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: items.length,
            data: items,
        });

    } catch (error) {

        console.error('❌ Marketplace Fetch Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching marketplace items.',
        });
    }
};