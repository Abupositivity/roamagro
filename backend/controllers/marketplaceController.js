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

        console.log(`✅ Marketplace listing created: ${item.title}`);

        res.status(201).json({
            success: true,
            message: 'Marketplace item created successfully.',
            item,
        });

    } catch (error) {

        console.error('Marketplace Create Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error.',
        });

    }

};

// Get Marketplace Items
exports.getMarketplaceItems = async (req, res) => {

    try {

        const items = await MarketplaceItem.find()
            .populate('user', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: items.length,
            items,
        });

    } catch (error) {

        console.error('Marketplace Fetch Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error.',
        });

    }

};