
const express = require('express');
const request = require('supertest');

jest.mock('../../models/User', () => ({
    findById: jest.fn()
}));

jest.mock('../../models/FarmProject', () => ({
    countDocuments: jest.fn()
}));

jest.mock('../../models/MarketplaceItem', () => ({
    countDocuments: jest.fn()
}));

// Authentication itself is covered by financialAuthorization.test.js.
// Here we isolate the subscription response contract.
jest.mock('../../middleware/ensureAuthenticated', () => (
    (req, res, next) => {
        req.user = {
            _id: '507f1f77bcf86cd799439011'
        };
        next();
    }
));

const User = require('../../models/User');
const FarmProject = require('../../models/FarmProject');
const MarketplaceItem = require('../../models/MarketplaceItem');

const subscriptionRoutes = require(
    '../../routes/subscriptionRoutes'
);

const USER_ID = '507f1f77bcf86cd799439011';

const makeUser = ({
    plan = 'free',
    role = 'farmer',
    startsAt = null,
    expiresAt = null,
    accountStatus = 'active'
} = {}) => ({
    _id: USER_ID,
    role,
    accountStatus,
    subscription: {
        plan,
        billingCycle: plan === 'premium'
            ? 'monthly'
            : null,
        startsAt,
        expiresAt
    }
});

const premiumUser = (overrides = {}) => makeUser({
    plan: 'premium',
    startsAt: new Date('2020-01-01'),
    expiresAt: new Date('2099-01-01'),
    ...overrides
});

const mockUser = user => {
    User.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue(user)
    });
};

const mockUsage = (projects, listings) => {
    FarmProject.countDocuments.mockResolvedValue(projects);
    MarketplaceItem.countDocuments.mockResolvedValue(listings);
};

const createApp = () => {
    const app = express();

    app.use(express.json());
    app.use('/api/v1/subscription', subscriptionRoutes);

    app.use((error, req, res, next) => {
        res.status(
            error.statusCode || error.status || 500
        ).json({
            success: false,
            message: error.message
        });
    });

    return app;
};

