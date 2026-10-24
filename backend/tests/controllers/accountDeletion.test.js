const mongoose = require('mongoose');

jest.mock('../../models/User', () => ({
    findById: jest.fn(),
    deleteOne: jest.fn()
}));

jest.mock('../../models/UserReport', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/CommunityPost', () => ({
    find: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn()
}));

jest.mock('../../models/MarketplaceItem', () => ({
    deleteMany: jest.fn()
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
    updateOne: jest.fn()
}));

jest.mock('../../models/PriceAlert', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/PriceIndex', () => ({
    deleteMany: jest.fn()
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
const userController = require('../../controllers/userController');

const userId = new mongoose.Types.ObjectId();
const otherUserId = new mongoose.Types.ObjectId();
const tipId = new mongoose.Types.ObjectId();
const sharedTipId = new mongoose.Types.ObjectId();
const postId = new mongoose.Types.ObjectId();

const createQuery = result => ({
    select: jest.fn().mockReturnThis(),
    session: jest.fn().mockResolvedValue(result)
});

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

    beforeEach(() => {
        jest.clearAllMocks();

        account = {
            _id: userId
        };

        session = {
            withTransaction: jest.fn(async callback => callback()),
            endSession: jest.fn().mockResolvedValue(undefined)
        };

        jest.spyOn(mongoose, 'startSession').mockResolvedValue(session);

        req = {
            user: {
                _id: userId
            }
        };

        res = createResponse();
        next = jest.fn();

        User.findById.mockReturnValue({
            session: jest.fn().mockResolvedValue(account)
        });

        User.deleteOne.mockResolvedValue({ deletedCount: 1 });

        AgriTip.find
            .mockReturnValueOnce(createQuery([{ _id: tipId }]))
            .mockReturnValueOnce(createQuery([
                {
                    _id: sharedTipId,
                    sharedBy: [userId, otherUserId]
                }
            ]));

        CommunityPost.find.mockReturnValue(
            createQuery([
                {
                    _id: postId,
                    sharedBy: [userId, otherUserId]
                }
            ])
        );

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

        deleteMethods.forEach(model => {
            model.deleteMany.mockResolvedValue({ deletedCount: 1 });
        });

        AgriTip.updateMany.mockResolvedValue({ modifiedCount: 1 });
        CommunityPost.updateMany.mockResolvedValue({ modifiedCount: 1 });
        AgriTip.updateOne.mockResolvedValue({ modifiedCount: 1 });
        CommunityPost.updateOne.mockResolvedValue({ modifiedCount: 1 });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    test('deletes account data and responds successfully', async () => {
        await userController.deleteAccount(req, res, next);

        expect(mongoose.startSession).toHaveBeenCalledTimes(1);
        expect(session.withTransaction).toHaveBeenCalledTimes(1);

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

        expect(AgriTip.deleteMany).toHaveBeenCalledWith(
            { _id: { $in: [tipId] } },
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
            { $set: { shares: 1 } },
            { session }
        );

        expect(CommunityPost.updateOne).toHaveBeenCalledWith(
            { _id: postId },
            { $set: { shares: 1 } },
            { session }
        );

        expect(User.deleteOne).toHaveBeenCalledWith(
            { _id: userId },
            { session }
        );

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Your RoamAgro account has been deleted successfully.'
        });

        expect(next).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    test('returns an error when the account does not exist', async () => {
        User.findById.mockReturnValue({
            session: jest.fn().mockResolvedValue(null)
        });

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
        expect(res.json).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    test('forwards a cleanup failure and does not report success', async () => {
        const cleanupError = new Error('Simulated cleanup failure');

        PriceAlert.deleteMany.mockRejectedValueOnce(cleanupError);

        await userController.deleteAccount(req, res, next);

        expect(next).toHaveBeenCalledWith(cleanupError);
        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });

    test('closes the session when transaction setup fails', async () => {
        const transactionError = new Error('Simulated transaction failure');

        session.withTransaction.mockRejectedValueOnce(transactionError);

        await userController.deleteAccount(req, res, next);

        expect(next).toHaveBeenCalledWith(transactionError);
        expect(User.deleteOne).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(session.endSession).toHaveBeenCalledTimes(1);
    });
});