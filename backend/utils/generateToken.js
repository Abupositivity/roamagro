const jwt = require('jsonwebtoken');

const generateToken = id => {
    const secret = process.env.JWT_SECRET;

    if (!secret || secret.trim().length < 32) {
        throw new Error(
            'JWT_SECRET must be configured with at least 32 characters.'
        );
    }

    const expiresIn = process.env.JWT_EXPIRE || '7d';

    return jwt.sign(
        { id: String(id) },
        secret,
        {
            expiresIn,
            algorithm: 'HS256'
        }
    );
};

module.exports = generateToken;