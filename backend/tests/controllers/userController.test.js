const User = require('../../models/User');
const CommunityPost = require('../../models/CommunityPost');
const MarketplaceItem = require('../../models/MarketplaceItem');
const UserReport = require('../../models/UserReport');
const userController = require('../../controllers/userController');

jest.mock('../../models/User', () => ({
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn()
}));

jest.mock('../../models/UserReport', () => ({
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    deleteMany: jest.fn()
}));

jest.mock('../../models/CommunityPost', () => ({
    find: jest.fn(),
    countDocuments: jest.fn(),
    deleteMany: jest.fn(),
    updateMany: jest.fn(),
    updateOne: jest.fn()
}));

jest.mock('../../models/MarketplaceItem', () => ({
    find: jest.fn(),
    countDocuments: jest.fn(),
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
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    deleteMany: jest.fn()
}));

jest.mock('../../models/PriceAlert', () => ({
    deleteMany: jest.fn()
}));

jest.mock('../../models/PriceIndex', () => ({
    deleteMany: jest.fn()
}));

const createQuery = result => {
    const query = {};

    [
        'select',
        'populate',
        'sort',
        'skip',
        'limit',
        'session',
        'lean'
    ].forEach(method => {
        query[method] = jest.fn(() => query);
    });

    query.then = (resolve, reject) =>
        Promise.resolve(result).then(resolve, reject);

    return query;
};

const createResponse = () => {
    const res = {};

    res.status = jest.fn(() => res);
    res.json = jest.fn(() => res);

    return res;
};

const createRequest = (overrides = {}) => ({
    user: {
        _id: '507f1f77bcf86cd799439011',
        role: 'farmer'
    },
    params: {},
    query: {},
    body: {},
    ...overrides
});

const createNext = () => jest.fn();

