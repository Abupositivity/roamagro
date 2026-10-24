const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User', () => ({
    findById: jest.fn()
}));

const User = require('../../models/User');
const ensureAuthenticated = require('../../middleware/ensureAuthenticated');
const ensureAdmin = require('../../middleware/ensureAdmin');

const TEST_SECRET = 'test-only-jwt-secret-that-is-at-least-32-characters';

const createApp = (middleware, setupUser) => {
    const app = express();

    app.get(
        '/protected',
        ...(setupUser ? [setupUser] : []),
        middleware,
        (req, res) => {
            res.status(200).json({
                success: true,
                userId: req.user?._id || null
            });
        }
    );

    app.use((err, req, res, next) => {
        if (res.headersSent) {
            return next(err);
        }

        res.status(err.statusCode || err.status || 500).json({
            success: false,
            message: err.message
        });
    });

    return app;
};

const createToken = (id = '507f1f77bcf86cd799439011') =>
    jwt.sign({ id }, TEST_SECRET, {
        expiresIn: '5m',
        algorithm: 'HS256'
    });

describe('ensureAuthenticated middleware', () => {
    let app;

    beforeAll(() => {
        process.env.JWT_SECRET = TEST_SECRET;
    });

    beforeEach(() => {
        jest.clearAllMocks();

        app = createApp(ensureAuthenticated);

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                _id: '507f1f77bcf86cd799439011',
                role: 'farmer',
                accountStatus: 'active'
            })
        });
    });

    test('rejects requests without an authorization token', async () => {
        const response = await request(app).get('/protected');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects malformed or invalid tokens', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);
        expect(response.body.message).toMatch(/invalid or expired/i);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects expired tokens', async () => {
        const expiredToken = jwt.sign(
            { id: '507f1f77bcf86cd799439011' },
            TEST_SECRET,
            {
                expiresIn: -1,
                algorithm: 'HS256'
            }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('allows a valid token for an existing active user', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(User.findById).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011'
        );
    });

    test('rejects a valid token when the user no longer exists', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(null)
        });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('User not found.');
    });

    test('rejects a suspended user whose suspension has not expired', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue({
                _id: '507f1f77bcf86cd799439011',
                role: 'farmer',
                accountStatus: 'suspended',
                suspendedUntil: new Date(Date.now() + 60_000)
            })
        });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(403);
        expect(response.body.message).toMatch(/suspended/i);
    });

    test('rejects malformed decoded identity claims', async () => {
        const token = jwt.sign(
            { id: 123 },
            TEST_SECRET,
            { algorithm: 'HS256' }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(User.findById).not.toHaveBeenCalled();
    });
});

describe('ensureAdmin middleware', () => {
    const setupUser = role => (req, res, next) => {
        if (role) {
            req.user = { role };
        }

        next();
    };

    test('rejects requests without a user', async () => {
        const app = createApp(
            ensureAdmin,
            setupUser(null)
        );

        const response = await request(app).get('/protected');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Authentication required.');
    });

    test('rejects authenticated non-admin users', async () => {
        const app = createApp(
            ensureAdmin,
            setupUser('farmer')
        );

        const response = await request(app).get('/protected');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
            'Administrator access required.'
        );
    });

    test('allows administrators', async () => {
        const app = createApp(
            ensureAdmin,
            setupUser('admin')
        );

        const response = await request(app).get('/protected');

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });
});