const request = require('supertest');
const jwt = require('jsonwebtoken');
const session = require('express-session');

jest.mock('../../models/User', () => ({
    findById: jest.fn()
}));

jest.mock('../../models/Notification', () => ({
    find: jest.fn(),
    countDocuments: jest.fn(),
    findOne: jest.fn(),
    updateMany: jest.fn()
}));

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-for-roamagro-integration-tests';
process.env.SESSION_SECRET = 'test-session-secret-for-roamagro-integration-tests';
process.env.FRONTEND_URL = 'http://localhost:3000';

const User = require('../../models/User');
const Notification = require('../../models/Notification');
const createApp = require('../../app');

const USER_ID = '64b000000000000000000001';
const OTHER_USER_ID = '64b000000000000000000002';
const NOTIFICATION_ID = '64b000000000000000000003';
const OTHER_NOTIFICATION_ID = '64b000000000000000000004';

const authenticatedUser = {
    _id: USER_ID,
    name: 'Integration Test Farmer',
    email: 'farmer@example.com',
    role: 'farmer',
    accountStatus: 'active'
};

const createToken = (payload = { id: USER_ID }) =>
    jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });

const createNotification = (overrides = {}) => ({
    _id: NOTIFICATION_ID,
    recipient: USER_ID,
    sender: {
        _id: OTHER_USER_ID,
        name: 'Another Farmer',
        profilePhoto: ''
    },
    type: 'connection',
    title: 'New connection',
    message: 'Someone connected with you.',
    link: '/connections',
    read: false,
    createdAt: new Date('2026-01-01T10:00:00.000Z'),
    save: jest.fn().mockResolvedValue(undefined),
    deleteOne: jest.fn().mockResolvedValue(undefined),
    ...overrides
});

const createFindQuery = (result = []) => {
    const query = {
        select: jest.fn(),
        populate: jest.fn(),
        sort: jest.fn(),
        limit: jest.fn(),
        lean: jest.fn().mockResolvedValue(result)
    };

    query.select.mockReturnValue(query);
    query.populate.mockReturnValue(query);
    query.sort.mockReturnValue(query);
    query.limit.mockReturnValue(query);

    return query;
};

const createFindOneQuery = result => {
    const query = {
        select: jest.fn(),
        populate: jest.fn().mockResolvedValue(result)
    };

    query.select.mockReturnValue(query);

    return query;
};