describe('Subscription API Response Contract', () => {
    let app;

    beforeEach(() => {
        jest.clearAllMocks();

        app = createApp();
        mockUser(makeUser());
        mockUsage(0, 0);
    });

    describe('GET /subscription/plans', () => {
        test('returns the correct pricing', async () => {
            const response = await request(app)
                .get('/api/v1/subscription/plans')
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.currency).toBe('NGN');

            const plans = response.body.data.plans;

            expect(plans).toHaveLength(2);

            const free = plans.find(
                plan => plan.id === 'free'
            );

            const premium = plans.find(
                plan => plan.id === 'premium'
            );

            expect(free.pricing).toEqual({
                monthly: 0,
                annual: 0
            });

            expect(premium.pricing).toEqual({
                monthly: 500,
                annual: 5000
            });
        });

        test('returns the correct plan limits', async () => {
            const response = await request(app)
                .get('/api/v1/subscription/plans')
                .expect(200);

            const { plans } = response.body.data;

            const free = plans.find(
                plan => plan.id === 'free'
            );

            const premium = plans.find(
                plan => plan.id === 'premium'
            );

            expect(free.limits).toEqual({
                farmProjects: 3,
                marketplaceListings: 3
            });

            expect(premium.limits).toEqual({
                farmProjects: null,
                marketplaceListings: null
            });
        });

        test('advertises financial tools only for Premium', async () => {
            const response = await request(app)
                .get('/api/v1/subscription/plans')
                .expect(200);

            const { plans } = response.body.data;

            const free = plans.find(
                plan => plan.id === 'free'
            );

            const premium = plans.find(
                plan => plan.id === 'premium'
            );

            expect(free.features.financialDashboard).toBe(false);
            expect(free.features.financialReportExport).toBe(false);
            expect(free.features.adsEnabled).toBe(true);

            expect(premium.features.financialDashboard).toBe(true);
            expect(premium.features.financialReportExport).toBe(true);
            expect(premium.features.adsEnabled).toBe(false);
        });
    });

    describe('GET /subscription/me', () => {
        test('returns Free usage with available slots', async () => {
            mockUsage(1, 2);

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .expect(200);

            const { data } = response.body;

            expect(data.plan).toBe('free');
            expect(data.isPremium).toBe(false);

            expect(data.usage.farmProjects).toEqual({
                used: 1,
                limit: 3,
                remaining: 2,
                canCreate: true
            });

            expect(data.usage.marketplaceListings).toEqual({
                used: 2,
                limit: 3,
                remaining: 1,
                canCreate: true
            });
        });

        test('blocks creation when both Free quotas are full', async () => {
            mockUsage(3, 3);

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .expect(200);

            expect(
                response.body.data.usage.farmProjects
            ).toEqual({
                used: 3,
                limit: 3,
                remaining: 0,
                canCreate: false
            });

            expect(
                response.body.data.usage.marketplaceListings
            ).toEqual({
                used: 3,
                limit: 3,
                remaining: 0,
                canCreate: false
            });
        });

        test('never reports negative remaining slots', async () => {
            mockUsage(6, 5);

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .expect(200);

            const { usage } = response.body.data;

            expect(usage.farmProjects.remaining).toBe(0);
            expect(usage.marketplaceListings.remaining).toBe(0);
            expect(usage.farmProjects.canCreate).toBe(false);
            expect(usage.marketplaceListings.canCreate).toBe(false);
        });

        test('returns unlimited usage for active Premium', async () => {
            mockUser(premiumUser());
            mockUsage(20, 15);

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .expect(200);

            const { data } = response.body;

            expect(data.plan).toBe('premium');
            expect(data.isPremium).toBe(true);

            expect(data.usage.farmProjects).toEqual({
                used: 20,
                limit: null,
                remaining: null,
                canCreate: true
            });

            expect(data.usage.marketplaceListings).toEqual({
                used: 15,
                limit: null,
                remaining: null,
                canCreate: true
            });

            expect(data.features.financialDashboard).toBe(true);
            expect(data.features.financialReportExport).toBe(true);
            expect(data.features.adsEnabled).toBe(false);
        });

        test('downgrades expired Premium without losing usage counts', async () => {
            mockUser(premiumUser({
                expiresAt: new Date('2020-02-01')
            }));

            mockUsage(7, 4);

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .expect(200);

            const { data } = response.body;

            expect(data.plan).toBe('free');
            expect(data.isPremium).toBe(false);

            expect(data.usage.farmProjects.used).toBe(7);
            expect(data.usage.marketplaceListings.used).toBe(4);

            expect(data.usage.farmProjects.canCreate).toBe(false);
            expect(data.usage.marketplaceListings.canCreate).toBe(false);

            expect(data.features.financialDashboard).toBe(false);
            expect(data.features.financialReportExport).toBe(false);
            expect(data.features.adsEnabled).toBe(true);

            expect(data.subscription.expiresAt).toBeNull();
        });

        test.each([
            'admin',
            'extension_officer',
            'farmer',
            'buyer'
        ])(
            'keeps Free limits for role %s',
            async role => {
                mockUser(makeUser({ role }));

                const response = await request(app)
                    .get('/api/v1/subscription/me')
                    .expect(200);

                expect(response.body.data.plan).toBe('free');
                expect(
                    response.body.data.usage.farmProjects.limit
                ).toBe(3);
            }
        );

        test('counts only the authenticated user resources', async () => {
            await request(app)
                .get('/api/v1/subscription/me')
                .expect(200);

            expect(
                FarmProject.countDocuments
            ).toHaveBeenCalledWith({
                user: USER_ID
            });

            expect(
                MarketplaceItem.countDocuments
            ).toHaveBeenCalledWith({
                user: USER_ID
            });
        });

        test('returns 404 when account no longer exists', async () => {
            mockUser(null);

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .expect(404);

            expect(response.body.success).toBe(false);
            expect(response.body.message).toMatch(
                /User account not found/i
            );
        });

        test('rejects inactive accounts', async () => {
            mockUser(makeUser({
                accountStatus: 'suspended'
            }));

            const response = await request(app)
                .get('/api/v1/subscription/me')
                .expect(403);

            expect(response.body.message).toMatch(
                /account is not active/i
            );
        });
    });
});