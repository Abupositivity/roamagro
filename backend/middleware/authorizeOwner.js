const AppError = require('../utils/AppError');

/**
 * Generic ownership middleware.
 *
 * Pass in:
 *  - Mongoose model
 *  - Owner field name
 *
 * Example:
 * authorizeOwner(FarmProject)
 * authorizeOwner(MarketplaceItem)
 */
const authorizeOwner = (Model, ownerField = 'user') => {
    return async (req, res, next) => {
        const resource = await Model.findById(req.params.id);
        if (!resource) {
            return next(
                new AppError('Resource not found.', 404)
            );
        }
        // Admin bypass
        if (req.user.role === 'admin') {
            req.resource = resource;
            return next();
        }
        const owner = resource[ownerField];
        if (!owner) {
            return next(
                new AppError(
                    'Resource owner not found.',
                    403
                )
            );
        }
        if (owner.toString() !== req.user._id.toString()) {
            return next(
                new AppError(
                    'You are not authorized to modify this resource.',
                    403
                )
            );
        }
        req.resource = resource;
        next();
    };
};

module.exports = authorizeOwner;