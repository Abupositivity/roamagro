const jwt = require('jsonwebtoken');

const generateToken = (id, tokenVersion) => {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.trim().length < 32) {
        throw new Error(
            'JWT_SECRET must be configured with at least 32 characters.'
        );
    }

    if (
        !Number.isSafeInteger(tokenVersion) ||
        tokenVersion < 0
    ) {
        throw new Error('A valid token version is required.');
    }

    const expiresIn = process.env.JWT_EXPIRE || '7d';

    return jwt.sign(
        {
            id: String(id),
            tokenVersion
        },
        secret,
        {
            expiresIn,
            algorithm: 'HS256'
        }
    );
};

module.exports = generateToken;