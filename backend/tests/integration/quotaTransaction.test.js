const mongoose = require('mongoose');

const User = require('../../models/User');
const FarmProject = require('../../models/FarmProject');
const MarketplaceItem = require('../../models/MarketplaceItem');

const {
    RESOURCES,
    getQuotaStatus,
    createWithinQuota,
    deleteWithinQuota
} = require('../../services/quotaService');

const TEST_URI = process.env.MONGODB_TEST_URI;

const TEST_DB_NAME = 'roamagro_quota_test';

const runId = new mongoose.Types.ObjectId().toString();

const createdUserIds = [];

const makeUser = async ({
    plan = 'free',
    role = 'farmer',
    startsAt = null,
    expiresAt = null
} = {}) => {
    const user = await User.create({
        name: 'Quota Test User',
        email: `quota-${runId}-${createdUserIds.length}@example.test`,
        password: 'TestPassword123!',
        role,
        isVerified: true,
        accountStatus: 'active',
        subscription: {
            plan,
            billingCycle: plan === 'premium' ? 'monthly' : null,
            startsAt,
            expiresAt
        }
    });

    createdUserIds.push(user._id);

    return user;
};

const projectData = index => ({
    name: `Test Farm ${index}`,
    description: 'Integration test farm',
    crop: 'Maize',
    farmType: 'Crop Farming',
    status: 'Planning'
});

const listingData = index => ({
    title: `Test Listing ${index}`,
    description: 'Integration test marketplace listing',
    category: 'Grains',
    price: 1000,
    quantity: 2,
    available: true
});

const createProject = (userId, index) =>
    createWithinQuota({
        userId,
        resource: RESOURCES.FARM_PROJECTS,
        data: projectData(index)
    });

const createListing = (userId, index) =>
    createWithinQuota({
        userId,
        resource: RESOURCES.MARKETPLACE_LISTINGS,
        data: listingData(index)
    });

