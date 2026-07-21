const AppError = require('../utils/AppError');

/**
 * Restrict access to specific user roles.
 *
 * Example:
 * router.post(
 *   '/',
 *   ensureAuthenticated,
 *   authorizeRoles('admin', 'extension_officer'),
 *   createTip
 * );
 */
const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // ensureAuthenticated should already attach req.user
        if (!req.user) {
            return next(
                new AppError('Authentication required.', 401)
            );
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(
                new AppError(
                    'You do not have permission to perform this action.',
                    403
                )
            );
        }
        next();
    };
};

module.exports = authorizeRoles;