
const mongoose = require('mongoose');
const Notification = require('../../models/Notification');
const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
} = require('../../controllers/notificationController');

jest.mock('../../models/Notification');

jest.mock('../../middleware/asyncHandler', () => (handler) => (
    req,
    res,
    next
) => Promise.resolve(handler(req, res, next)).catch(next));

jest.mock('../../utils/AppError', () => {
    return class AppError extends Error {
        constructor(message, statusCode) {
            super(message);
            this.statusCode = statusCode;
        }
    };
});

describe('Notification Controller', () => {
    let req;
    let res;

    const userId = new mongoose.Types.ObjectId();
    const senderId = new mongoose.Types.ObjectId();
    const notificationId = new mongoose.Types.ObjectId();

    const makeNotification = (overrides = {}) => ({
        _id: notificationId,
        recipient: userId,
        sender: senderId,
        type: 'connection',
        title: 'New connection',
        message: 'Someone connected with you.',
        link: '/connections',
        read: false,
        createdAt: new Date('2026-01-01T10:00:00Z'),
        save: jest.fn().mockResolvedValue(true),
        deleteOne: jest.fn().mockResolvedValue(true),
        ...overrides,
    });

    const makeResponse = () => {
        const response = {
            status: jest.fn(),
            json: jest.fn(),
            set: jest.fn(),
        };

        response.status.mockReturnValue(response);
        response.json.mockReturnValue(response);
        response.set.mockReturnValue(response);

        return response;
    };

    beforeEach(() => {
        jest.clearAllMocks();

        req = {
            user: {
                _id: userId,
            },
            params: {
                id: notificationId.toString(),
            },
        };

        res = makeResponse();
    });

    describe('getNotifications', () => {
        test('returns the authenticated user notifications', async () => {
            const notifications = [
                makeNotification(),
                makeNotification({
                    _id: new mongoose.Types.ObjectId(),
                    read: true,
                }),
            ];

            const query = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue(notifications),
            };

            Notification.find.mockReturnValue(query);

            await getNotifications(req, res);

            expect(Notification.find).toHaveBeenCalledWith({
                recipient: userId,
            });

            expect(query.select).toHaveBeenCalledWith(
                'sender type title message link read createdAt'
            );

            expect(query.populate).toHaveBeenCalledWith(
                'sender',
                'name profilePhoto'
            );

            expect(query.sort).toHaveBeenCalledWith({
                createdAt: -1,
            });

            expect(query.limit).toHaveBeenCalledWith(50);
            expect(query.lean).toHaveBeenCalledTimes(1);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 2,
                data: notifications,
            });
        });

        test('returns an empty array when the user has no notifications', async () => {
            const query = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([]),
            };

            Notification.find.mockReturnValue(query);

            await getNotifications(req, res);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 0,
                data: [],
            });
        });

        test('limits the returned notifications to 50', async () => {
            const query = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockReturnThis(),
                sort: jest.fn().mockReturnThis(),
                limit: jest.fn().mockReturnThis(),
                lean: jest.fn().mockResolvedValue([]),
            };

            Notification.find.mockReturnValue(query);

            await getNotifications(req, res);

            expect(query.limit).toHaveBeenCalledWith(50);
        });
    });

    describe('getUnreadCount', () => {
        test('returns the authenticated user unread notification count', async () => {
            Notification.countDocuments.mockResolvedValue(4);

            await getUnreadCount(req, res);

            expect(Notification.countDocuments).toHaveBeenCalledWith({
                recipient: userId,
                read: false,
            });

            expect(res.set).toHaveBeenCalledWith(
                'Cache-Control',
                'private, max-age=5'
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 4,
            });
        });

        test('returns zero when there are no unread notifications', async () => {
            Notification.countDocuments.mockResolvedValue(0);

            await getUnreadCount(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                count: 0,
            });
        });
    });

    describe('markAsRead', () => {
        test('marks an unread notification as read', async () => {
            const notification = makeNotification();

            const query = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(notification),
            };

            Notification.findOne.mockReturnValue(query);

            await markAsRead(req, res);

            expect(Notification.findOne).toHaveBeenCalledWith({
                _id: notificationId.toString(),
                recipient: userId,
            });

            expect(query.select).toHaveBeenCalledWith(
                'sender type title message link read createdAt'
            );

            expect(query.populate).toHaveBeenCalledWith(
                'sender',
                'name profilePhoto'
            );

            expect(notification.read).toBe(true);
            expect(notification.save).toHaveBeenCalledTimes(1);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Notification marked as read.',
                data: notification,
            });
        });

        test('does not save a notification that is already read', async () => {
            const notification = makeNotification({
                read: true,
            });

            const query = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(notification),
            };

            Notification.findOne.mockReturnValue(query);

            await markAsRead(req, res);

            expect(notification.save).not.toHaveBeenCalled();
            expect(notification.read).toBe(true);

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('rejects an invalid notification ID', async () => {
            req.params.id = 'invalid-id';

            await expect(
                markAsRead(req, res)
            ).rejects.toMatchObject({
                message: 'Invalid notification ID.',
                statusCode: 400,
            });

            expect(Notification.findOne).not.toHaveBeenCalled();
        });

        test('returns a not-found error when the notification does not belong to the user', async () => {
            const query = {
                select: jest.fn().mockReturnThis(),
                populate: jest.fn().mockResolvedValue(null),
            };

            Notification.findOne.mockReturnValue(query);

            await expect(
                markAsRead(req, res)
            ).rejects.toMatchObject({
                message: 'Notification not found.',
                statusCode: 404,
            });
        });
    });

    describe('markAllAsRead', () => {
        test('marks all unread notifications belonging to the user as read', async () => {
            Notification.updateMany.mockResolvedValue({
                acknowledged: true,
                matchedCount: 5,
                modifiedCount: 5,
            });

            await markAllAsRead(req, res);

            expect(Notification.updateMany).toHaveBeenCalledWith(
                {
                    recipient: userId,
                    read: false,
                },
                {
                    $set: {
                        read: true,
                    },
                }
            );

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'All notifications marked as read.',
                modifiedCount: 5,
            });
        });

        test('returns zero when no notifications were modified', async () => {
            Notification.updateMany.mockResolvedValue({
                acknowledged: true,
                matchedCount: 0,
                modifiedCount: 0,
            });

            await markAllAsRead(req, res);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'All notifications marked as read.',
                modifiedCount: 0,
            });
        });

        test('defaults modifiedCount to zero when it is missing', async () => {
            Notification.updateMany.mockResolvedValue({
                acknowledged: true,
            });

            await markAllAsRead(req, res);

            expect(res.json).toHaveBeenCalledWith(
                expect.objectContaining({
                    modifiedCount: 0,
                })
            );
        });
    });

    describe('deleteNotification', () => {
        test('deletes a notification belonging to the authenticated user', async () => {
            const notification = makeNotification();

            Notification.findOne.mockResolvedValue(notification);

            await deleteNotification(req, res);

            expect(Notification.findOne).toHaveBeenCalledWith({
                _id: notificationId.toString(),
                recipient: userId,
            });

            expect(notification.deleteOne).toHaveBeenCalledTimes(1);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Notification deleted successfully.',
            });
        });

        test('rejects an invalid notification ID', async () => {
            req.params.id = 'invalid-id';

            await expect(
                deleteNotification(req, res)
            ).rejects.toMatchObject({
                message: 'Invalid notification ID.',
                statusCode: 400,
            });

            expect(Notification.findOne).not.toHaveBeenCalled();
        });

        test('does not delete a notification belonging to another user', async () => {
            Notification.findOne.mockResolvedValue(null);

            await expect(
                deleteNotification(req, res)
            ).rejects.toMatchObject({
                message: 'Notification not found.',
                statusCode: 404,
            });
        });
    });
});