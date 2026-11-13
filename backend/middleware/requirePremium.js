const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const AppError = require('../utils/AppError');

const {
    hasFeatureAccess,
} = require('../services/entitlementService');

const requirePremium = (feature) =>
    asyncHandler(async (req, res, next) => {
        if (!req.user?._id) {
            throw new AppError(
                'Please log in to continue.',
                401
            );
        }

        const user = await User.findById(
            req.user._id
        ).select('subscription accountStatus');

        if (!user) {
            throw new AppError(
                'User account not found.',
                401
            );
        }

        if (user.accountStatus !== 'active') {
            throw new AppError(
                'Your account is not active.',
                403
            );
        }

        if (!hasFeatureAccess(user, feature)) {
            throw new AppError(
                'This feature requires an active Premium subscription. Upgrade to Premium to continue.',
                403
            );
        }

        next();
    });

module.exports = requirePremium;