const expectControllerError = async (controller, req, res) => {
    const next = createNext();

    await controller(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    return next.mock.calls[0][0];
};

describe('userController profile and search', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getProfile', () => {
        test('returns the profile, statistics, and recent content', async () => {
            const userId = '507f1f77bcf86cd799439011';

            const user = {
                _id: userId,
                name: 'Test Farmer',
                email: 'farmer@example.com',
                role: 'farmer'
            };

            const posts = [
                {
                    _id: 'post1',
                    content: 'My farming update'
                }
            ];

            const listings = [
                {
                    _id: 'listing1',
                    title: 'Fresh maize'
                }
            ];

            const profileQuery = createQuery(user);
            const postsQuery = createQuery(posts);
            const listingsQuery = createQuery(listings);

            User.findById.mockReturnValue(profileQuery);

            CommunityPost.countDocuments.mockResolvedValue(5);
            MarketplaceItem.countDocuments.mockResolvedValue(3);

            CommunityPost.find.mockReturnValue(postsQuery);
            MarketplaceItem.find.mockReturnValue(listingsQuery);

            const req = createRequest();
            const res = createResponse();
            const next = createNext();

            await userController.getProfile(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(User.findById).toHaveBeenCalledWith(userId);

            expect(profileQuery.select).toHaveBeenCalledWith(
                '-password -googleId -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires'
            );

            expect(profileQuery.lean).toHaveBeenCalled();

            expect(CommunityPost.countDocuments).toHaveBeenCalledWith({
                user: userId,
                status: 'Active'
            });

            expect(MarketplaceItem.countDocuments).toHaveBeenCalledWith({
                user: userId,
                available: true
            });

            expect(postsQuery.limit).toHaveBeenCalledWith(3);
            expect(listingsQuery.limit).toHaveBeenCalledWith(3);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    ...user,
                    communityPosts: posts,
                    marketplaceListings: listings,
                    stats: {
                        communityPosts: 5,
                        marketplaceListings: 3
                    }
                }
            });
        });

        test('returns an error when the profile does not exist', async () => {
            User.findById.mockReturnValue(createQuery(null));

            CommunityPost.countDocuments.mockResolvedValue(0);
            MarketplaceItem.countDocuments.mockResolvedValue(0);

            CommunityPost.find.mockReturnValue(createQuery([]));
            MarketplaceItem.find.mockReturnValue(createQuery([]));

            const req = createRequest();
            const res = createResponse();

            const error = await expectControllerError(
                userController.getProfile,
                req,
                res
            );

            expect(error.message).toBe('User profile not found.');
            expect(error.statusCode || error.status).toBe(404);
            expect(res.json).not.toHaveBeenCalled();
        });
    });

    describe('updateProfile', () => {
        test('updates permitted fields and excludes protected fields', async () => {
            const userId = '507f1f77bcf86cd799439011';

            const updatedUser = {
                _id: userId,
                name: 'Updated Farmer',
                bio: 'I grow maize.'
            };

            const updateQuery = createQuery(updatedUser);

            User.findByIdAndUpdate.mockReturnValue(updateQuery);

            const req = createRequest({
                body: {
                    name: '  Updated Farmer  ',
                    bio: '  I grow maize.  ',
                    role: 'admin',
                    email: 'attacker@example.com',
                    password: 'not-allowed'
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                userId,
                {
                    $set: {
                        name: 'Updated Farmer',
                        bio: 'I grow maize.'
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            expect(updateQuery.select).toHaveBeenCalledWith(
                '-password -googleId -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires'
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Profile updated successfully.',
                data: updatedUser
            });
        });

        test('rejects an empty update', async () => {
            const req = createRequest({
                body: {}
            });

            const res = createResponse();

            const error = await expectControllerError(
                userController.updateProfile,
                req,
                res
            );

            expect(error.message).toBe(
                'No profile information was provided.'
            );

            expect(error.statusCode || error.status).toBe(400);

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects a name shorter than two characters', async () => {
            const req = createRequest({
                body: {
                    name: 'A'
                }
            });

            const res = createResponse();

            const error = await expectControllerError(
                userController.updateProfile,
                req,
                res
            );

            expect(error.message).toBe(
                'Name must be between 2 and 100 characters.'
            );

            expect(error.statusCode || error.status).toBe(400);

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects an unsupported language', async () => {
            const req = createRequest({
                body: {
                    language: 'French'
                }
            });

            const res = createResponse();

            const error = await expectControllerError(
                userController.updateProfile,
                req,
                res
            );

            expect(error.message).toBe('Invalid language.');

            expect(error.statusCode || error.status).toBe(400);

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects a non-string profile field', async () => {
            const req = createRequest({
                body: {
                    name: 123
                }
            });

            const res = createResponse();

            const error = await expectControllerError(
                userController.updateProfile,
                req,
                res
            );

            expect(error.message).toBe('name must be text.');

            expect(error.statusCode || error.status).toBe(400);

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('returns an error when the account no longer exists', async () => {
            User.findByIdAndUpdate.mockReturnValue(createQuery(null));

            const req = createRequest({
                body: {
                    name: 'Updated Farmer'
                }
            });

            const res = createResponse();

            const error = await expectControllerError(
                userController.updateProfile,
                req,
                res
            );

            expect(error.message).toBe('User profile not found.');

            expect(error.statusCode || error.status).toBe(404);
        });
    });

    describe('searchUsers', () => {
        test('returns an empty result when no search term is provided', async () => {
            const req = createRequest({
                query: {
                    search: '   '
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.searchUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(User.countDocuments).not.toHaveBeenCalled();
            expect(User.find).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 0,
                    pages: 0
                }
            });
        });

        test('limits pagination and excludes the current user', async () => {
            const users = [
                {
                    _id: '507f1f77bcf86cd799439012',
                    name: 'Another Farmer'
                }
            ];

            User.countDocuments.mockResolvedValue(101);
            User.find.mockReturnValue(createQuery(users));

            const req = createRequest({
                query: {
                    search: 'maize',
                    page: '-4',
                    limit: '500'
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.searchUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(User.countDocuments).toHaveBeenCalledTimes(1);

            const searchQuery = User.countDocuments.mock.calls[0][0];

            expect(String(searchQuery._id.$ne)).toBe(
                '507f1f77bcf86cd799439011'
            );

            expect(searchQuery.accountStatus).toBe('active');
            expect(searchQuery.$or).toHaveLength(4);

            expect(User.find).toHaveBeenCalledWith(searchQuery);

            const resultQuery = User.find.mock.results[0].value;

            expect(resultQuery.skip).toHaveBeenCalledWith(0);
            expect(resultQuery.limit).toHaveBeenCalledWith(50);

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: users,
                pagination: {
                    page: 1,
                    limit: 50,
                    total: 101,
                    pages: 3
                }
            });
        });
    });

    describe('getUserById', () => {
        test('includes private profile contact fields when retrieving own profile', async () => {
            const userId = '507f1f77bcf86cd799439011';

            const user = {
                _id: userId,
                name: 'Test Farmer',
                email: 'farmer@example.com',
                phone: '08000000000'
            };

            const userQuery = createQuery(user);

            User.findOne.mockReturnValue(userQuery);

            const req = createRequest({
                params: {
                    userId
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.getUserById(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(User.findOne).toHaveBeenCalledWith({
                _id: userId,
                accountStatus: 'active'
            });

            expect(userQuery.select).toHaveBeenCalledWith(
                'name email profilePhoto bio phone state lga location language role createdAt'
            );

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    ...user,
                    isSelf: true
                }
            });
        });

        test('does not request email or phone when viewing another user', async () => {
            const userId = '507f1f77bcf86cd799439012';

            const user = {
                _id: userId,
                name: 'Another Farmer',
                bio: 'Growing rice.'
            };

            const userQuery = createQuery(user);

            User.findOne.mockReturnValue(userQuery);

            const req = createRequest({
                params: {
                    userId
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.getUserById(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(userQuery.select).toHaveBeenCalledWith(
                'name profilePhoto bio state lga location language role createdAt'
            );

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: {
                    ...user,
                    isSelf: false
                }
            });
        });

        test('rejects an invalid user ID', async () => {
            const req = createRequest({
                params: {
                    userId: 'not-a-valid-object-id'
                }
            });

            const res = createResponse();

            const error = await expectControllerError(
                userController.getUserById,
                req,
                res
            );

            expect(error.message).toBe('Invalid user ID.');

            expect(error.statusCode || error.status).toBe(400);

            expect(User.findOne).not.toHaveBeenCalled();
        });

        test('returns an error when the requested user does not exist', async () => {
            User.findOne.mockReturnValue(createQuery(null));

            const req = createRequest({
                params: {
                    userId: '507f1f77bcf86cd799439012'
                }
            });

            const res = createResponse();

            const error = await expectControllerError(
                userController.getUserById,
                req,
                res
            );

            expect(error.message).toBe('User not found.');

            expect(error.statusCode || error.status).toBe(404);
        });
    });

    describe('searchAdminUsers', () => {
        test('returns an empty result when the search term is empty', async () => {
            const req = createRequest({ query: { search: '   ' } });
            const res = createResponse();
            const next = createNext();

            await userController.searchAdminUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(User.find).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: [] });
        });

        test('rejects a non-empty search term shorter than two characters', async () => {
            const req = createRequest({ query: { search: 'a' } });
            const error = await expectControllerError(
                userController.searchAdminUsers, req, createResponse()
            );

            expect(error.message).toBe('Search must contain at least 2 characters.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.find).not.toHaveBeenCalled();
        });

        test('searches by name or email and limits results to 25', async () => {
            const users = [{ _id: '507f1f77bcf86cd799439012', name: 'Amina' }];
            User.find.mockReturnValue(createQuery(users));
            const req = createRequest({ query: { search: 'Amina' } });
            const res = createResponse();
            const next = createNext();

            await userController.searchAdminUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(User.find).toHaveBeenCalledTimes(1);
            expect(User.find.mock.calls[0][0].$or).toHaveLength(2);
            expect(User.find.mock.calls[0][0].$or[0].name).toBeInstanceOf(RegExp);
            expect(User.find.mock.calls[0][0].$or[1].email).toBeInstanceOf(RegExp);
            const query = User.find.mock.results[0].value;
            expect(query.select).toHaveBeenCalledWith(
                'name email profilePhoto role isVerified accountStatus createdAt'
            );
            expect(query.sort).toHaveBeenCalledWith({ name: 1 });
            expect(query.limit).toHaveBeenCalledWith(25);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ success: true, data: users });
        });
    });

    describe('reportUser', () => {
        const reportedUserId = '507f1f77bcf86cd799439012';

        test('rejects an invalid user ID', async () => {
            const error = await expectControllerError(
                userController.reportUser,
                createRequest({ params: { userId: 'invalid-id' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid user ID.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.findOne).not.toHaveBeenCalled();
        });

        test('prevents users from reporting themselves', async () => {
            const error = await expectControllerError(
                userController.reportUser,
                createRequest({ params: { userId: '507f1f77bcf86cd799439011' } }),
                createResponse()
            );
            expect(error.message).toBe('You cannot report your own account.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.findOne).not.toHaveBeenCalled();
        });

        test('returns not found when the reported account is not active or does not exist', async () => {
            User.findOne.mockResolvedValue(null);
            const error = await expectControllerError(
                userController.reportUser,
                createRequest({ params: { userId: reportedUserId }, body: { reason: 'Spam' } }),
                createResponse()
            );
            expect(User.findOne).toHaveBeenCalledWith({ _id: reportedUserId, accountStatus: 'active' });
            expect(error.message).toBe('User not found.');
            expect(error.statusCode || error.status).toBe(404);
            expect(UserReport.create).not.toHaveBeenCalled();
        });

        test('rejects a duplicate report', async () => {
            User.findOne.mockResolvedValue({ _id: reportedUserId });
            UserReport.findOne.mockResolvedValue({ _id: 'existing-report' });
            const error = await expectControllerError(
                userController.reportUser,
                createRequest({ params: { userId: reportedUserId }, body: { reason: 'Spam' } }),
                createResponse()
            );
            expect(UserReport.findOne).toHaveBeenCalledWith({
                reporter: '507f1f77bcf86cd799439011',
                reportedUser: reportedUserId
            });
            expect(error.message).toBe('You have already reported this user.');
            expect(error.statusCode || error.status).toBe(409);
            expect(UserReport.create).not.toHaveBeenCalled();
        });

        test('creates a report and returns its ID', async () => {
            User.findOne.mockResolvedValue({ _id: reportedUserId });
            UserReport.findOne.mockResolvedValue(null);
            UserReport.create.mockResolvedValue({ _id: '507f1f77bcf86cd799439013' });
            const req = createRequest({
                params: { userId: reportedUserId },
                body: { reason: 'Spam', details: '  Repeated spam posts  ' }
            });
            const res = createResponse();
            const next = createNext();

            await userController.reportUser(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(UserReport.create).toHaveBeenCalledWith({
                reporter: '507f1f77bcf86cd799439011',
                reportedUser: reportedUserId,
                reason: 'Spam',
                details: 'Repeated spam posts'
            });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Report submitted successfully.',
                data: { id: '507f1f77bcf86cd799439013' }
            });
        });
    });

    describe('getReports', () => {
        test('returns paginated reports using default pagination', async () => {
            const reports = [{ _id: 'report-1' }];
            UserReport.find.mockReturnValue(createQuery(reports));
            UserReport.countDocuments.mockResolvedValue(21);
            const req = createRequest();
            const res = createResponse();
            const next = createNext();

            await userController.getReports(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(UserReport.find).toHaveBeenCalledWith({});
            const query = UserReport.find.mock.results[0].value;
            expect(query.populate).toHaveBeenCalledTimes(3);
            expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
            expect(query.skip).toHaveBeenCalledWith(0);
            expect(query.limit).toHaveBeenCalledWith(20);
            expect(UserReport.countDocuments).toHaveBeenCalledWith({});
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: reports,
                pagination: { page: 1, limit: 20, total: 21, pages: 2 }
            });
        });

        test('applies a valid status filter and caps pagination', async () => {
            UserReport.find.mockReturnValue(createQuery([]));
            UserReport.countDocuments.mockResolvedValue(0);
            const req = createRequest({ query: { status: 'Reviewed', page: '3', limit: '500' } });
            const res = createResponse();
            const next = createNext();

            await userController.getReports(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(UserReport.find).toHaveBeenCalledWith({ status: 'Reviewed' });
            const query = UserReport.find.mock.results[0].value;
            expect(query.skip).toHaveBeenCalledWith(100);
            expect(query.limit).toHaveBeenCalledWith(50);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: { page: 3, limit: 50, total: 0, pages: 0 }
            });
        });

        test('rejects an unsupported status filter', async () => {
            const error = await expectControllerError(
                userController.getReports,
                createRequest({ query: { status: 'Unknown' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid report status.');
            expect(error.statusCode || error.status).toBe(400);
            expect(UserReport.find).not.toHaveBeenCalled();
        });
    });

    describe('updateReport', () => {
        const reportId = '507f1f77bcf86cd799439013';

        test('rejects an unsupported report status', async () => {
            const error = await expectControllerError(
                userController.updateReport,
                createRequest({ params: { reportId }, body: { status: 'Unknown' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid report status.');
            expect(error.statusCode || error.status).toBe(400);
            expect(UserReport.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects an invalid report ID', async () => {
            const error = await expectControllerError(
                userController.updateReport,
                createRequest({ params: { reportId: 'bad-id' }, body: { status: 'Reviewed' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid report ID.');
            expect(error.statusCode || error.status).toBe(400);
            expect(UserReport.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('returns not found when the report does not exist', async () => {
            UserReport.findByIdAndUpdate.mockResolvedValue(null);
            const error = await expectControllerError(
                userController.updateReport,
                createRequest({ params: { reportId }, body: { status: 'Reviewed' } }),
                createResponse()
            );
            expect(error.message).toBe('Report not found.');
            expect(error.statusCode || error.status).toBe(404);
        });

        test('updates report status and records the reviewing admin', async () => {
            const report = { _id: reportId, status: 'Reviewed' };
            UserReport.findByIdAndUpdate.mockResolvedValue(report);
            const req = createRequest({
                user: { _id: '507f1f77bcf86cd799439011', role: 'admin' },
                params: { reportId },
                body: { status: 'Reviewed' }
            });
            const res = createResponse();
            const next = createNext();

            await userController.updateReport(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(UserReport.findByIdAndUpdate).toHaveBeenCalledWith(
                reportId,
                expect.objectContaining({
                    status: 'Reviewed',
                    reviewedBy: req.user._id,
                    reviewedAt: expect.any(Date)
                }),
                { new: true, runValidators: true }
            );
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Report updated successfully.',
                data: report
            });
        });
    });

    describe('updateUserRole', () => {
        const userId = '507f1f77bcf86cd799439012';

        test('rejects an invalid user ID', async () => {
            const error = await expectControllerError(
                userController.updateUserRole,
                createRequest({ params: { userId: 'invalid' }, body: { role: 'buyer' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid user ID.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.findById).not.toHaveBeenCalled();
        });

        test('rejects an unsupported role', async () => {
            const error = await expectControllerError(
                userController.updateUserRole,
                createRequest({ params: { userId }, body: { role: 'superuser' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid user role.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.findById).not.toHaveBeenCalled();
        });

        test('prevents administrators from changing their own role', async () => {
            const error = await expectControllerError(
                userController.updateUserRole,
                createRequest({ params: { userId: '507f1f77bcf86cd799439011' }, body: { role: 'buyer' } }),
                createResponse()
            );
            expect(error.message).toBe('You cannot change your own role.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.findById).not.toHaveBeenCalled();
        });

        test('returns not found when the target user does not exist', async () => {
            User.findById.mockResolvedValue(null);
            const error = await expectControllerError(
                userController.updateUserRole,
                createRequest({ params: { userId }, body: { role: 'buyer' } }),
                createResponse()
            );
            expect(error.message).toBe('User not found.');
            expect(error.statusCode || error.status).toBe(404);
        });

        test('returns successfully without saving when the role is unchanged', async () => {
            const user = {
                _id: userId, name: 'Buyer', email: 'buyer@example.com',
                role: 'buyer', accountStatus: 'active', save: jest.fn()
            };
            User.findById.mockResolvedValue(user);
            const res = createResponse();
            const next = createNext();

            await userController.updateUserRole(
                createRequest({ params: { userId }, body: { role: 'buyer' } }), res, next
            );

            expect(next).not.toHaveBeenCalled();
            expect(user.save).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User already has this role.',
                data: { _id: userId, name: 'Buyer', email: 'buyer@example.com', role: 'buyer', accountStatus: 'active' }
            });
        });

        test('updates a user role successfully', async () => {
            const user = {
                _id: userId, name: 'Farmer', email: 'farmer@example.com',
                role: 'farmer', accountStatus: 'active', save: jest.fn().mockResolvedValue(undefined)
            };
            User.findById.mockResolvedValue(user);
            const res = createResponse();
            const next = createNext();

            await userController.updateUserRole(
                createRequest({ params: { userId }, body: { role: 'extension_officer' } }), res, next
            );

            expect(next).not.toHaveBeenCalled();
            expect(user.role).toBe('extension_officer');
            expect(user.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User role updated successfully.',
                data: { _id: userId, name: 'Farmer', email: 'farmer@example.com', role: 'extension_officer', accountStatus: 'active' }
            });
        });
    });

    describe('suspendUser', () => {
        const userId = '507f1f77bcf86cd799439012';

        test('rejects an invalid user ID', async () => {
            const error = await expectControllerError(
                userController.suspendUser,
                createRequest({ params: { userId: 'invalid' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid user ID.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.findById).not.toHaveBeenCalled();
        });

        test('returns not found when the target user does not exist', async () => {
            User.findById.mockResolvedValue(null);
            const error = await expectControllerError(
                userController.suspendUser,
                createRequest({ params: { userId } }),
                createResponse()
            );
            expect(error.message).toBe('User not found.');
            expect(error.statusCode || error.status).toBe(404);
        });

        test('prevents suspending the current user', async () => {
            const user = { _id: '507f1f77bcf86cd799439011', role: 'farmer' };
            User.findById.mockResolvedValue(user);
            const error = await expectControllerError(
                userController.suspendUser,
                createRequest({ params: { userId: user._id } }),
                createResponse()
            );
            expect(error.message).toBe('You cannot suspend your own account.');
            expect(error.statusCode || error.status).toBe(400);
        });

        test('prevents suspending an administrator account', async () => {
            User.findById.mockResolvedValue({ _id: userId, role: 'admin' });
            const error = await expectControllerError(
                userController.suspendUser,
                createRequest({ params: { userId } }),
                createResponse()
            );
            expect(error.message).toBe('Administrator accounts cannot be suspended here.');
            expect(error.statusCode || error.status).toBe(400);
        });

        test('rejects an invalid suspension duration', async () => {
            User.findById.mockResolvedValue({ _id: userId, role: 'farmer' });
            const error = await expectControllerError(
                userController.suspendUser,
                createRequest({ params: { userId }, body: { durationDays: 3651 } }),
                createResponse()
            );
            expect(error.message).toBe('Suspension duration must be between 1 and 3650 days.');
            expect(error.statusCode || error.status).toBe(400);
        });

        test('suspends a user with a reason and duration', async () => {
            const user = {
                _id: userId, role: 'farmer', accountStatus: 'active',
                save: jest.fn().mockResolvedValue(undefined)
            };
            User.findById.mockResolvedValue(user);
            const before = Date.now();
            const res = createResponse();
            const next = createNext();

            await userController.suspendUser(
                createRequest({ params: { userId }, body: { reason: '  Repeated abuse  ', durationDays: 7 } }),
                res, next
            );

            expect(next).not.toHaveBeenCalled();
            expect(user.accountStatus).toBe('suspended');
            expect(user.suspensionReason).toBe('Repeated abuse');
            expect(user.suspendedAt).toBeInstanceOf(Date);
            expect(user.suspendedUntil).toBeInstanceOf(Date);
            expect(user.suspendedUntil.getTime()).toBeGreaterThanOrEqual(before + 7 * 24 * 60 * 60 * 1000);
            expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User suspended successfully.',
                data: { userId, accountStatus: 'suspended', suspendedUntil: user.suspendedUntil }
            });
        });

        test('supports an indefinite suspension when duration is omitted', async () => {
            const user = {
                _id: userId, role: 'buyer', save: jest.fn().mockResolvedValue(undefined)
            };
            User.findById.mockResolvedValue(user);
            const res = createResponse();
            const next = createNext();

            await userController.suspendUser(createRequest({ params: { userId } }), res, next);

            expect(next).not.toHaveBeenCalled();
            expect(user.accountStatus).toBe('suspended');
            expect(user.suspendedUntil).toBeNull();
            expect(user.suspensionReason).toBe('');
            expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
        });
    });

    describe('restoreUser', () => {
        const userId = '507f1f77bcf86cd799439012';

        test('rejects an invalid user ID', async () => {
            const error = await expectControllerError(
                userController.restoreUser,
                createRequest({ params: { userId: 'invalid' } }),
                createResponse()
            );
            expect(error.message).toBe('Invalid user ID.');
            expect(error.statusCode || error.status).toBe(400);
            expect(User.findById).not.toHaveBeenCalled();
        });

        test('returns not found when the target user does not exist', async () => {
            User.findById.mockResolvedValue(null);
            const error = await expectControllerError(
                userController.restoreUser,
                createRequest({ params: { userId } }),
                createResponse()
            );
            expect(error.message).toBe('User not found.');
            expect(error.statusCode || error.status).toBe(404);
        });

        test('restores a user and clears suspension fields', async () => {
            const user = {
                _id: userId, accountStatus: 'suspended', suspensionReason: 'Abuse',
                suspendedAt: new Date(), suspendedUntil: new Date(),
                save: jest.fn().mockResolvedValue(undefined)
            };
            User.findById.mockResolvedValue(user);
            const res = createResponse();
            const next = createNext();

            await userController.restoreUser(createRequest({ params: { userId } }), res, next);

            expect(next).not.toHaveBeenCalled();
            expect(user.accountStatus).toBe('active');
            expect(user.suspensionReason).toBe('');
            expect(user.suspendedAt).toBeNull();
            expect(user.suspendedUntil).toBeNull();
            expect(user.save).toHaveBeenCalledWith({ validateBeforeSave: false });
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User account restored successfully.',
                data: { userId, accountStatus: 'active' }
            });
        });
    });

});