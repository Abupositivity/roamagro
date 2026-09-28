const User = require('../models/User');
const FarmProject = require('../models/FarmProject');
const MarketplaceItem = require('../models/MarketplaceItem');
const PriceIndex = require('../models/PriceIndex');
const CommunityPost = require('../models/CommunityPost');
const AgriTip = require('../models/AgriTip');

const buildBaseDashboard = async userId => {
    const [
        projects,
        marketplace,
        prices,
        feed,
        communityCount,
        totalProjects,
        marketplaceListings,
    ] = await Promise.all([
        FarmProject.find({
            user: userId,
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean(),

        MarketplaceItem.find({
            available: true,
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name profilePhoto')
            .lean(),

        PriceIndex.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(),

        AgriTip.find({
            status: 'Published',
        })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('createdBy', 'name profilePhoto')
            .lean(),

        CommunityPost.countDocuments(),

        FarmProject.countDocuments({
            user: userId,
        }),

        MarketplaceItem.countDocuments({
            user: userId,
        }),
    ]);

    return {
        summary: {
            totalProjects,
            marketplaceListings,
            communityPosts:
                communityCount,
            latestPrices:
                prices.length,
        },
        recentProjects: projects,
        marketplace,
        priceSummary: prices,
        feed,
        notifications: [],
        weather: null,
    };
};

const buildExtensionDashboard =
    async () => {
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
                .populate(
                    'user',
                    'name profilePhoto location state lga'
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),

            CommunityPost.find()
                .populate(
                    'user',
                    'name profilePhoto'
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),

            AgriTip.find()
                .populate(
                    'createdBy',
                    'name profilePhoto'
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),
        ]);

        return {
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
        };
    };

const buildAdminDashboard =
    async () => {
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
                .select(
                    'name email role profilePhoto createdAt'
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),

            AgriTip.find()
                .populate(
                    'createdBy',
                    'name profilePhoto'
                )
                .sort({
                    createdAt: -1,
                })
                .limit(5)
                .lean(),
        ]);

        return {
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
        };
    };

exports.getDashboard =
    async (req, res, next) => {
        try {
            const dashboard =
                await buildBaseDashboard(
                    req.user._id
                );

            res.status(200).json({
                success: true,
                message:
                    'Dashboard loaded successfully.',
                data: dashboard,
            });
        } catch (error) {
            next(error);
        }
    };

exports.getExtensionDashboard =
    async (req, res, next) => {
        try {
            const [
                base,
                extension,
            ] = await Promise.all([
                buildBaseDashboard(
                    req.user._id
                ),
                buildExtensionDashboard(),
            ]);

            res.status(200).json({
                success: true,
                message:
                    'Extension officer dashboard loaded successfully.',
                data: {
                    ...base,
                    extension,
                },
            });
        } catch (error) {
            next(error);
        }
    };

exports.getAdminDashboard =
    async (req, res, next) => {
        try {
            const [
                base,
                extension,
                admin,
            ] = await Promise.all([
                buildBaseDashboard(
                    req.user._id
                ),
                buildExtensionDashboard(),
                buildAdminDashboard(),
            ]);

            res.status(200).json({
                success: true,
                message:
                    'Admin dashboard loaded successfully.',
                data: {
                    ...base,
                    extension,
                    admin,
                },
            });
        } catch (error) {
            next(error);
        }
    };