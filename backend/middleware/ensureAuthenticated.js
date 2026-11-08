const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('./asyncHandler');
const AppError = require('../utils/AppError');

module.exports = asyncHandler(async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (
        typeof authHeader !== 'string' ||
        !authHeader.trim()
    ) {
        throw new AppError(
            'Authorization token missing.',
            401
        );
    }

    const match = authHeader.match(/^Bearer\s+(\S+)$/i);

    if (!match) {
        throw new AppError(
            'Invalid authorization header format.',
            401
        );
    }

    const token = match[1];

    if (!process.env.JWT_SECRET) {
        throw new AppError(
            'Authentication is not configured.',
            500
        );
    }

    let decoded;

    try {
        decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            {
                algorithms: ['HS256']
            }
        );
    } catch (error) {
        throw new AppError(
            'Invalid or expired authorization token.',
            401
        );
    }

    if (
        !decoded ||
        typeof decoded.id !== 'string' ||
        !Number.isSafeInteger(decoded.tokenVersion) ||
        decoded.tokenVersion < 0
    ) {
        throw new AppError(
            'Invalid authorization token.',
            401
        );
    }

    const user = await User.findById(decoded.id)
        .select('-password');

    if (!user) {
        throw new AppError(
            'User not found.',
            401
        );
    }

    const currentTokenVersion = user.tokenVersion ?? 0;

    if (decoded.tokenVersion !== currentTokenVersion) {
        throw new AppError(
            'Your session has expired. Please log in again.',
            401
        );
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