const express = require('express');
const jwt = require('jsonwebtoken');
const request = require('supertest');

jest.mock('../../models/User');

const User = require('../../models/User');
const ensureAuthenticated = require(
    '../../middleware/ensureAuthenticated'
);
const errorHandler = require('../../middleware/errorHandler');

const originalJwtSecret = process.env.JWT_SECRET;

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f1f77bcf86cd799439012';

const createTestApp = () => {
    const app = express();

    app.get('/protected', ensureAuthenticated, (req, res) => {
        res.status(200).json({
            success: true,
            userId: String(req.userId),
            role: req.user.role
        });
    });

    app.use(errorHandler);

    return app;
};

const createUser = (overrides = {}) => ({
    _id: USER_ID,
    role: 'farmer',
    accountStatus: 'active',
    tokenVersion: 0,
    save: jest.fn().mockResolvedValue(undefined),
    ...overrides
});

const createUserQuery = (user) => ({
    select: jest.fn().mockResolvedValue(user)
});

const createToken = (
    payload = {
        id: USER_ID,
        tokenVersion: 0
    },
    options = {}
) => jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
        algorithm: 'HS256',
        expiresIn: '5m',
        ...options
    }
);

describe('Authentication security middleware', () => {
    let app;

    beforeEach(() => {
        process.env.JWT_SECRET =
            'test-jwt-secret-for-security-middleware';

        jest.resetAllMocks();

        app = createTestApp();

        User.findById.mockReturnValue(
            createUserQuery(createUser())
        );
    });

    afterAll(() => {
        if (originalJwtSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = originalJwtSecret;
        }
    });

    test('allows a valid HS256 token', async () => {
        const response = await request(app)
            .get('/protected')
            .set(
                'Authorization',
                `Bearer ${createToken()}`
            );

        expect(response.status).toBe(200);
        expect(response.body).toEqual({
            success: true,
            userId: USER_ID,
            role: 'farmer'
        });

        expect(User.findById).toHaveBeenCalledWith(
            USER_ID
        );
    });

    test('rejects requests without authorization', async () => {
        const response = await request(app)
            .get('/protected');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            'Authorization token missing.'
        );

        expect(User.findById).not.toHaveBeenCalled();
    });

    test.each([
        ['Basic authentication', 'Basic abc123'],
        ['missing Bearer scheme', 'abc123'],
        ['empty Bearer token', 'Bearer '],
        ['malformed Bearer token', 'Bearer token extra']
    ])(
        'rejects %s',
        async (_description, authorization) => {
            const response = await request(app)
                .get('/protected')
                .set('Authorization', authorization);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe(
                'Invalid authorization header format.'
            );

            expect(User.findById).not.toHaveBeenCalled();
        }
    );

    test('accepts a case-insensitive Bearer scheme', async () => {
        const response = await request(app)
            .get('/protected')
            .set(
                'Authorization',
                `bearer ${createToken()}`
            );

        expect(response.status).toBe(200);
    });

    test('rejects a token signed with the wrong secret', async () => {
        const token = jwt.sign(
            {
                id: USER_ID,
                tokenVersion: 0
            },
            'different-secret',
            {
                algorithm: 'HS256',
                expiresIn: '5m'
            }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            'Invalid or expired authorization token.'
        );

        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects an expired token', async () => {
        const token = createToken(
            {
                id: USER_ID,
                tokenVersion: 0
            },
            {
                expiresIn: -10
            }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            'Invalid or expired authorization token.'
        );

        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects a token signed using HS384', async () => {
        const token = createToken(
            {
                id: USER_ID,
                tokenVersion: 0
            },
            {
                algorithm: 'HS384'
            }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            'Invalid or expired authorization token.'
        );

        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects an unsigned JWT', async () => {
        const token = jwt.sign(
            {
                id: USER_ID,
                tokenVersion: 0
            },
            undefined,
            {
                algorithm: 'none'
            }
        );

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects a token with no tokenVersion', async () => {
        const token = createToken({
            id: USER_ID
        });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            'Invalid authorization token.'
        );

        expect(User.findById).not.toHaveBeenCalled();
    });

    test('rejects a token after its version has been revoked', async () => {
        User.findById.mockReturnValue(
            createUserQuery(
                createUser({
                    tokenVersion: 1
                })
            )
        );

        const response = await request(app)
            .get('/protected')
            .set(
                'Authorization',
                `Bearer ${createToken()}`
            );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            'Your session has expired. Please log in again.'
        );
    });

    test('accepts a token matching the latest token version', async () => {
        User.findById.mockReturnValue(
            createUserQuery(
                createUser({
                    tokenVersion: 4
                })
            )
        );

        const token = createToken({
            id: USER_ID,
            tokenVersion: 4
        });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(USER_ID);
    });

    test('rejects a token for a user that no longer exists', async () => {
        User.findById.mockReturnValue(
            createUserQuery(null)
        );

        const response = await request(app)
            .get('/protected')
            .set(
                'Authorization',
                `Bearer ${createToken()}`
            );

        expect(response.status).toBe(401);
        expect(response.body.message).toBe(
            'User not found.'
        );
    });

    test('does not trust a role claim embedded in the JWT', async () => {
        User.findById.mockReturnValue(
            createUserQuery(
                createUser({
                    role: 'farmer'
                })
            )
        );

        const token = createToken({
            id: USER_ID,
            tokenVersion: 0,
            role: 'admin'
        });

        const response = await request(app)
            .get('/protected')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.role).toBe('farmer');
    });

    test('uses the database identity instead of a user ID supplied in the request', async () => {
        const response = await request(app)
            .get('/protected')
            .query({
                userId: OTHER_USER_ID
            })
            .set(
                'Authorization',
                `Bearer ${createToken()}`
            );

        expect(response.status).toBe(200);
        expect(response.body.userId).toBe(USER_ID);

        expect(User.findById).toHaveBeenCalledWith(
            USER_ID
        );
    });

    test('rejects a suspended account', async () => {
        const user = createUser({
            accountStatus: 'suspended',
            suspendedUntil: new Date(Date.now() + 60_000)
        });

        User.findById.mockReturnValue(
            createUserQuery(user)
        );

        const response = await request(app)
            .get('/protected')
            .set(
                'Authorization',
                `Bearer ${createToken()}`
            );

        expect(response.status).toBe(403);
        expect(response.body.message).toBe(
            'Your account has been suspended.'
        );

        expect(user.save).not.toHaveBeenCalled();
    });

    test('does not expose the JWT secret in authentication errors', async () => {
        const response = await request(app)
            .get('/protected')
            .set('Authorization', 'Bearer invalid-token');

        expect(response.status).toBe(401);

        expect(
            JSON.stringify(response.body)
        ).not.toContain(process.env.JWT_SECRET);
    });
});