const User = require('../models/User');
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

            AgriTip.find({
                status: 'Published',
            })
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

exports.getAdminDashboard = async (req, res, next) => {
    try {
        const [
            totalUsers,
            farmers,
            buyers,
            extensionOfficers,
            totalProjects,
            activeProjects,
            totalListings,
            communityPosts,
            publishedTips,
            latestUsers,
            latestTips,
        ] = await Promise.all([
            User.countDocuments(),

            User.countDocuments({
                role: 'farmer',
            }),

            User.countDocuments({
                role: 'buyer',
            }),

            User.countDocuments({
                role: 'extension_officer',
            }),

            FarmProject.countDocuments(),

            FarmProject.countDocuments({
                status: 'Active',
            }),

            MarketplaceItem.countDocuments(),

            CommunityPost.countDocuments(),

            AgriTip.countDocuments({
                status: 'Published',
            }),

            User.find()
                .select('name email role profilePhoto createdAt')
                .sort({ createdAt: -1 })
                .limit(5),

            AgriTip.find()
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        res.status(200).json({
            success: true,
            message: 'Admin dashboard loaded successfully.',
            data: {
                summary: {
                    totalUsers,
                    farmers,
                    buyers,
                    extensionOfficers,
                    totalProjects,
                    activeProjects,
                    totalListings,
                    communityPosts,
                    publishedTips,
                },
                latestUsers,
                latestTips,
                notifications: [],
                weather: null,
            },
        });
    } catch (error) {
        next(error);
    }
};

exports.getExtensionDashboard = async (req, res, next) => {
    try {
        const [
            totalFarmers,
            totalProjects,
            activeProjects,
            communityPosts,
            publishedTips,
            recentProjects,
            recentPosts,
            recentTips,
        ] = await Promise.all([
            User.countDocuments({
                role: 'farmer',
            }),

            FarmProject.countDocuments(),

            FarmProject.countDocuments({
                status: 'Active',
            }),

            CommunityPost.countDocuments(),

            AgriTip.countDocuments({
                status: 'Published',
            }),

            FarmProject.find()
                .populate('user', 'name profilePhoto location state lga')
                .sort({ createdAt: -1 })
                .limit(5),

            CommunityPost.find()
                .populate('user', 'name profilePhoto')
                .sort({ createdAt: -1 })
                .limit(5),

            AgriTip.find()
                .populate('createdBy', 'name')
                .sort({ createdAt: -1 })
                .limit(5),
        ]);

        res.status(200).json({
            success: true,
            message: 'Extension officer dashboard loaded successfully.',
            data: {
                summary: {
                    totalFarmers,
                    totalProjects,
                    activeProjects,
                    communityPosts,
                    publishedTips,
                },
                recentProjects,
                recentPosts,
                recentTips,
                notifications: [],
                weather: null,
            },
        });
    } catch (error) {
        next(error);
    }
};