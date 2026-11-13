const User = require('../models/User');
const FarmProject = require('../models/FarmProject');
const MarketplaceItem = require('../models/MarketplaceItem');

const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const {
    getEntitlements,
    getPlanPricing,
} = require('../services/entitlementService');


exports.getMySubscription = asyncHandler(
    async (req, res) => {
        const user = await User.findById(
            req.user._id
        ).select('subscription accountStatus');

        if (!user) {
            throw new AppError(
                'User account not found.',
                404
            );
        }

        if (user.accountStatus !== 'active') {
            throw new AppError(
                'Your account is not active.',
                403
            );
        }

        const entitlements = getEntitlements(user);

        const [
            farmProjectsUsed,
            marketplaceListingsUsed,
        ] = await Promise.all([
            FarmProject.countDocuments({
                user: user._id,
            }),

            MarketplaceItem.countDocuments({
                user: user._id,
            }),
        ]);

        const farmProjectsLimit =
            entitlements.limits.farmProjects;

        const marketplaceListingsLimit =
            entitlements.limits.marketplaceListings;

        const getRemaining = (used, limit) => {
            if (limit === null) {
                return null;
            }

            return Math.max(0, limit - used);
        };

        res.status(200).json({
            success: true,
            data: {
                plan: entitlements.plan,
                isPremium: entitlements.isPremium,

                subscription: entitlements.subscription,

                features: entitlements.features,

                usage: {
                    farmProjects: {
                        used: farmProjectsUsed,
                        limit: farmProjectsLimit,
                        remaining: getRemaining(
                            farmProjectsUsed,
                            farmProjectsLimit
                        ),
                        canCreate:
                            farmProjectsLimit === null ||
                            farmProjectsUsed <
                                farmProjectsLimit,
                    },

                    marketplaceListings: {
                        used: marketplaceListingsUsed,
                        limit: marketplaceListingsLimit,
                        remaining: getRemaining(
                            marketplaceListingsUsed,
                            marketplaceListingsLimit
                        ),
                        canCreate:
                            marketplaceListingsLimit === null ||
                            marketplaceListingsUsed <
                                marketplaceListingsLimit,
                    },
                },
            },
        });
    }
);

exports.getSubscriptionPlans = asyncHandler(
    async (req, res) => {
        const pricing = getPlanPricing();

        res.status(200).json({
            success: true,
            data: {
                currency: pricing.currency,

                plans: [
                    {
                        id: 'free',
                        name: 'Free',
                        description:
                            'Essential tools for managing your agribusiness.',

                        pricing: pricing.free,

                        limits: {
                            farmProjects: 3,
                            marketplaceListings: 3,
                        },

                        features: {
                            farmProjects: true,
                            marketplace: true,
                            priceIndex: true,
                            community: true,
                            agriFeed: true,
                            financialDashboard: false,
                            financialReportExport: false,
                            adsEnabled: true,
                        },
                    },

                    {
                        id: 'premium',
                        name: 'Premium',
                        description:
                            'Unlimited projects and listings with advanced financial tools.',

                        pricing: pricing.premium,

                        limits: {
                            farmProjects: null,
                            marketplaceListings: null,
                        },

                        features: {
                            farmProjects: true,
                            marketplace: true,
                            priceIndex: true,
                            community: true,
                            agriFeed: true,
                            financialDashboard: true,
                            financialReportExport: true,
                            adsEnabled: false,
                        },
                    },
                ],
            },
        });
    }
);