describe('Notification API integration', () => {
    let app;
    let token;

    beforeEach(() => {
        jest.clearAllMocks();

        app = createApp({
            sessionStore: new session.MemoryStore()
        });

        token = createToken();

        User.findById.mockReturnValue({
            select: jest.fn().mockResolvedValue(authenticatedUser)
        });

        Notification.find.mockReturnValue(
            createFindQuery([])
        );

        Notification.countDocuments.mockResolvedValue(0);

        Notification.findOne.mockReturnValue(
            createFindOneQuery(null)
        );

        Notification.updateMany.mockResolvedValue({
            acknowledged: true,
            modifiedCount: 0
        });
    });

    describe('GET /api/v1/notifications', () => {
        it('rejects requests without an authorization token', async () => {
            const response = await request(app)
                .get('/api/v1/notifications');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                'Authorization token missing.'
            );
            expect(User.findById).not.toHaveBeenCalled();
            expect(Notification.find).not.toHaveBeenCalled();
        });

        it('rejects invalid authorization tokens', async () => {
            const response = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                'Invalid or expired authorization token.'
            );
            expect(Notification.find).not.toHaveBeenCalled();
        });

        it('returns notifications for the authenticated user', async () => {
            const notification = createNotification();

            Notification.find.mockReturnValue(
                createFindQuery([notification])
            );

            const response = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(1);
            expect(response.body.data).toHaveLength(1);
            expect(response.body.data[0].title).toBe(
                'New connection'
            );

            expect(Notification.find).toHaveBeenCalledWith({
                recipient: USER_ID
            });
        });

        it('returns an empty list when the user has no notifications', async () => {
            const response = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.count).toBe(0);
            expect(response.body.data).toEqual([]);
        });

        it('limits retrieval to the 50 most recent notifications', async () => {
            const query = createFindQuery([]);

            Notification.find.mockReturnValue(query);

            const response = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(query.sort).toHaveBeenCalledWith({
                createdAt: -1
            });
            expect(query.limit).toHaveBeenCalledWith(50);
            expect(query.lean).toHaveBeenCalled();
        });

        it('rejects access when the token user no longer exists', async () => {
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            const response = await request(app)
                .get('/api/v1/notifications')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('User not found.');
            expect(Notification.find).not.toHaveBeenCalled();
        });
    });

    describe('GET /api/v1/notifications/unread-count', () => {
        it('returns the unread notification count', async () => {
            Notification.countDocuments.mockResolvedValue(4);

            const response = await request(app)
                .get('/api/v1/notifications/unread-count')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                count: 4
            });

            expect(Notification.countDocuments).toHaveBeenCalledWith({
                recipient: USER_ID,
                read: false
            });
        });

        it('sets a private cache-control header', async () => {
            const response = await request(app)
                .get('/api/v1/notifications/unread-count')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.headers['cache-control']).toContain(
                'private'
            );
            expect(response.headers['cache-control']).toContain(
                'max-age=5'
            );
        });

        it('requires authentication', async () => {
            const response = await request(app)
                .get('/api/v1/notifications/unread-count');

            expect(response.status).toBe(401);
            expect(Notification.countDocuments).not.toHaveBeenCalled();
        });
    });

    describe('PATCH /api/v1/notifications/:id/read', () => {
        it('rejects invalid notification IDs', async () => {
            const response = await request(app)
                .patch('/api/v1/notifications/not-a-valid-id/read')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'Invalid notification ID.'
            );
            expect(Notification.findOne).not.toHaveBeenCalled();
        });

        it('marks an unread notification as read', async () => {
            const notification = createNotification({
                read: false
            });

            Notification.findOne.mockReturnValue(
                createFindOneQuery(notification)
            );

            const response = await request(app)
                .patch(`/api/v1/notifications/${NOTIFICATION_ID}/read`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(
                'Notification marked as read.'
            );
            expect(notification.read).toBe(true);
            expect(notification.save).toHaveBeenCalledTimes(1);

            expect(Notification.findOne).toHaveBeenCalledWith({
                _id: NOTIFICATION_ID,
                recipient: USER_ID
            });
        });

        it('does not save a notification that is already read', async () => {
            const notification = createNotification({
                read: true
            });

            Notification.findOne.mockReturnValue(
                createFindOneQuery(notification)
            );

            const response = await request(app)
                .patch(`/api/v1/notifications/${NOTIFICATION_ID}/read`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(notification.save).not.toHaveBeenCalled();
        });

        it('returns 404 when the notification is not found for the user', async () => {
            Notification.findOne.mockReturnValue(
                createFindOneQuery(null)
            );

            const response = await request(app)
                .patch(`/api/v1/notifications/${NOTIFICATION_ID}/read`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe(
                'Notification not found.'
            );

            expect(Notification.findOne).toHaveBeenCalledWith({
                _id: NOTIFICATION_ID,
                recipient: USER_ID
            });
        });

        it('requires authentication', async () => {
            const response = await request(app)
                .patch(`/api/v1/notifications/${NOTIFICATION_ID}/read`);

            expect(response.status).toBe(401);
            expect(Notification.findOne).not.toHaveBeenCalled();
        });
    });

    describe('PATCH /api/v1/notifications/read-all', () => {
        it('marks all unread notifications as read', async () => {
            Notification.updateMany.mockResolvedValue({
                acknowledged: true,
                modifiedCount: 3
            });

            const response = await request(app)
                .patch('/api/v1/notifications/read-all')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'All notifications marked as read.',
                modifiedCount: 3
            });

            expect(Notification.updateMany).toHaveBeenCalledWith(
                {
                    recipient: USER_ID,
                    read: false
                },
                {
                    $set: {
                        read: true
                    }
                }
            );
        });

        it('handles the case where no notifications need updating', async () => {
            const response = await request(app)
                .patch('/api/v1/notifications/read-all')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.modifiedCount).toBe(0);
        });

        it('requires authentication', async () => {
            const response = await request(app)
                .patch('/api/v1/notifications/read-all');

            expect(response.status).toBe(401);
            expect(Notification.updateMany).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/v1/notifications/:id', () => {
        it('rejects invalid notification IDs', async () => {
            const response = await request(app)
                .delete('/api/v1/notifications/invalid-id')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(400);
            expect(response.body.message).toBe(
                'Invalid notification ID.'
            );
            expect(Notification.findOne).not.toHaveBeenCalled();
        });

        it('deletes a notification belonging to the authenticated user', async () => {
            const notification = createNotification();

            Notification.findOne.mockResolvedValue(notification);

            const response = await request(app)
                .delete(`/api/v1/notifications/${NOTIFICATION_ID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                success: true,
                message: 'Notification deleted successfully.'
            });

            expect(Notification.findOne).toHaveBeenCalledWith({
                _id: NOTIFICATION_ID,
                recipient: USER_ID
            });

            expect(notification.deleteOne).toHaveBeenCalledTimes(1);
        });

        it('cannot delete a notification belonging to another user', async () => {
            Notification.findOne.mockResolvedValue(null);

            const response = await request(app)
                .delete(`/api/v1/notifications/${OTHER_NOTIFICATION_ID}`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe(
                'Notification not found.'
            );

            expect(Notification.findOne).toHaveBeenCalledWith({
                _id: OTHER_NOTIFICATION_ID,
                recipient: USER_ID
            });
        });

        it('requires authentication', async () => {
            const response = await request(app)
                .delete(`/api/v1/notifications/${NOTIFICATION_ID}`);

            expect(response.status).toBe(401);
            expect(Notification.findOne).not.toHaveBeenCalled();
        });
    });

    describe('Shared API behavior', () => {
        it('serves the API health endpoint', async () => {
            const response = await request(app)
                .get('/api/v1/health');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.message).toBe(
                'RoamAgro API is running.'
            );
            expect(response.body.timestamp).toBeDefined();
        });

        it('returns 404 for an unknown API route', async () => {
            const response = await request(app)
                .get('/api/v1/route-that-does-not-exist');

            expect(response.status).toBe(404);
            expect(response.body.success).toBe(false);
        });

        it('rejects requests from disallowed browser origins', async () => {
            const response = await request(app)
                .get('/api/v1/health')
                .set('Origin', 'https://untrusted.example');

            expect(response.status).toBe(403);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toBe(
                'Origin not allowed by CORS.'
            );
        });

        it('returns a consistent error response for malformed JSON', async () => {
            const response = await request(app)
                .post('/api/v1/auth/register')
                .set('Content-Type', 'application/json')
                .send('{"invalid":');

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.status).toBe('fail');
            expect(response.body.message).toBe(
                'Invalid JSON request body.'
            );
        });
    });
});