
const mongoose = require('mongoose');

jest.mock('../../models/User', () => ({
    findById: jest.fn(),
    deleteOne: jest.fn(),
    exists: jest.fn()
}));

jest.mock('../../models/UserReport', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/CommunityPost', () => ({
    find: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    exists: jest.fn()
}));

jest.mock('../../models/MarketplaceItem', () => ({
    find: jest.fn(),
    deleteMany: jest.fn(),
    exists: jest.fn()
}));

jest.mock('../../models/FarmProject', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/Connection', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/Notification', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/AgriTip', () => ({
    find: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    exists: jest.fn()
}));

jest.mock('../../models/PriceAlert', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/PriceIndex', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../utils/cloudinaryStorage', () => ({
    uploadImage: jest.fn(),
    deleteImage: jest.fn()
}));

const User = require('../../models/User');
const UserReport = require('../../models/UserReport');
const CommunityPost = require('../../models/CommunityPost');
const MarketplaceItem = require('../../models/MarketplaceItem');
const FarmProject = require('../../models/FarmProject');
const Connection = require('../../models/Connection');
const Notification = require('../../models/Notification');
const AgriTip = require('../../models/AgriTip');
const PriceAlert = require('../../models/PriceAlert');
const PriceIndex = require('../../models/PriceIndex');
const {
    uploadImage,
    deleteImage
} = require('../../utils/cloudinaryStorage');
const userController = require('../../controllers/userController');

const userId = new mongoose.Types.ObjectId();
const otherUserId = new mongoose.Types.ObjectId();
const tipId = new mongoose.Types.ObjectId();
const sharedTipId = new mongoose.Types.ObjectId();
const postId = new mongoose.Types.ObjectId();
const ownPostId = new mongoose.Types.ObjectId();
const marketplaceItemId = new mongoose.Types.ObjectId();

const PROFILE_IMAGE_ID = 'roamagro/profiles/profile1';
const MARKETPLACE_IMAGE_ID_1 = 'roamagro/marketplace/item1';
const MARKETPLACE_IMAGE_ID_2 = 'roamagro/marketplace/item2';
const COMMUNITY_IMAGE_ID = 'roamagro/community/post1';
const AGRIFEED_IMAGE_ID = 'roamagro/agrifeed/tip1';

const createQuery = (result) => {
    const query = {};

    query.select = jest.fn().mockReturnValue(query);
    query.session = jest.fn().mockResolvedValue(result);

    return query;
};

const createResponse = () => {
    const res = {};

    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);

    return res;
};

