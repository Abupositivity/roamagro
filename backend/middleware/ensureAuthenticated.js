const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const AppError = require('../utils/AppError');

module.exports = asyncHandler(async (req, res, next) => {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        throw new AppError(
            'Authorization token missing.',
            401
        );
    }

    const token = authHeader.startsWith('Bearer ')
        ? authHeader.split(' ')[1]
        : authHeader;

    const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
    );

    const user = await User.findById(decoded.id)
        .select('-password');

    if (!user) {
        throw new AppError(
            'User not found.',
            401
        );
    }

    if (user.isSuspended) {
        throw new AppError(
            'Your account has been suspended.',
            403
        );
    }

    req.user = user;
    req.userId = user._id;
    next();
});