const FarmProject = require('../models/FarmProject');
const MarketplaceItem = require('../models/MarketplaceItem');
const PriceIndex = require('../models/PriceIndex');
const CommunityPost = require('../models/CommunityPost');
const AgriTip = require('../models/AgriTip');

exports.getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const [
            projects,
            marketplace,
            prices,
            feed,
            communityCount,
        ] = await Promise.all([
            FarmProject.find({ user: userId })
                .sort({ createdAt: -1 })
                .limit(5),
            MarketplaceItem.find({ available: true })
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('user', 'name'),
            PriceIndex.find()
                .sort({ createdAt: -1 })
                .limit(10),
            AgriTip.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .populate('createdBy', 'name'),
            CommunityPost.countDocuments(),
        ]);
        const dashboard = {
            summary: {
                totalProjects: await FarmProject.countDocuments({
                    user: userId,
                }),
                marketplaceListings: await MarketplaceItem.countDocuments({
                    user: userId,
                }),
                communityPosts: communityCount,
                latestPrices: prices.length,
            },
            recentProjects: projects,
            marketplace,
            priceSummary: prices,
            feed,
            notifications: [],
            weather: null,
        };
        res.status(200).json({
            success: true,
            message: 'Dashboard loaded successfully.',
            data: dashboard,
        });
    } catch (error) {
        next(error);
    }
};