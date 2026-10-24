const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('../../models/User');

const User = require('../../models/User');
const ensureAuthenticated = require('../../middleware/ensureAuthenticated');
const errorHandler = require('../../middleware/errorHandler');

const originalJwtSecret = process.env.JWT_SECRET;

const createTestApp = () => {
    const app = express();

    app.get('/protected', ensureAuthenticated, (req, res) => {
        res.status(200).json({
            success: true,
            userId: String(req.userId)
        });
    });

    app.use(errorHandler);

    return app;
};

const createToken = (payload = { id: '507f1f77bcf86cd799439011' }) => (
    jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5m' })
);

const createUserQuery = user => ({
    select: jest.fn().mockResolvedValue(user)
});

describe('ensureAuthenticated edge cases', () => {
    let app;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test-jwt-secret-for-authentication-tests';
        app = createTestApp();
        jest.clearAllMocks();
    });

    afterAll(() => {
        if (originalJwtSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = originalJwtSecret;
        }
    });

    test('rejects a missing authorization header', async () => {
        const response = await request(app).get('/protected');

        expect(response.status).toBe(401);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects an empty Bearer token', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer   ');

        expect(response.status).toBe(401);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('returns 500 when JWT_SECRET is not configured', async () => {
        const token = createToken();

        delete process.env.JWT_SECRET;

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(500);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects a token whose decoded identity is not a string', async () => {
        const token = createToken({ id: 123 });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects a token without an identity claim', async () => {
        const token = createToken({ role: 'farmer' });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects a suspended account with no suspension expiry', async () => {
        User.findById.mockReturnValue(
            createUserQuery({
                _id: '507f1f77bcf86cd799439011',
                accountStatus: 'suspended',
                suspendedUntil: null,
                save: jest.fn()
            })
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(403);
        expect(User.findById).toHaveBeenCalledWith(
            '507f1f77bcf86cd799439011'
        );
    });

    test('rejects a suspended account whose suspension has not expired', async () => {
        const user = {
            _id: '507f1f77bcf86cd799439011',
            accountStatus: 'suspended',
            suspendedUntil: new Date(Date.now() + 60_000),
            save: jest.fn()
        };

        User.findById.mockReturnValue(createUserQuery(user));

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(403);
        expect(user.save).not.toHaveBeenCalled();
    });

    test('reactivates an account whose suspension has expired', async () => {
        const user = {
            _id: '507f1f77bcf86cd799439011',
            accountStatus: 'suspended',
            suspensionReason: 'Temporary suspension',
            suspendedAt: new Date(Date.now() - 120_000),
            suspendedUntil: new Date(Date.now() - 60_000),
            save: jest.fn().mockResolvedValue(undefined)
        };

        User.findById.mockReturnValue(createUserQuery(user));

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(String(user._id));
        expect(user.accountStatus).toBe('active');
        expect(user.suspensionReason).toBeUndefined();
        expect(user.suspendedAt).toBeUndefined();
        expect(user.suspendedUntil).toBeUndefined();
        expect(user.save).toHaveBeenCalledTimes(1);
    });

    test('returns an error if loading the user fails', async () => {
        User.findById.mockReturnValue({
            select: jest.fn().mockRejectedValue(new Error('Database unavailable'))
        });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(500);
    });

    test('returns an error if saving an expired suspension fails', async () => {
        const user = {
            _id: '507f1f77bcf86cd799439011',
            accountStatus: 'suspended',
            suspendedUntil: new Date(Date.now() - 60_000),
            save: jest.fn().mockRejectedValue(new Error('Save failed'))
        };

        User.findById.mockReturnValue(createUserQuery(user));

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${createToken()}`);

        expect(response.status).toBe(500);
        expect(user.save).toHaveBeenCalledTimes(1);
    });
});