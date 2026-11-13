const express = require('express');
const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../../models/User', () => ({
    findById: jest.fn()
}));

jest.mock('../../controllers/financialController', () => ({
    getFinancialDashboard: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            endpoint: 'dashboard'
        });
    }),

    getExpenseBreakdown: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            endpoint: 'expenses'
        });
    }),

    getProjectProfitability: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            endpoint: 'projects'
        });
    }),

    getMonthlyCashFlow: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            endpoint: 'cashflow'
        });
    })
}));

jest.mock('../../controllers/subscriptionController', () => ({
    getSubscriptionPlans: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            data: {
                currency: 'NGN',
                premium: {
                    monthly: 500,
                    annual: 5000
                }
            }
        });
    }),

    getMySubscription: jest.fn((req, res) => {
        res.status(200).json({
            success: true,
            userId: String(req.user._id)
        });
    })
}));

const User = require('../../models/User');

const financialController = require(
    '../../controllers/financialController'
);

const subscriptionController = require(
    '../../controllers/subscriptionController'
);

const financialRoutes = require('../../routes/financialRoutes');
const subscriptionRoutes = require('../../routes/subscriptionRoutes');

const USER_ID = '507f1f77bcf86cd799439011';

const FINANCIAL_PATHS = [
    '/api/v1/financial/dashboard',
    '/api/v1/financial/expenses',
    '/api/v1/financial/projects',
    '/api/v1/financial/cashflow'
];

const createUser = ({
    plan = 'free',
    role = 'farmer',
    accountStatus = 'active',
    tokenVersion = 0,
    startsAt = null,
    expiresAt = null
} = {}) => ({
    _id: USER_ID,
    role,
    tokenVersion,
    accountStatus,
    subscription: {
        plan,
        billingCycle: plan === 'premium'
            ? 'monthly'
            : null,
        startsAt,
        expiresAt
    },
    save: jest.fn().mockResolvedValue(undefined)
});

const activePremium = options => createUser({
    plan: 'premium',
    startsAt: new Date('2020-01-01'),
    expiresAt: new Date('2099-01-01'),
    ...options
});

const expiredPremium = options => createUser({
    plan: 'premium',
    startsAt: new Date('2020-01-01'),
    expiresAt: new Date('2020-02-01'),
    ...options
});

const createToken = (overrides = {}) =>
    jwt.sign(
        {
            id: USER_ID,
            tokenVersion: 0,
            ...overrides
        },
        process.env.JWT_SECRET,
        {
            algorithm: 'HS256',
            expiresIn: '1h'
        }
    );

const authorization = token => ({
    Authorization: `Bearer ${token}`
});

const setDatabaseUser = user => {
    User.findById.mockImplementation(() => ({
        select: jest.fn().mockResolvedValue(user)
    }));
};

const createApp = () => {
    const app = express();

    app.use(express.json());

    app.use('/api/v1/financial', financialRoutes);
    app.use('/api/v1/subscription', subscriptionRoutes);

    // Local test error handler. This verifies the HTTP
    // status produced by the real middleware.
    app.use((error, req, res, next) => {
        res.status(
            error.statusCode ||
            error.status ||
            500
        ).json({
            success: false,
            message: error.message
        });
    });

    return app;
};

