jest.mock('mongoose', () => ({
    startSession: jest.fn()
}));

jest.mock('../../models/User', () => ({
    findById: jest.fn(),
    findOneAndUpdate: jest.fn()
}));

jest.mock('../../models/FarmProject', () => ({
    countDocuments: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn()
}));

jest.mock('../../models/MarketplaceItem', () => ({
    countDocuments: jest.fn(),
    create: jest.fn(),
    findOneAndDelete: jest.fn()
}));

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

describe('Quota Service', () => {
    const userId = '507f1f77bcf86cd799439011';
    const resourceId = '507f1f77bcf86cd799439012';

    let session;

    const freeUser = {
        _id: userId,
        accountStatus: 'active',
        subscription: {
            plan: 'free',
            startsAt: null,
            expiresAt: null
        }
    };

    const premiumUser = {
        _id: userId,
        accountStatus: 'active',
        subscription: {
            plan: 'premium',
            billingCycle: 'monthly',
            startsAt: new Date('2020-01-01'),
            expiresAt: new Date('2099-01-01')
        }
    };

    const mockCount = (Model, count) => {
        Model.countDocuments.mockImplementation(() => ({
            session: jest.fn().mockResolvedValue(count)
        }));
    };

    beforeEach(() => {
        jest.clearAllMocks();

        session = {
            withTransaction: jest.fn(async callback => callback()),
            endSession: jest.fn().mockResolvedValue(undefined)
        };

        mongoose.startSession.mockResolvedValue(session);

        User.findOneAndUpdate.mockResolvedValue(freeUser);

        mockCount(FarmProject, 0);
        mockCount(MarketplaceItem, 0);

        FarmProject.create.mockImplementation(
            async documents => documents
        );

        MarketplaceItem.create.mockImplementation(
            async documents => documents
        );

        FarmProject.findOneAndDelete.mockResolvedValue(null);
        MarketplaceItem.findOneAndDelete.mockResolvedValue(null);
    });

    describe('getQuotaStatus', () => {
        const mockUserLookup = user => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(user)
            });
        };

        test('reports zero of three projects used', async () => {
            mockUserLookup(freeUser);
            MarketplaceItem.countDocuments.mockResolvedValue(0);
            FarmProject.countDocuments.mockResolvedValue(0);

            const result = await getQuotaStatus(
                userId,
                RESOURCES.FARM_PROJECTS
            );

            expect(result).toEqual({
                resource: 'farmProjects',
                plan: 'free',
                used: 0,
                limit: 3,
                remaining: 3,
                canCreate: true
            });
        });

        test('reports quota reached at three projects', async () => {
            mockUserLookup(freeUser);
            FarmProject.countDocuments.mockResolvedValue(3);

            const result = await getQuotaStatus(
                userId,
                RESOURCES.FARM_PROJECTS
            );

            expect(result.used).toBe(3);
            expect(result.remaining).toBe(0);
            expect(result.canCreate).toBe(false);
        });

        test('reports no remaining slots when usage exceeds three', async () => {
            mockUserLookup(freeUser);
            FarmProject.countDocuments.mockResolvedValue(5);

            const result = await getQuotaStatus(
                userId,
                RESOURCES.FARM_PROJECTS
            );

            expect(result.used).toBe(5);
            expect(result.remaining).toBe(0);
            expect(result.canCreate).toBe(false);
        });

        test('reports unlimited Premium usage', async () => {
            mockUserLookup(premiumUser);
            MarketplaceItem.countDocuments.mockResolvedValue(12);

            const result = await getQuotaStatus(
                userId,
                RESOURCES.MARKETPLACE_LISTINGS
            );

            expect(result.plan).toBe('premium');
            expect(result.used).toBe(12);
            expect(result.limit).toBeNull();
            expect(result.remaining).toBeNull();
            expect(result.canCreate).toBe(true);
        });

        test('counts all owned listings without status filtering', async () => {
            mockUserLookup(freeUser);
            MarketplaceItem.countDocuments.mockResolvedValue(3);

            await getQuotaStatus(
                userId,
                RESOURCES.MARKETPLACE_LISTINGS
            );

            expect(
                MarketplaceItem.countDocuments
            ).toHaveBeenCalledWith({
                user: userId
            });
        });

        test('throws when user does not exist', async () => {
            mockUserLookup(null);
            FarmProject.countDocuments.mockResolvedValue(0);

            await expect(
                getQuotaStatus(
                    userId,
                    RESOURCES.FARM_PROJECTS
                )
            ).rejects.toThrow('User not found.');
        });

        test('rejects unsupported resource names', async () => {
            await expect(
                getQuotaStatus(userId, 'unknown')
            ).rejects.toThrow('Unsupported quota resource');
        });
    });

    describe('createWithinQuota', () => {
        test('creates a project when usage is below three', async () => {
            mockCount(FarmProject, 2);

            const result = await createWithinQuota({
                userId,
                resource: RESOURCES.FARM_PROJECTS,
                data: {
                    name: 'Maize Farm'
                }
            });

            expect(FarmProject.create).toHaveBeenCalledWith(
                [
                    {
                        name: 'Maize Farm',
                        user: userId
                    }
                ],
                { session }
            );

            expect(result.name).toBe('Maize Farm');

            expect(session.endSession).toHaveBeenCalledTimes(1);
        });

        test('blocks a fourth Free project', async () => {
            mockCount(FarmProject, 3);

            await expect(
                createWithinQuota({
                    userId,
                    resource: RESOURCES.FARM_PROJECTS,
                    data: {
                        name: 'Fourth Project'
                    }
                })
            ).rejects.toThrow(
                'Free plan allows a maximum of 3 farm projects.'
            );

            expect(FarmProject.create).not.toHaveBeenCalled();
            expect(session.endSession).toHaveBeenCalledTimes(1);
        });

        test('blocks a fourth Free marketplace listing', async () => {
            mockCount(MarketplaceItem, 3);

            await expect(
                createWithinQuota({
                    userId,
                    resource: RESOURCES.MARKETPLACE_LISTINGS,
                    data: {
                        title: 'Rice'
                    }
                })
            ).rejects.toThrow(
                'Free plan allows a maximum of 3 marketplace listings.'
            );

            expect(MarketplaceItem.create).not.toHaveBeenCalled();
        });

        test('allows unlimited Premium projects', async () => {
            User.findOneAndUpdate.mockResolvedValue(premiumUser);

            mockCount(FarmProject, 50);

            await createWithinQuota({
                userId,
                resource: RESOURCES.FARM_PROJECTS,
                data: {
                    name: 'Premium Farm'
                }
            });

            expect(FarmProject.create).toHaveBeenCalledTimes(1);

            expect(
                FarmProject.countDocuments
            ).not.toHaveBeenCalled();
        });

        test('does not trust client-supplied ownership', async () => {
            await createWithinQuota({
                userId,
                resource: RESOURCES.FARM_PROJECTS,
                data: {
                    name: 'Farm',
                    user: 'another-user'
                }
            });

            expect(FarmProject.create).toHaveBeenCalledWith(
                [
                    {
                        name: 'Farm',
                        user: userId
                    }
                ],
                { session }
            );
        });

        test('blocks inactive accounts', async () => {
            User.findOneAndUpdate.mockResolvedValue({
                ...freeUser,
                accountStatus: 'suspended'
            });

            await expect(
                createWithinQuota({
                    userId,
                    resource: RESOURCES.FARM_PROJECTS,
                    data: {
                        name: 'Farm'
                    }
                })
            ).rejects.toThrow(
                'Your account is not active.'
            );

            expect(FarmProject.create).not.toHaveBeenCalled();
        });

        test('throws when user is missing', async () => {
            User.findOneAndUpdate.mockResolvedValue(null);

            await expect(
                createWithinQuota({
                    userId,
                    resource: RESOURCES.FARM_PROJECTS,
                    data: {
                        name: 'Farm'
                    }
                })
            ).rejects.toThrow('User not found.');
        });

        test('locks the user document inside the transaction', async () => {
            await createWithinQuota({
                userId,
                resource: RESOURCES.FARM_PROJECTS,
                data: {
                    name: 'Farm'
                }
            });

            expect(User.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: userId },
                {
                    $inc: {
                        quotaRevision: 1
                    }
                },
                {
                    new: true,
                    session,
                    projection: {
                        subscription: 1,
                        accountStatus: 1
                    }
                }
            );

            expect(session.withTransaction).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({
                    readConcern: {
                        level: 'snapshot'
                    },
                    writeConcern: {
                        w: 'majority'
                    },
                    readPreference: 'primary'
                })
            );
        });

        test('closes the session when creation fails', async () => {
            FarmProject.create.mockRejectedValue(
                new Error('Database error')
            );

            await expect(
                createWithinQuota({
                    userId,
                    resource: RESOURCES.FARM_PROJECTS,
                    data: {
                        name: 'Farm'
                    }
                })
            ).rejects.toThrow('Database error');

            expect(session.endSession).toHaveBeenCalledTimes(1);
        });
    });

    describe('deleteWithinQuota', () => {
        test('deletes only the owned project', async () => {
            const deletedProject = {
                _id: resourceId,
                user: userId,
                name: 'Farm'
            };

            FarmProject.findOneAndDelete.mockResolvedValue(
                deletedProject
            );

            const result = await deleteWithinQuota({
                userId,
                resource: RESOURCES.FARM_PROJECTS,
                resourceId
            });

            expect(
                FarmProject.findOneAndDelete
            ).toHaveBeenCalledWith(
                {
                    _id: resourceId,
                    user: userId
                },
                { session }
            );

            expect(result).toEqual(deletedProject);
        });

        test('deletes only the owned marketplace listing', async () => {
            MarketplaceItem.findOneAndDelete.mockResolvedValue({
                _id: resourceId,
                user: userId
            });

            await deleteWithinQuota({
                userId,
                resource: RESOURCES.MARKETPLACE_LISTINGS,
                resourceId
            });

            expect(
                MarketplaceItem.findOneAndDelete
            ).toHaveBeenCalledWith(
                {
                    _id: resourceId,
                    user: userId
                },
                { session }
            );
        });

        test('returns null when owned resource is not found', async () => {
            const result = await deleteWithinQuota({
                userId,
                resource: RESOURCES.FARM_PROJECTS,
                resourceId
            });

            expect(result).toBeNull();
        });

        test('closes the session after deletion', async () => {
            await deleteWithinQuota({
                userId,
                resource: RESOURCES.FARM_PROJECTS,
                resourceId
            });

            expect(session.endSession).toHaveBeenCalledTimes(1);
        });
    });
});