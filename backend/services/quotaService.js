const mongoose = require('mongoose');

const User = require('../models/User');
const FarmProject = require('../models/FarmProject');
const MarketplaceItem = require('../models/MarketplaceItem');

const AppError = require('../utils/AppError');

const {
    getEntitlements,
    FREE_LIMITS,
} = require('./entitlementService');

const RESOURCES = Object.freeze({
    FARM_PROJECTS: 'farmProjects',
    MARKETPLACE_LISTINGS: 'marketplaceListings',
});

const RESOURCE_MODELS = {
    [RESOURCES.FARM_PROJECTS]: FarmProject,
    [RESOURCES.MARKETPLACE_LISTINGS]: MarketplaceItem,
};

const getResourceModel = (resource) => {
    const Model = RESOURCE_MODELS[resource];

    if (!Model) {
        throw new Error(
            `Unsupported quota resource: ${resource}`
        );
    }

    return Model;
};

const getQuotaStatus = async (userId, resource) => {
    const Model = getResourceModel(resource);

    const [user, used] = await Promise.all([
        User.findById(userId).select('subscription'),
        Model.countDocuments({ user: userId }),
    ]);

    if (!user) {
        throw new AppError('User not found.', 404);
    }

    const entitlements = getEntitlements(user);
    const limit = entitlements.limits[resource];

    return {
        resource,
        plan: entitlements.plan,
        used,
        limit,
        remaining:
            limit === null
                ? null
                : Math.max(0, limit - used),
        canCreate:
            limit === null || used < limit,
    };
};

const withQuotaTransaction = async (
    userId,
    operation
) => {
    const session = await mongoose.startSession();

    try {
        return await session.withTransaction(
            async () => {
                const user = await User.findOneAndUpdate(
                    { _id: userId },
                    {
                        $inc: {
                            quotaRevision: 1,
                        },
                    },
                    {
                        new: true,
                        session,
                        projection: {
                            subscription: 1,
                            accountStatus: 1,
                        },
                    }
                );

                if (!user) {
                    throw new AppError(
                        'User not found.',
                        404
                    );
                }

                if (user.accountStatus !== 'active') {
                    throw new AppError(
                        'Your account is not active.',
                        403
                    );
                }

                return operation(session, user);
            },
            {
                readConcern: {
                    level: 'snapshot',
                },
                writeConcern: {
                    w: 'majority',
                },
                readPreference: 'primary',
            }
        );
    } finally {
        await session.endSession();
    }
};

/**
 * Create a resource only when the user's
 * effective plan allows another item.
 */
const createWithinQuota = async ({
    userId,
    resource,
    data,
}) => {
    const Model = getResourceModel(resource);

    return withQuotaTransaction(
        userId,
        async (session, user) => {
            const entitlements = getEntitlements(user);
            const limit = entitlements.limits[resource];

            if (limit !== null) {
                const used = await Model.countDocuments({
                    user: userId,
                }).session(session);

                if (used >= limit) {
                    throw new AppError(
                        resource === RESOURCES.FARM_PROJECTS
                            ? 'Free plan allows a maximum of 3 farm projects. Delete an existing project or upgrade to Premium.'
                            : 'Free plan allows a maximum of 3 marketplace listings. Delete an existing listing or upgrade to Premium.',
                        403
                    );
                }
            }

            const documents = await Model.create(
                [
                    {
                        ...data,
                        user: userId,
                    },
                ],
                { session }
            );

            return documents[0];
        }
    );
};

/**
 * Delete an owned resource transactionally.
 *
 * A deleted resource stops counting toward
 * the user's quota automatically.
 */
const deleteWithinQuota = async ({
    userId,
    resource,
    resourceId,
}) => {
    const Model = getResourceModel(resource);

    return withQuotaTransaction(
        userId,
        async (session) => {
            const deleted = await Model.findOneAndDelete(
                {
                    _id: resourceId,
                    user: userId,
                },
                { session }
            );

            return deleted;
        }
    );
};

module.exports = {
    RESOURCES,
    getQuotaStatus,
    createWithinQuota,
    deleteWithinQuota,
};