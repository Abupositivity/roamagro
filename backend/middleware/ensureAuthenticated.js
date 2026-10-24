const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const AppError = require('../utils/AppError');

module.exports = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
        throw new AppError('Authorization token missing.', 401);
    }

    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    if (!token) {
        throw new AppError('Authorization token missing.', 401);
    }

    if (!process.env.JWT_SECRET) {
        throw new AppError('Authentication is not configured.', 500);
    }

    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new AppError('Invalid or expired authorization token.', 401);
    }

    if (!decoded || typeof decoded.id !== 'string') {
        throw new AppError('Invalid authorization token.', 401);
    }

    const user = await User.findById(decoded.id)
        .select('-password');

    if (!user) {
        throw new AppError('User not found.', 401);
    }

    if (user.accountStatus === 'suspended') {
        const suspensionExpired =
            user.suspendedUntil &&
            new Date(user.suspendedUntil).getTime() <= Date.now();

        if (!suspensionExpired) {
            throw new AppError(
                'Your account has been suspended.',
                403
            );
        }

        user.accountStatus = 'active';
        user.suspensionReason = undefined;
        user.suspendedAt = undefined;
        user.suspendedUntil = undefined;

        await user.save();
    }

    req.user = user;
    req.userId = user._id;

    next();
});