beforeAll(async () => {
    if (!TEST_URI) {
        throw new Error(
            'MONGODB_TEST_URI is required for integration tests.'
        );
    }

    const parsed = new URL(TEST_URI);

    const databaseInUri = parsed.pathname.replace(/^\//, '');

    if (
        databaseInUri &&
        databaseInUri !== TEST_DB_NAME
    ) {
        throw new Error(
            `Integration tests require database ${TEST_DB_NAME}, ` +
            `but the URI points to ${databaseInUri}.`
        );
    }

    await mongoose.connect(TEST_URI, {
        dbName: TEST_DB_NAME,
        serverSelectionTimeoutMS: 10000
    });

    if (mongoose.connection.name !== TEST_DB_NAME) {
        throw new Error('Unsafe integration test database.');
    }

    const admin = mongoose.connection.db.admin();

    const hello = await admin.command({ hello: 1 });

    if (!hello.setName) {
        throw new Error(
            'MongoDB must run as a replica set for quota transactions.'
        );
    }

    await Promise.all([
        User.init(),
        FarmProject.init(),
        MarketplaceItem.init()
    ]);
}, 30000);

afterAll(async () => {
    if (
        mongoose.connection.readyState === 1 &&
        mongoose.connection.name === TEST_DB_NAME &&
        createdUserIds.length > 0
    ) {
        await Promise.all([
            FarmProject.deleteMany({
                user: { $in: createdUserIds }
            }),
            MarketplaceItem.deleteMany({
                user: { $in: createdUserIds }
            })
        ]);

        await User.deleteMany({
            _id: { $in: createdUserIds }
        });
    }

    await mongoose.disconnect();
}, 30000);

describe('Quota Transactions - Real MongoDB', () => {
    test('Free user can create three farm projects', async () => {
        const user = await makeUser();

        for (let index = 1; index <= 3; index++) {
            await createProject(user._id, index);
        }

        const status = await getQuotaStatus(
            user._id,
            RESOURCES.FARM_PROJECTS
        );

        expect(status.used).toBe(3);
        expect(status.limit).toBe(3);
        expect(status.remaining).toBe(0);
        expect(status.canCreate).toBe(false);
    });

    test('Free user cannot create a fourth project', async () => {
        const user = await makeUser();

        for (let index = 1; index <= 3; index++) {
            await createProject(user._id, index);
        }

        await expect(
            createProject(user._id, 4)
        ).rejects.toThrow(
            'Free plan allows a maximum of 3 farm projects.'
        );

        expect(
            await FarmProject.countDocuments({
                user: user._id
            })
        ).toBe(3);
    });

    test('completed projects still count toward quota', async () => {
        const user = await makeUser();

        const projects = [];

        for (let index = 1; index <= 3; index++) {
            projects.push(
                await createProject(user._id, index)
            );
        }

        await FarmProject.updateOne(
            { _id: projects[0]._id },
            { $set: { status: 'Completed' } }
        );

        const status = await getQuotaStatus(
            user._id,
            RESOURCES.FARM_PROJECTS
        );

        expect(status.used).toBe(3);
        expect(status.canCreate).toBe(false);
    });

    test('deleting a project frees one slot', async () => {
        const user = await makeUser();

        const projects = [];

        for (let index = 1; index <= 3; index++) {
            projects.push(
                await createProject(user._id, index)
            );
        }

        await deleteWithinQuota({
            userId: user._id,
            resource: RESOURCES.FARM_PROJECTS,
            resourceId: projects[0]._id
        });

        const status = await getQuotaStatus(
            user._id,
            RESOURCES.FARM_PROJECTS
        );

        expect(status.used).toBe(2);
        expect(status.remaining).toBe(1);

        await createProject(user._id, 4);

        expect(
            await FarmProject.countDocuments({
                user: user._id
            })
        ).toBe(3);
    });

    test('Free marketplace limit is three listings', async () => {
        const user = await makeUser();

        for (let index = 1; index <= 3; index++) {
            await createListing(user._id, index);
        }

        await expect(
            createListing(user._id, 4)
        ).rejects.toThrow(
            'Free plan allows a maximum of 3 marketplace listings.'
        );

        expect(
            await MarketplaceItem.countDocuments({
                user: user._id
            })
        ).toBe(3);
    });

    test('unavailable listings still count', async () => {
        const user = await makeUser();

        const listing = await createListing(user._id, 1);

        await createListing(user._id, 2);
        await createListing(user._id, 3);

        await MarketplaceItem.updateOne(
            { _id: listing._id },
            { $set: { available: false } }
        );

        const status = await getQuotaStatus(
            user._id,
            RESOURCES.MARKETPLACE_LISTINGS
        );

        expect(status.used).toBe(3);
        expect(status.canCreate).toBe(false);
    });

    test('Premium users have unlimited projects and listings', async () => {
        const user = await makeUser({
            plan: 'premium',
            startsAt: new Date('2020-01-01'),
            expiresAt: new Date('2099-01-01')
        });

        for (let index = 1; index <= 5; index++) {
            await createProject(user._id, index);
            await createListing(user._id, index);
        }

        const projectStatus = await getQuotaStatus(
            user._id,
            RESOURCES.FARM_PROJECTS
        );

        const listingStatus = await getQuotaStatus(
            user._id,
            RESOURCES.MARKETPLACE_LISTINGS
        );

        expect(projectStatus.used).toBe(5);
        expect(projectStatus.limit).toBeNull();
        expect(projectStatus.canCreate).toBe(true);

        expect(listingStatus.used).toBe(5);
        expect(listingStatus.limit).toBeNull();
        expect(listingStatus.canCreate).toBe(true);
    });

    test('expired Premium retains records but blocks new creation', async () => {
        const user = await makeUser({
            plan: 'premium',
            startsAt: new Date('2020-01-01'),
            expiresAt: new Date('2099-01-01')
        });

        for (let index = 1; index <= 5; index++) {
            await createProject(user._id, index);
        }

        await User.updateOne(
            { _id: user._id },
            {
                $set: {
                    'subscription.expiresAt':
                        new Date('2020-02-01')
                }
            }
        );

        const status = await getQuotaStatus(
            user._id,
            RESOURCES.FARM_PROJECTS
        );

        expect(status.plan).toBe('free');
        expect(status.used).toBe(5);
        expect(status.limit).toBe(3);
        expect(status.canCreate).toBe(false);

        await expect(
            createProject(user._id, 6)
        ).rejects.toThrow(
            'Free plan allows a maximum of 3 farm projects.'
        );

        expect(
            await FarmProject.countDocuments({
                user: user._id
            })
        ).toBe(5);
    });

    test('one user cannot delete another user project', async () => {
        const owner = await makeUser();
        const otherUser = await makeUser();

        const project = await createProject(
            owner._id,
            1
        );

        const result = await deleteWithinQuota({
            userId: otherUser._id,
            resource: RESOURCES.FARM_PROJECTS,
            resourceId: project._id
        });

        expect(result).toBeNull();

        expect(
            await FarmProject.exists({
                _id: project._id,
                user: owner._id
            })
        ).toBeTruthy();
    });

    test('concurrent creation never exceeds Free quota', async () => {
        const user = await makeUser();

        await createProject(user._id, 1);
        await createProject(user._id, 2);

        const results = await Promise.allSettled([
            createProject(user._id, 3),
            createProject(user._id, 4)
        ]);

        const successes = results.filter(
            result => result.status === 'fulfilled'
        );

        const failures = results.filter(
            result => result.status === 'rejected'
        );

        const count = await FarmProject.countDocuments({
            user: user._id
        });

        expect(count).toBe(3);
        expect(successes).toHaveLength(1);
        expect(failures).toHaveLength(1);
    });
});