describe('deleteAccount controller', () => {
    let session;
    let req;
    let res;
    let next;
    let account;

    const mockOwnTips = (tips) => {
        AgriTip.find.mockImplementation((filter) => {
            if (filter.createdBy !== undefined) {
                return createQuery(tips);
            }

            if (filter.sharedBy !== undefined) {
                return createQuery([
                    {
                        _id: sharedTipId,
                        sharedBy: [userId, otherUserId]
                    }
                ]);
            }

            return createQuery([]);
        });
    };

    const mockCommunityPosts = ({
        sharedPosts = [
            {
                _id: postId,
                sharedBy: [userId, otherUserId]
            }
        ],
        ownPosts = []
    } = {}) => {
        CommunityPost.find.mockImplementation((filter) => {
            if (filter.sharedBy !== undefined) {
                return createQuery(sharedPosts);
            }

            if (filter.user !== undefined) {
                return createQuery(ownPosts);
            }

            return createQuery([]);
        });
    };

    const mockMarketplaceItems = (items = []) => {
        MarketplaceItem.find.mockReturnValue(
            createQuery(items)
        );
    };

    const expectSuccessfulDeletion = () => {
        expect(res.status).toHaveBeenCalledWith(200);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Your RoamAgro account has been deleted successfully.'
        });

        expect(next).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    };

    beforeEach(() => {
        jest.clearAllMocks();

        account = {
            _id: userId,
            profilePhotoPublicId: ''
        };

        session = {
            withTransaction: jest.fn(async (callback) => callback()),
            endSession: jest.fn().mockResolvedValue(undefined)
        };

        jest.spyOn(mongoose, 'startSession')
            .mockResolvedValue(session);

        req = {
            user: {
                _id: userId
            }
        };

        res = createResponse();
        next = jest.fn();

        User.findById.mockImplementation(() => ({
            session: jest.fn().mockImplementation(
                async () => account
            )
        }));

        User.deleteOne.mockResolvedValue({
            deletedCount: 1
        });

        mockOwnTips([
            {
                _id: tipId,
                imagePublicId: ''
            }
        ]);

        mockCommunityPosts();
        mockMarketplaceItems();

        const deleteMethods = [
            UserReport,
            CommunityPost,
            MarketplaceItem,
            FarmProject,
            Connection,
            Notification,
            AgriTip,
            PriceAlert,
            PriceIndex
        ];

        deleteMethods.forEach((model) => {
            model.deleteMany.mockResolvedValue({
                deletedCount: 1
            });
        });

        AgriTip.updateMany.mockResolvedValue({
            modifiedCount: 1
        });

        CommunityPost.updateMany.mockResolvedValue({
            modifiedCount: 1
        });

        AgriTip.updateOne.mockResolvedValue({
            modifiedCount: 1
        });

        CommunityPost.updateOne.mockResolvedValue({
            modifiedCount: 1
        });

        CommunityPost.exists.mockResolvedValue(null);
        MarketplaceItem.exists.mockResolvedValue(null);
        AgriTip.exists.mockResolvedValue(null);
        User.exists.mockResolvedValue(null);

        deleteImage.mockResolvedValue({
            result: 'ok'
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('deletes account data and responds successfully', async () => {
        await userController.deleteAccount(req, res, next);

        expect(mongoose.startSession).toHaveBeenCalledTimes(1);
        expect(session.withTransaction).toHaveBeenCalledTimes(1);

        expect(User.findById).toHaveBeenCalledWith(userId);

        expect(AgriTip.find).toHaveBeenCalledWith({
            createdBy: userId
        });

        expect(AgriTip.find).toHaveBeenCalledWith({
            sharedBy: userId
        });

        expect(CommunityPost.find).toHaveBeenCalledWith({
            sharedBy: userId
        });

        expect(CommunityPost.find).toHaveBeenCalledWith({
            user: userId
        });

        expect(MarketplaceItem.find).toHaveBeenCalledWith({
            user: userId
        });

        expect(FarmProject.deleteMany).toHaveBeenCalledWith(
            { user: userId },
            { session }
        );

        expect(MarketplaceItem.deleteMany).toHaveBeenCalledWith(
            { user: userId },
            { session }
        );

        expect(CommunityPost.deleteMany).toHaveBeenCalledWith(
            { user: userId },
            { session }
        );

        expect(CommunityPost.updateMany).toHaveBeenCalledWith(
            {
                agriTip: {
                    $in: [tipId]
                }
            },
            {
                $set: {
                    agriTip: null
                }
            },
            { session }
        );

        expect(AgriTip.deleteMany).toHaveBeenCalledWith(
            {
                _id: {
                    $in: [tipId]
                }
            },
            { session }
        );

        expect(PriceAlert.deleteMany).toHaveBeenCalledWith(
            { user: userId },
            { session }
        );

        expect(PriceIndex.deleteMany).toHaveBeenCalledWith(
            { user: userId },
            { session }
        );

        expect(Connection.deleteMany).toHaveBeenCalledWith(
            {
                $or: [
                    { requester: userId },
                    { recipient: userId }
                ]
            },
            { session }
        );

        expect(Notification.deleteMany).toHaveBeenCalledWith(
            {
                $or: [
                    { recipient: userId },
                    { sender: userId }
                ]
            },
            { session }
        );

        expect(UserReport.deleteMany).toHaveBeenCalledWith(
            {
                $or: [
                    { reporter: userId },
                    { reportedUser: userId },
                    { reviewedBy: userId }
                ]
            },
            { session }
        );

        expect(AgriTip.updateMany).toHaveBeenCalledWith(
            {},
            {
                $pull: {
                    sharedBy: userId,
                    likes: userId,
                    bookmarks: userId,
                    comments: { user: userId }
                }
            },
            { session }
        );

        expect(CommunityPost.updateMany).toHaveBeenCalledWith(
            {},
            {
                $pull: {
                    sharedBy: userId,
                    likes: userId,
                    comments: { user: userId }
                }
            },
            { session }
        );

        expect(AgriTip.updateOne).toHaveBeenCalledWith(
            { _id: sharedTipId },
            {
                $set: {
                    shares: 1
                }
            },
            { session }
        );

        expect(CommunityPost.updateOne).toHaveBeenCalledWith(
            { _id: postId },
            {
                $set: {
                    shares: 1
                }
            },
            { session }
        );

        expect(User.deleteOne).toHaveBeenCalledWith(
            { _id: userId },
            { session }
        );

        expect(deleteImage).not.toHaveBeenCalled();

        expectSuccessfulDeletion();
    });

    test('retrieves owned content and image references within the transaction', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        mockOwnTips([
            {
                _id: tipId,
                imagePublicId: AGRIFEED_IMAGE_ID
            }
        ]);

        mockCommunityPosts({
            ownPosts: [
                {
                    _id: ownPostId,
                    imagePublicId: COMMUNITY_IMAGE_ID
                }
            ]
        });

        mockMarketplaceItems([
            {
                _id: marketplaceItemId,
                imagePublicIds: [
                    MARKETPLACE_IMAGE_ID_1,
                    MARKETPLACE_IMAGE_ID_2
                ]
            }
        ]);

        await userController.deleteAccount(req, res, next);

        const ownTipsQuery = AgriTip.find.mock.results[0].value;
        const sharedTipsQuery = AgriTip.find.mock.results[1].value;

        expect(ownTipsQuery.select).toHaveBeenCalledWith(
            '_id imagePublicId'
        );

        expect(sharedTipsQuery.select).toHaveBeenCalledWith(
            '_id sharedBy'
        );

        const sharedPostsQuery =
            CommunityPost.find.mock.results[0].value;

        const ownPostsQuery =
            CommunityPost.find.mock.results[1].value;

        expect(sharedPostsQuery.select).toHaveBeenCalledWith(
            '_id sharedBy'
        );

        expect(ownPostsQuery.select).toHaveBeenCalledWith(
            '_id imagePublicId'
        );

        const marketplaceQuery =
            MarketplaceItem.find.mock.results[0].value;

        expect(marketplaceQuery.select).toHaveBeenCalledWith(
            '_id imagePublicIds'
        );

        [
            ownTipsQuery,
            sharedTipsQuery,
            sharedPostsQuery,
            ownPostsQuery,
            marketplaceQuery
        ].forEach((query) => {
            expect(query.session).toHaveBeenCalledWith(session);
        });

        expectSuccessfulDeletion();
    });

    test('deletes unreferenced Cloudinary images after account deletion', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        mockOwnTips([
            {
                _id: tipId,
                imagePublicId: AGRIFEED_IMAGE_ID
            }
        ]);

        mockCommunityPosts({
            ownPosts: [
                {
                    _id: ownPostId,
                    imagePublicId: COMMUNITY_IMAGE_ID
                }
            ]
        });

        mockMarketplaceItems([
            {
                _id: marketplaceItemId,
                imagePublicIds: [
                    MARKETPLACE_IMAGE_ID_1,
                    MARKETPLACE_IMAGE_ID_2
                ]
            }
        ]);

        await userController.deleteAccount(req, res, next);

        const expectedIds = [
            PROFILE_IMAGE_ID,
            MARKETPLACE_IMAGE_ID_1,
            MARKETPLACE_IMAGE_ID_2,
            COMMUNITY_IMAGE_ID,
            AGRIFEED_IMAGE_ID
        ];

        expect(deleteImage).toHaveBeenCalledTimes(
            expectedIds.length
        );

        expectedIds.forEach((publicId) => {
            expect(User.exists).toHaveBeenCalledWith({
                profilePhotoPublicId: publicId
            });

            expect(CommunityPost.exists).toHaveBeenCalledWith({
                imagePublicId: publicId
            });

            expect(AgriTip.exists).toHaveBeenCalledWith({
                imagePublicId: publicId
            });

            expect(MarketplaceItem.exists).toHaveBeenCalledWith({
                imagePublicIds: publicId
            });

            expect(deleteImage).toHaveBeenCalledWith(publicId);
        });

        expectSuccessfulDeletion();
    });

    test('does not delete Cloudinary images that are still referenced', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        mockOwnTips([
            {
                _id: tipId,
                imagePublicId: AGRIFEED_IMAGE_ID
            }
        ]);

        mockCommunityPosts({
            ownPosts: [
                {
                    _id: ownPostId,
                    imagePublicId: COMMUNITY_IMAGE_ID
                }
            ]
        });

        mockMarketplaceItems([
            {
                _id: marketplaceItemId,
                imagePublicIds: [
                    MARKETPLACE_IMAGE_ID_1
                ]
            }
        ]);

        User.exists.mockImplementation(async (filter) => {
            if (
                filter.profilePhotoPublicId === PROFILE_IMAGE_ID
            ) {
                return { _id: otherUserId };
            }

            return null;
        });

        CommunityPost.exists.mockImplementation(async (filter) => {
            if (
                filter.imagePublicId === COMMUNITY_IMAGE_ID
            ) {
                return { _id: otherUserId };
            }

            return null;
        });

        AgriTip.exists.mockImplementation(async (filter) => {
            if (
                filter.imagePublicId === AGRIFEED_IMAGE_ID
            ) {
                return { _id: otherUserId };
            }

            return null;
        });

        MarketplaceItem.exists.mockImplementation(async (filter) => {
            if (
                filter.imagePublicIds === MARKETPLACE_IMAGE_ID_1
            ) {
                return { _id: otherUserId };
            }

            return null;
        });

        await userController.deleteAccount(req, res, next);

        expect(deleteImage).not.toHaveBeenCalled();

        expectSuccessfulDeletion();
    });

    test('deletes an image only once when multiple records use the same public ID', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        mockOwnTips([
            {
                _id: tipId,
                imagePublicId: PROFILE_IMAGE_ID
            }
        ]);

        mockCommunityPosts({
            ownPosts: [
                {
                    _id: ownPostId,
                    imagePublicId: PROFILE_IMAGE_ID
                }
            ]
        });

        mockMarketplaceItems([
            {
                _id: marketplaceItemId,
                imagePublicIds: [
                    PROFILE_IMAGE_ID,
                    PROFILE_IMAGE_ID,
                    ''
                ]
            }
        ]);

        await userController.deleteAccount(req, res, next);

        expect(deleteImage).toHaveBeenCalledTimes(1);
        expect(deleteImage).toHaveBeenCalledWith(
            PROFILE_IMAGE_ID
        );

        expect(User.exists).toHaveBeenCalledTimes(1);
        expect(CommunityPost.exists).toHaveBeenCalledTimes(1);
        expect(AgriTip.exists).toHaveBeenCalledTimes(1);
        expect(MarketplaceItem.exists).toHaveBeenCalledTimes(1);

        expectSuccessfulDeletion();
    });

    test('ignores missing and empty image public IDs', async () => {
        account.profilePhotoPublicId = '';

        mockOwnTips([
            {
                _id: tipId,
                imagePublicId: ''
            },
            {
                _id: new mongoose.Types.ObjectId()
            }
        ]);

        mockCommunityPosts({
            ownPosts: [
                {
                    _id: ownPostId,
                    imagePublicId: null
                }
            ]
        });

        mockMarketplaceItems([
            {
                _id: marketplaceItemId,
                imagePublicIds: ['', null]
            },
            {
                _id: new mongoose.Types.ObjectId()
            }
        ]);

        await userController.deleteAccount(req, res, next);

        expect(deleteImage).not.toHaveBeenCalled();
        expect(User.exists).not.toHaveBeenCalled();
        expect(CommunityPost.exists).not.toHaveBeenCalled();
        expect(AgriTip.exists).not.toHaveBeenCalled();
        expect(MarketplaceItem.exists).not.toHaveBeenCalled();

        expectSuccessfulDeletion();
    });

    test('continues successfully when Cloudinary deletion fails', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        deleteImage.mockRejectedValue(
            new Error('Cloudinary deletion failed')
        );

        const logSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        try {
            await userController.deleteAccount(req, res, next);

            expect(User.deleteOne).toHaveBeenCalledWith(
                { _id: userId },
                { session }
            );

            expect(deleteImage).toHaveBeenCalledWith(
                PROFILE_IMAGE_ID
            );

            expect(logSpy).toHaveBeenCalledWith(
                'Cloudinary image cleanup failed:',
                'Cloudinary deletion failed'
            );

            expectSuccessfulDeletion();
        } finally {
            logSpy.mockRestore();
        }
    });

    test('continues successfully when Cloudinary reference lookup fails', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        User.exists.mockRejectedValue(
            new Error('Image reference lookup failed')
        );

        const logSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        try {
            await userController.deleteAccount(req, res, next);

            expect(deleteImage).not.toHaveBeenCalled();

            expect(logSpy).toHaveBeenCalledWith(
                'Cloudinary image cleanup failed:',
                'Image reference lookup failed'
            );

            expectSuccessfulDeletion();
        } finally {
            logSpy.mockRestore();
        }
    });

    test('does not clean up Cloudinary images before the transaction completes', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        let transactionCompleted = false;

        session.withTransaction.mockImplementation(
            async (callback) => {
                expect(deleteImage).not.toHaveBeenCalled();

                await callback();

                expect(deleteImage).not.toHaveBeenCalled();

                transactionCompleted = true;
            }
        );

        deleteImage.mockImplementation(async () => {
            expect(transactionCompleted).toBe(true);

            return { result: 'ok' };
        });

        await userController.deleteAccount(req, res, next);

        expect(deleteImage).toHaveBeenCalledWith(
            PROFILE_IMAGE_ID
        );

        expectSuccessfulDeletion();
    });

    test('returns an error when the account does not exist', async () => {
        account = null;

        await userController.deleteAccount(req, res, next);

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'User account not found.',
                statusCode: 404
            })
        );

        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(FarmProject.deleteMany).not.toHaveBeenCalled();
        expect(PriceAlert.deleteMany).not.toHaveBeenCalled();
        expect(PriceIndex.deleteMany).not.toHaveBeenCalled();

        expect(deleteImage).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    test('forwards a database cleanup failure and does not report success', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        const cleanupError = new Error(
            'Simulated cleanup failure'
        );

        PriceAlert.deleteMany.mockRejectedValueOnce(
            cleanupError
        );

        await userController.deleteAccount(req, res, next);

        expect(next).toHaveBeenCalledWith(cleanupError);

        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(deleteImage).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    test('closes the session when transaction setup fails', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        const transactionError = new Error(
            'Simulated transaction failure'
        );

        session.withTransaction.mockRejectedValueOnce(
            transactionError
        );

        await userController.deleteAccount(req, res, next);

        expect(next).toHaveBeenCalledWith(transactionError);

        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(deleteImage).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    test('forwards account deletion failures and closes the session', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        const deletionError = new Error(
            'User deletion failed'
        );

        User.deleteOne.mockRejectedValueOnce(deletionError);

        await userController.deleteAccount(req, res, next);

        expect(next).toHaveBeenCalledWith(deletionError);

        expect(deleteImage).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    test('does not delete AgriTips when the user owns no tips', async () => {
        mockOwnTips([]);

        await userController.deleteAccount(req, res, next);

        expect(CommunityPost.updateMany).not.toHaveBeenCalledWith(
            expect.objectContaining({
                agriTip: expect.anything()
            }),
            expect.anything(),
            expect.anything()
        );

        expect(AgriTip.deleteMany).not.toHaveBeenCalled();

        expect(AgriTip.updateMany).toHaveBeenCalledWith(
            {},
            {
                $pull: {
                    sharedBy: userId,
                    likes: userId,
                    bookmarks: userId,
                    comments: { user: userId }
                }
            },
            { session }
        );

        expectSuccessfulDeletion();
    });

    test('does not update share counts when the user has no shared posts or tips', async () => {
        mockOwnTips([]);

        AgriTip.find.mockImplementation((filter) => {
            if (filter.createdBy !== undefined) {
                return createQuery([]);
            }

            if (filter.sharedBy !== undefined) {
                return createQuery([]);
            }

            return createQuery([]);
        });

        mockCommunityPosts({
            sharedPosts: [],
            ownPosts: []
        });

        await userController.deleteAccount(req, res, next);

        expect(AgriTip.updateOne).not.toHaveBeenCalled();
        expect(CommunityPost.updateOne).not.toHaveBeenCalled();

        expectSuccessfulDeletion();
    });

    test('recalculates shares correctly when the deleting user is the only sharer', async () => {
        AgriTip.find.mockImplementation((filter) => {
            if (filter.createdBy !== undefined) {
                return createQuery([]);
            }

            if (filter.sharedBy !== undefined) {
                return createQuery([
                    {
                        _id: sharedTipId,
                        sharedBy: [userId]
                    }
                ]);
            }

            return createQuery([]);
        });

        mockCommunityPosts({
            sharedPosts: [
                {
                    _id: postId,
                    sharedBy: [userId]
                }
            ]
        });

        await userController.deleteAccount(req, res, next);

        expect(AgriTip.updateOne).toHaveBeenCalledWith(
            { _id: sharedTipId },
            { $set: { shares: 0 } },
            { session }
        );

        expect(CommunityPost.updateOne).toHaveBeenCalledWith(
            { _id: postId },
            { $set: { shares: 0 } },
            { session }
        );

        expectSuccessfulDeletion();
    });

    test('never uploads images during account deletion', async () => {
        account.profilePhotoPublicId = PROFILE_IMAGE_ID;

        await userController.deleteAccount(req, res, next);

        expect(uploadImage).not.toHaveBeenCalled();

        expectSuccessfulDeletion();
    });
});