describe('Financial and Subscription API Authorization', () => {
    let app;
    let originalJwtSecret;

    beforeAll(() => {
        originalJwtSecret = process.env.JWT_SECRET;

        process.env.JWT_SECRET =
            'roamagro-integration-test-secret';
    });

    afterAll(() => {
        if (originalJwtSecret === undefined) {
            delete process.env.JWT_SECRET;
        } else {
            process.env.JWT_SECRET = originalJwtSecret;
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();

        app = createApp();

        setDatabaseUser(createUser());
    });

    describe('Authentication', () => {
        test.each(FINANCIAL_PATHS)(
            'rejects unauthenticated GET %s',
            async path => {
                const response = await request(app)
                    .get(path);

                expect(response.status).toBe(401);
                expect(response.body.success).toBe(false);
            }
        );

        test('rejects malformed Authorization header', async () => {
            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set('Authorization', 'invalid-token');

            expect(response.status).toBe(401);
        });

        test('rejects an invalid JWT', async () => {
            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization('not-a-valid-jwt'));

            expect(response.status).toBe(401);
        });

        test('rejects an expired JWT', async () => {
            const expiredToken = jwt.sign(
                {
                    id: USER_ID,
                    tokenVersion: 0
                },
                process.env.JWT_SECRET,
                {
                    algorithm: 'HS256',
                    expiresIn: -1
                }
            );

            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(expiredToken));

            expect(response.status).toBe(401);
        });

        test('rejects tokens missing tokenVersion', async () => {
            const token = createToken({
                tokenVersion: undefined
            });

            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(token));

            expect(response.status).toBe(401);
        });

        test('rejects revoked tokens', async () => {
            setDatabaseUser(
                createUser({
                    tokenVersion: 2
                })
            );

            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(createToken()));

            expect(response.status).toBe(401);

            expect(response.body.message).toMatch(
                /session has expired/i
            );
        });

        test('rejects a deleted user', async () => {
            setDatabaseUser(null);

            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(createToken()));

            expect(response.status).toBe(401);
        });

        test('rejects suspended accounts', async () => {
            setDatabaseUser(
                createUser({
                    accountStatus: 'suspended'
                })
            );

            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(createToken()));

            expect(response.status).toBe(403);
        });
    });

    describe('Premium financial access', () => {
        test.each(FINANCIAL_PATHS)(
            'blocks Free user from GET %s',
            async path => {
                setDatabaseUser(createUser());

                const response = await request(app)
                    .get(path)
                    .set(authorization(createToken()));

                expect(response.status).toBe(403);

                expect(response.body.message).toMatch(
                    /Premium subscription/i
                );
            }
        );

        test.each(FINANCIAL_PATHS)(
            'blocks expired Premium user from GET %s',
            async path => {
                setDatabaseUser(expiredPremium());

                const response = await request(app)
                    .get(path)
                    .set(authorization(createToken()));

                expect(response.status).toBe(403);
            }
        );

        test.each(FINANCIAL_PATHS)(
            'allows active Premium user to GET %s',
            async path => {
                setDatabaseUser(activePremium());

                const response = await request(app)
                    .get(path)
                    .set(authorization(createToken()));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            }
        );

        test.each([
            'admin',
            'extension_officer',
            'farmer',
            'buyer'
        ])(
            'does not automatically grant Premium to %s',
            async role => {
                setDatabaseUser(
                    createUser({ role })
                );

                const response = await request(app)
                    .get(FINANCIAL_PATHS[0])
                    .set(authorization(createToken()));

                expect(response.status).toBe(403);
            }
        );

        test('blocks Premium before its start date', async () => {
            setDatabaseUser(
                createUser({
                    plan: 'premium',
                    startsAt: new Date('2099-01-01'),
                    expiresAt: new Date('2099-12-31')
                })
            );

            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(createToken()));

            expect(response.status).toBe(403);
        });

        test('blocks Premium without valid dates', async () => {
            setDatabaseUser(
                createUser({
                    plan: 'premium',
                    startsAt: null,
                    expiresAt: null
                })
            );

            const response = await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(createToken()));

            expect(response.status).toBe(403);
        });

        test('does not execute financial controller for Free users', async () => {
            setDatabaseUser(createUser());

            await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(createToken()))
                .expect(403);

            expect(
                financialController.getFinancialDashboard
            ).not.toHaveBeenCalled();
        });

        test('executes financial controller for Premium users', async () => {
            setDatabaseUser(activePremium());

            await request(app)
                .get(FINANCIAL_PATHS[0])
                .set(authorization(createToken()))
                .expect(200);

            expect(
                financialController.getFinancialDashboard
            ).toHaveBeenCalledTimes(1);
        });
    });

    describe('Subscription endpoints', () => {
        test('allows public access to subscription plans', async () => {
            const response = await request(app)
                .get('/api/v1/subscription/plans');

            expect(response.status).toBe(200);
            expect(response.body.data.currency).toBe('NGN');

            expect(
                subscriptionController.getSubscriptionPlans
            ).toHaveBeenCalledTimes(1);
        });

        test('requires authentication for /subscription/me', async () => {
            const response = await request(app)
                .get('/api/v1/subscription/me');

            expect(response.status).toBe(401);

            expect(
                subscriptionController.getMySubscription
            ).not.toHaveBeenCalled();
        });

        test('allows authenticated users to view their subscription', async () => {
            const response = await request(app)
                .get('/api/v1/subscription/me')
                .set(authorization(createToken()));

            expect(response.status).toBe(200);
            expect(response.body.userId).toBe(USER_ID);
        });

        test('rejects revoked JWTs for subscription details', async () => {
            setDatabaseUser(
                createUser({
                    tokenVersion: 1
                })
            );

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .set(authorization(createToken()));

            expect(response.status).toBe(401);
        });
    });
});