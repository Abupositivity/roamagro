jest.mock('../../models/User', () => ({
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    exists: jest.fn()
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
    updateOne: jest.fn(),
    exists: jest.fn()
}));

jest.mock('../../models/MarketplaceItem', () => ({
    find: jest.fn(),
    countDocuments: jest.fn(),
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
    updateMany: jest.fn(),
    updateOne: jest.fn(),
    deleteMany: jest.fn(),
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
const CommunityPost = require('../../models/CommunityPost');
const MarketplaceItem = require('../../models/MarketplaceItem');
const UserReport = require('../../models/UserReport');
const AgriTip = require('../../models/AgriTip');
const {
    uploadImage,
    deleteImage
} = require('../../utils/cloudinaryStorage');
const userController = require('../../controllers/userController');

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f1f77bcf86cd799439012';
const REPORT_ID = '507f1f77bcf86cd799439013';

const PROFILE_IMAGE_URL =
    'https://res.cloudinary.com/test/image/upload/profile-new.jpg';

const PROFILE_IMAGE_PUBLIC_ID =
    'roamagro/profiles/profile-new';

const OLD_PROFILE_IMAGE_URL =
    'https://res.cloudinary.com/test/image/upload/profile-old.jpg';

const OLD_PROFILE_IMAGE_PUBLIC_ID =
    'roamagro/profiles/profile-old';

const PRIVATE_FIELDS =
    '-password -googleId -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires';

const createQuery = (result) => {
    const query = {};

    [
        'select',
        'populate',
        'sort',
        'skip',
        'limit',
        'session',
        'lean'
    ].forEach((method) => {
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
        _id: USER_ID,
        role: 'farmer'
    },
    params: {},
    query: {},
    body: {},
    ...overrides
});

const createNext = () => jest.fn();

const createFile = () => ({
    fieldname: 'profilePhoto',
    originalname: 'profile.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    buffer: Buffer.from('test-profile-image'),
    size: 18
});

const createCurrentUser = (overrides = {}) => ({
    _id: USER_ID,
    name: 'Test Farmer',
    email: 'farmer@example.com',
    role: 'farmer',
    profilePhoto: '',
    profilePhotoPublicId: '',
    ...overrides
});

const expectControllerError = async (controller, req, res) => {
    const next = createNext();

    await controller(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);

    return next.mock.calls[0][0];
};

const expectError = async (
    controller,
    req,
    message,
    statusCode
) => {
    const res = createResponse();

    const error = await expectControllerError(
        controller,
        req,
        res
    );

    expect(error.message).toBe(message);
    expect(error.statusCode || error.status).toBe(statusCode);
    expect(res.json).not.toHaveBeenCalled();

    return error;
};

describe('userController profile and search', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        User.exists.mockResolvedValue(null);
        CommunityPost.exists.mockResolvedValue(null);
        AgriTip.exists.mockResolvedValue(null);
        MarketplaceItem.exists.mockResolvedValue(null);

        uploadImage.mockResolvedValue({
            url: PROFILE_IMAGE_URL,
            publicId: PROFILE_IMAGE_PUBLIC_ID
        });

        deleteImage.mockResolvedValue({
            result: 'ok'
        });
    });

    describe('getProfile', () => {
        test('returns the profile, statistics, and recent content', async () => {
            const user = {
                _id: USER_ID,
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

            expect(User.findById).toHaveBeenCalledWith(USER_ID);

            expect(profileQuery.select).toHaveBeenCalledWith(
                PRIVATE_FIELDS
            );

            expect(profileQuery.lean).toHaveBeenCalled();

            expect(CommunityPost.countDocuments).toHaveBeenCalledWith({
                user: USER_ID,
                status: 'Active'
            });

            expect(MarketplaceItem.countDocuments).toHaveBeenCalledWith({
                user: USER_ID,
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

            await expectError(
                userController.getProfile,
                createRequest(),
                'User profile not found.',
                404
            );
        });
    });

    describe('updateProfile', () => {
        test('updates permitted fields and excludes protected fields', async () => {
            const currentUser = createCurrentUser();

            const updatedUser = {
                _id: USER_ID,
                name: 'Updated Farmer',
                bio: 'I grow maize.',
                profilePhoto: '',
                profilePhotoPublicId: ''
            };

            User.findById.mockResolvedValue(currentUser);

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

            expect(User.findById).toHaveBeenCalledWith(USER_ID);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                USER_ID,
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
                PRIVATE_FIELDS
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(deleteImage).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Profile updated successfully.',
                data: updatedUser
            });
        });

        test('rejects an empty update', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({ body: {} }),
                'No profile information was provided.',
                400
            );

            expect(User.findById).not.toHaveBeenCalled();
            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects a name shorter than two characters', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: { name: 'A' }
                }),
                'Name must be between 2 and 100 characters.',
                400
            );

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects an unsupported language', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: { language: 'French' }
                }),
                'Invalid language.',
                400
            );

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects a non-string profile field', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: { name: 123 }
                }),
                'name must be text.',
                400
            );

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('returns an error when the account no longer exists', async () => {
            User.findById.mockResolvedValue(null);

            await expectError(
                userController.updateProfile,
                createRequest({
                    body: {
                        name: 'Updated Farmer'
                    }
                }),
                'User profile not found.',
                404
            );

            expect(User.findById).toHaveBeenCalledWith(USER_ID);
            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(uploadImage).not.toHaveBeenCalled();
        });

        test('returns an error if the account disappears during update', async () => {
            User.findById.mockResolvedValue(createCurrentUser());
            User.findByIdAndUpdate.mockReturnValue(createQuery(null));

            await expectError(
                userController.updateProfile,
                createRequest({
                    body: { name: 'Updated Farmer' }
                }),
                'User profile not found.',
                404
            );

            expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(1);
        });

        test('uploads a new profile photo to Cloudinary', async () => {
            const file = createFile();
            const currentUser = createCurrentUser();

            const updatedUser = createCurrentUser({
                profilePhoto: PROFILE_IMAGE_URL,
                profilePhotoPublicId: PROFILE_IMAGE_PUBLIC_ID
            });

            User.findById.mockResolvedValue(currentUser);
            User.findByIdAndUpdate.mockReturnValue(
                createQuery(updatedUser)
            );

            const req = createRequest({
                body: {},
                file
            });

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(uploadImage).toHaveBeenCalledTimes(1);
            expect(uploadImage).toHaveBeenCalledWith(
                file,
                'roamagro/profiles'
            );

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                USER_ID,
                {
                    $set: {
                        profilePhoto: PROFILE_IMAGE_URL,
                        profilePhotoPublicId: PROFILE_IMAGE_PUBLIC_ID
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            expect(deleteImage).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Profile updated successfully.',
                data: updatedUser
            });
        });

        test('replaces an existing profile photo and cleans up the old image', async () => {
            const file = createFile();

            const currentUser = createCurrentUser({
                profilePhoto: OLD_PROFILE_IMAGE_URL,
                profilePhotoPublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            const updatedUser = createCurrentUser({
                profilePhoto: PROFILE_IMAGE_URL,
                profilePhotoPublicId: PROFILE_IMAGE_PUBLIC_ID
            });

            User.findById.mockResolvedValue(currentUser);
            User.findByIdAndUpdate.mockReturnValue(
                createQuery(updatedUser)
            );

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(
                createRequest({
                    body: {},
                    file
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(uploadImage).toHaveBeenCalledWith(
                file,
                'roamagro/profiles'
            );

            expect(User.exists).toHaveBeenCalledWith({
                profilePhotoPublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            expect(CommunityPost.exists).toHaveBeenCalledWith({
                imagePublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            expect(AgriTip.exists).toHaveBeenCalledWith({
                imagePublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            expect(MarketplaceItem.exists).toHaveBeenCalledWith({
                imagePublicIds: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            expect(deleteImage).toHaveBeenCalledWith(
                OLD_PROFILE_IMAGE_PUBLIC_ID
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('removes an existing profile photo', async () => {
            const currentUser = createCurrentUser({
                profilePhoto: OLD_PROFILE_IMAGE_URL,
                profilePhotoPublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            const updatedUser = createCurrentUser();

            User.findById.mockResolvedValue(currentUser);
            User.findByIdAndUpdate.mockReturnValue(
                createQuery(updatedUser)
            );

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(
                createRequest({
                    body: { profilePhoto: '' }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                USER_ID,
                {
                    $set: {
                        profilePhoto: '',
                        profilePhotoPublicId: ''
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            expect(uploadImage).not.toHaveBeenCalled();

            expect(deleteImage).toHaveBeenCalledWith(
                OLD_PROFILE_IMAGE_PUBLIC_ID
            );

            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('keeps the existing profile photo unchanged', async () => {
            const currentUser = createCurrentUser({
                profilePhoto: OLD_PROFILE_IMAGE_URL,
                profilePhotoPublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            User.findById.mockResolvedValue(currentUser);
            User.findByIdAndUpdate.mockReturnValue(
                createQuery(currentUser)
            );

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(
                createRequest({
                    body: {
                        name: 'Updated Farmer',
                        profilePhoto: OLD_PROFILE_IMAGE_URL
                    }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                USER_ID,
                {
                    $set: {
                        name: 'Updated Farmer',
                        profilePhoto: OLD_PROFILE_IMAGE_URL
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(deleteImage).not.toHaveBeenCalled();
        });

        test('rejects an arbitrary external profile photo URL', async () => {
            User.findById.mockResolvedValue(createCurrentUser());

            await expectError(
                userController.updateProfile,
                createRequest({
                    body: {
                        profilePhoto: 'https://example.com/photo.jpg'
                    }
                }),
                'Please upload a new profile photo instead of providing a photo URL.',
                400
            );

            expect(uploadImage).not.toHaveBeenCalled();
            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects a Base64 profile photo', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: {
                        profilePhoto: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
                    }
                }),
                'Profile photo must be a valid HTTPS URL or empty to remove it.',
                400
            );

            expect(User.findById).not.toHaveBeenCalled();
            expect(uploadImage).not.toHaveBeenCalled();
        });

        test('rejects a non-string profile photo', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: {
                        profilePhoto: { url: PROFILE_IMAGE_URL }
                    }
                }),
                'profilePhoto must be text.',
                400
            );

            expect(uploadImage).not.toHaveBeenCalled();
        });

        test('rejects a profile photo URL exceeding 2048 characters', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: {
                        profilePhoto: `https://example.com/${'a'.repeat(2050)}`
                    }
                }),
                'Profile photo must be a valid HTTPS URL or empty to remove it.',
                400
            );
        });

        test('uses the uploaded file instead of a supplied profile photo field', async () => {
            const file = createFile();

            User.findById.mockResolvedValue(createCurrentUser());

            const updatedUser = createCurrentUser({
                profilePhoto: PROFILE_IMAGE_URL,
                profilePhotoPublicId: PROFILE_IMAGE_PUBLIC_ID
            });

            User.findByIdAndUpdate.mockReturnValue(
                createQuery(updatedUser)
            );

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(
                createRequest({
                    body: {
                        profilePhoto: 'https://example.com/ignored.jpg'
                    },
                    file
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(uploadImage).toHaveBeenCalledWith(
                file,
                'roamagro/profiles'
            );

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                USER_ID,
                {
                    $set: {
                        profilePhoto: PROFILE_IMAGE_URL,
                        profilePhotoPublicId: PROFILE_IMAGE_PUBLIC_ID
                    }
                },
                {
                    new: true,
                    runValidators: true
                }
            );
        });

        test('forwards Cloudinary upload errors without updating the account', async () => {
            User.findById.mockResolvedValue(createCurrentUser());

            uploadImage.mockRejectedValue(
                new Error('Cloudinary upload failed')
            );

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(
                createRequest({
                    body: {},
                    file: createFile()
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Cloudinary upload failed'
                })
            );

            expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
            expect(deleteImage).not.toHaveBeenCalled();
            expect(res.json).not.toHaveBeenCalled();
        });

        test('deletes a newly uploaded image when the database update fails', async () => {
            User.findById.mockResolvedValue(createCurrentUser());

            User.findByIdAndUpdate.mockReturnValue(
                createQuery(Promise.reject(
                    new Error('Database update failed')
                ))
            );

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(
                createRequest({
                    body: {},
                    file: createFile()
                }),
                res,
                next
            );

            expect(next).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Database update failed'
                })
            );

            expect(deleteImage).toHaveBeenCalledWith(
                PROFILE_IMAGE_PUBLIC_ID
            );

            expect(res.json).not.toHaveBeenCalled();
        });

        test('deletes a newly uploaded image when the account disappears during update', async () => {
            User.findById.mockResolvedValue(createCurrentUser());

            User.findByIdAndUpdate.mockReturnValue(
                createQuery(null)
            );

            await expectError(
                userController.updateProfile,
                createRequest({
                    body: {},
                    file: createFile()
                }),
                'User profile not found.',
                404
            );

            expect(deleteImage).toHaveBeenCalledWith(
                PROFILE_IMAGE_PUBLIC_ID
            );
        });

        test('preserves the database error when new-image cleanup fails', async () => {
            User.findById.mockResolvedValue(createCurrentUser());

            User.findByIdAndUpdate.mockReturnValue(
                createQuery(Promise.reject(
                    new Error('Database update failed')
                ))
            );

            deleteImage.mockRejectedValue(
                new Error('Cloudinary cleanup failed')
            );

            const logSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            try {
                await expectError(
                    userController.updateProfile,
                    createRequest({
                        body: {},
                        file: createFile()
                    }),
                    'Database update failed',
                    undefined
                ).catch((error) => {
                    throw error;
                });

                expect(deleteImage).toHaveBeenCalledWith(
                    PROFILE_IMAGE_PUBLIC_ID
                );

                expect(logSpy).toHaveBeenCalledWith(
                    'New profile photo cleanup failed:',
                    'Cloudinary cleanup failed'
                );
            } finally {
                logSpy.mockRestore();
            }
        });

        test.each([
            ['User', User],
            ['CommunityPost', CommunityPost],
            ['AgriTip', AgriTip],
            ['MarketplaceItem', MarketplaceItem]
        ])('preserves an old image still referenced by %s', async (
            modelName,
            model
        ) => {
            const currentUser = createCurrentUser({
                profilePhoto: OLD_PROFILE_IMAGE_URL,
                profilePhotoPublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            const updatedUser = createCurrentUser();

            User.findById.mockResolvedValue(currentUser);
            User.findByIdAndUpdate.mockReturnValue(
                createQuery(updatedUser)
            );

            model.exists.mockResolvedValue({
                _id: OTHER_USER_ID
            });

            const res = createResponse();
            const next = createNext();

            await userController.updateProfile(
                createRequest({
                    body: { profilePhoto: '' }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(User.exists).toHaveBeenCalled();
            expect(CommunityPost.exists).toHaveBeenCalled();
            expect(AgriTip.exists).toHaveBeenCalled();
            expect(MarketplaceItem.exists).toHaveBeenCalled();

            expect(deleteImage).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
        });

        test('still updates the profile when old-image cleanup fails', async () => {
            const currentUser = createCurrentUser({
                profilePhoto: OLD_PROFILE_IMAGE_URL,
                profilePhotoPublicId: OLD_PROFILE_IMAGE_PUBLIC_ID
            });

            const updatedUser = createCurrentUser();

            User.findById.mockResolvedValue(currentUser);
            User.findByIdAndUpdate.mockReturnValue(
                createQuery(updatedUser)
            );

            User.exists.mockRejectedValue(
                new Error('Reference lookup failed')
            );

            const logSpy = jest
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            try {
                const res = createResponse();
                const next = createNext();

                await userController.updateProfile(
                    createRequest({
                        body: { profilePhoto: '' }
                    }),
                    res,
                    next
                );

                expect(next).not.toHaveBeenCalled();

                expect(logSpy).toHaveBeenCalledWith(
                    'Cloudinary image cleanup failed:',
                    'Reference lookup failed'
                );

                expect(deleteImage).not.toHaveBeenCalled();
                expect(res.status).toHaveBeenCalledWith(200);
            } finally {
                logSpy.mockRestore();
            }
        });

        test('rejects a bio exceeding 500 characters', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: { bio: 'a'.repeat(501) }
                }),
                'Bio must not exceed 500 characters.',
                400
            );
        });

        test('rejects a phone number exceeding 30 characters', async () => {
            await expectError(
                userController.updateProfile,
                createRequest({
                    body: { phone: '1'.repeat(31) }
                }),
                'Phone number is too long.',
                400
            );
        });
    });

    describe('searchUsers', () => {
        test('returns an empty result when no search term is provided', async () => {
            const req = createRequest({
                query: { search: '   ' }
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
                    _id: OTHER_USER_ID,
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

            expect(String(searchQuery._id.$ne)).toBe(USER_ID);
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

        test('escapes regular expression characters in search', async () => {
            User.countDocuments.mockResolvedValue(0);
            User.find.mockReturnValue(createQuery([]));

            await userController.searchUsers(
                createRequest({
                    query: { search: 'maize.*' }
                }),
                createResponse(),
                createNext()
            );

            const query = User.countDocuments.mock.calls[0][0];

            expect(query.$or[0].name.test('maize.*')).toBe(true);
            expect(query.$or[0].name.test('maize123')).toBe(false);
        });
    });

    describe('getUserById', () => {
        test('includes private profile contact fields when retrieving own profile', async () => {
            const user = {
                _id: USER_ID,
                name: 'Test Farmer',
                email: 'farmer@example.com',
                phone: '08000000000'
            };

            const userQuery = createQuery(user);

            User.findOne.mockReturnValue(userQuery);

            const req = createRequest({
                params: { userId: USER_ID }
            });

            const res = createResponse();
            const next = createNext();

            await userController.getUserById(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(User.findOne).toHaveBeenCalledWith({
                _id: USER_ID,
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
            const user = {
                _id: OTHER_USER_ID,
                name: 'Another Farmer',
                bio: 'Growing rice.'
            };

            const userQuery = createQuery(user);

            User.findOne.mockReturnValue(userQuery);

            const req = createRequest({
                params: { userId: OTHER_USER_ID }
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
            await expectError(
                userController.getUserById,
                createRequest({
                    params: {
                        userId: 'not-a-valid-object-id'
                    }
                }),
                'Invalid user ID.',
                400
            );

            expect(User.findOne).not.toHaveBeenCalled();
        });

        test('returns an error when the requested user does not exist', async () => {
            User.findOne.mockReturnValue(createQuery(null));

            await expectError(
                userController.getUserById,
                createRequest({
                    params: { userId: OTHER_USER_ID }
                }),
                'User not found.',
                404
            );
        });
    });

    describe('searchAdminUsers', () => {
        test('returns an empty result when the search term is empty', async () => {
            const req = createRequest({
                query: { search: '   ' }
            });

            const res = createResponse();
            const next = createNext();

            await userController.searchAdminUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(User.find).not.toHaveBeenCalled();

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: []
            });
        });

        test('rejects a non-empty search term shorter than two characters', async () => {
            await expectError(
                userController.searchAdminUsers,
                createRequest({
                    query: { search: 'a' }
                }),
                'Search must contain at least 2 characters.',
                400
            );

            expect(User.find).not.toHaveBeenCalled();
        });

        test('searches by name or email and limits results to 25', async () => {
            const users = [
                {
                    _id: OTHER_USER_ID,
                    name: 'Amina'
                }
            ];

            User.find.mockReturnValue(createQuery(users));

            const req = createRequest({
                query: { search: 'Amina' }
            });

            const res = createResponse();
            const next = createNext();

            await userController.searchAdminUsers(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(User.find).toHaveBeenCalledTimes(1);

            const searchQuery = User.find.mock.calls[0][0];

            expect(searchQuery.$or).toHaveLength(2);
            expect(searchQuery.$or[0].name).toBeInstanceOf(RegExp);
            expect(searchQuery.$or[1].email).toBeInstanceOf(RegExp);

            const query = User.find.mock.results[0].value;

            expect(query.select).toHaveBeenCalledWith(
                'name email profilePhoto role isVerified accountStatus createdAt'
            );

            expect(query.sort).toHaveBeenCalledWith({ name: 1 });
            expect(query.limit).toHaveBeenCalledWith(25);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: users
            });
        });
    });

    describe('reportUser', () => {
        test('rejects an invalid user ID', async () => {
            await expectError(
                userController.reportUser,
                createRequest({
                    params: { userId: 'invalid-id' }
                }),
                'Invalid user ID.',
                400
            );

            expect(User.findOne).not.toHaveBeenCalled();
        });

        test('prevents users from reporting themselves', async () => {
            await expectError(
                userController.reportUser,
                createRequest({
                    params: { userId: USER_ID }
                }),
                'You cannot report your own account.',
                400
            );

            expect(User.findOne).not.toHaveBeenCalled();
        });

        test('returns not found when the reported account is not active or does not exist', async () => {
            User.findOne.mockResolvedValue(null);

            await expectError(
                userController.reportUser,
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: { reason: 'Spam' }
                }),
                'User not found.',
                404
            );

            expect(User.findOne).toHaveBeenCalledWith({
                _id: OTHER_USER_ID,
                accountStatus: 'active'
            });

            expect(UserReport.create).not.toHaveBeenCalled();
        });

        test('rejects a duplicate report', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_USER_ID
            });

            UserReport.findOne.mockResolvedValue({
                _id: 'existing-report'
            });

            await expectError(
                userController.reportUser,
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: { reason: 'Spam' }
                }),
                'You have already reported this user.',
                409
            );

            expect(UserReport.findOne).toHaveBeenCalledWith({
                reporter: USER_ID,
                reportedUser: OTHER_USER_ID
            });

            expect(UserReport.create).not.toHaveBeenCalled();
        });

        test('creates a report and returns its ID', async () => {
            User.findOne.mockResolvedValue({
                _id: OTHER_USER_ID
            });

            UserReport.findOne.mockResolvedValue(null);

            UserReport.create.mockResolvedValue({
                _id: REPORT_ID
            });

            const req = createRequest({
                params: { userId: OTHER_USER_ID },
                body: {
                    reason: 'Spam',
                    details: '  Repeated spam posts  '
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.reportUser(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(UserReport.create).toHaveBeenCalledWith({
                reporter: USER_ID,
                reportedUser: OTHER_USER_ID,
                reason: 'Spam',
                details: 'Repeated spam posts'
            });

            expect(res.status).toHaveBeenCalledWith(201);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'Report submitted successfully.',
                data: { id: REPORT_ID }
            });
        });
    });

    describe('getReports', () => {
        test('returns paginated reports using default pagination', async () => {
            const reports = [
                { _id: 'report-1' }
            ];

            UserReport.find.mockReturnValue(
                createQuery(reports)
            );

            UserReport.countDocuments.mockResolvedValue(21);

            const req = createRequest();
            const res = createResponse();
            const next = createNext();

            await userController.getReports(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(UserReport.find).toHaveBeenCalledWith({});

            const query = UserReport.find.mock.results[0].value;

            expect(query.populate).toHaveBeenCalledTimes(3);
            expect(query.sort).toHaveBeenCalledWith({
                createdAt: -1
            });

            expect(query.skip).toHaveBeenCalledWith(0);
            expect(query.limit).toHaveBeenCalledWith(20);

            expect(UserReport.countDocuments).toHaveBeenCalledWith({});

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: reports,
                pagination: {
                    page: 1,
                    limit: 20,
                    total: 21,
                    pages: 2
                }
            });
        });

        test('applies a valid status filter and caps pagination', async () => {
            UserReport.find.mockReturnValue(
                createQuery([])
            );

            UserReport.countDocuments.mockResolvedValue(0);

            const req = createRequest({
                query: {
                    status: 'Reviewed',
                    page: '3',
                    limit: '500'
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.getReports(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(UserReport.find).toHaveBeenCalledWith({
                status: 'Reviewed'
            });

            const query = UserReport.find.mock.results[0].value;

            expect(query.skip).toHaveBeenCalledWith(100);
            expect(query.limit).toHaveBeenCalledWith(50);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: [],
                pagination: {
                    page: 3,
                    limit: 50,
                    total: 0,
                    pages: 0
                }
            });
        });

        test('rejects an unsupported status filter', async () => {
            await expectError(
                userController.getReports,
                createRequest({
                    query: { status: 'Unknown' }
                }),
                'Invalid report status.',
                400
            );

            expect(UserReport.find).not.toHaveBeenCalled();
        });
    });

    describe('updateReport', () => {
        test('rejects an unsupported report status', async () => {
            await expectError(
                userController.updateReport,
                createRequest({
                    params: { reportId: REPORT_ID },
                    body: { status: 'Unknown' }
                }),
                'Invalid report status.',
                400
            );

            expect(UserReport.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('rejects an invalid report ID', async () => {
            await expectError(
                userController.updateReport,
                createRequest({
                    params: { reportId: 'bad-id' },
                    body: { status: 'Reviewed' }
                }),
                'Invalid report ID.',
                400
            );

            expect(UserReport.findByIdAndUpdate).not.toHaveBeenCalled();
        });

        test('returns not found when the report does not exist', async () => {
            UserReport.findByIdAndUpdate.mockResolvedValue(null);

            await expectError(
                userController.updateReport,
                createRequest({
                    params: { reportId: REPORT_ID },
                    body: { status: 'Reviewed' }
                }),
                'Report not found.',
                404
            );
        });

        test('updates report status and records the reviewing admin', async () => {
            const report = {
                _id: REPORT_ID,
                status: 'Reviewed'
            };

            UserReport.findByIdAndUpdate.mockResolvedValue(report);

            const req = createRequest({
                user: {
                    _id: USER_ID,
                    role: 'admin'
                },
                params: {
                    reportId: REPORT_ID
                },
                body: {
                    status: 'Reviewed'
                }
            });

            const res = createResponse();
            const next = createNext();

            await userController.updateReport(req, res, next);

            expect(next).not.toHaveBeenCalled();

            expect(UserReport.findByIdAndUpdate).toHaveBeenCalledWith(
                REPORT_ID,
                expect.objectContaining({
                    status: 'Reviewed',
                    reviewedBy: USER_ID,
                    reviewedAt: expect.any(Date)
                }),
                {
                    new: true,
                    runValidators: true
                }
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
        test('rejects an invalid user ID', async () => {
            await expectError(
                userController.updateUserRole,
                createRequest({
                    params: { userId: 'invalid' },
                    body: { role: 'buyer' }
                }),
                'Invalid user ID.',
                400
            );

            expect(User.findById).not.toHaveBeenCalled();
        });

        test('rejects an unsupported role', async () => {
            await expectError(
                userController.updateUserRole,
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: { role: 'superuser' }
                }),
                'Invalid user role.',
                400
            );

            expect(User.findById).not.toHaveBeenCalled();
        });

        test('prevents administrators from changing their own role', async () => {
            await expectError(
                userController.updateUserRole,
                createRequest({
                    params: { userId: USER_ID },
                    body: { role: 'buyer' }
                }),
                'You cannot change your own role.',
                400
            );

            expect(User.findById).not.toHaveBeenCalled();
        });

        test('returns not found when the target user does not exist', async () => {
            User.findById.mockResolvedValue(null);

            await expectError(
                userController.updateUserRole,
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: { role: 'buyer' }
                }),
                'User not found.',
                404
            );
        });

        test('returns successfully without saving when the role is unchanged', async () => {
            const user = {
                _id: OTHER_USER_ID,
                name: 'Buyer',
                email: 'buyer@example.com',
                role: 'buyer',
                accountStatus: 'active',
                save: jest.fn()
            };

            User.findById.mockResolvedValue(user);

            const res = createResponse();
            const next = createNext();

            await userController.updateUserRole(
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: { role: 'buyer' }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();
            expect(user.save).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User already has this role.',
                data: {
                    _id: OTHER_USER_ID,
                    name: 'Buyer',
                    email: 'buyer@example.com',
                    role: 'buyer',
                    accountStatus: 'active'
                }
            });
        });

        test('updates a user role successfully', async () => {
            const user = {
                _id: OTHER_USER_ID,
                name: 'Farmer',
                email: 'farmer@example.com',
                role: 'farmer',
                accountStatus: 'active',
                save: jest.fn().mockResolvedValue(undefined)
            };

            User.findById.mockResolvedValue(user);

            const res = createResponse();
            const next = createNext();

            await userController.updateUserRole(
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: { role: 'extension_officer' }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();
            expect(user.role).toBe('extension_officer');
            expect(user.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User role updated successfully.',
                data: {
                    _id: OTHER_USER_ID,
                    name: 'Farmer',
                    email: 'farmer@example.com',
                    role: 'extension_officer',
                    accountStatus: 'active'
                }
            });
        });
    });

    describe('suspendUser', () => {
        test('rejects an invalid user ID', async () => {
            await expectError(
                userController.suspendUser,
                createRequest({
                    params: { userId: 'invalid' }
                }),
                'Invalid user ID.',
                400
            );

            expect(User.findById).not.toHaveBeenCalled();
        });

        test('returns not found when the target user does not exist', async () => {
            User.findById.mockResolvedValue(null);

            await expectError(
                userController.suspendUser,
                createRequest({
                    params: { userId: OTHER_USER_ID }
                }),
                'User not found.',
                404
            );
        });

        test('prevents suspending the current user', async () => {
            User.findById.mockResolvedValue({
                _id: USER_ID,
                role: 'farmer'
            });

            await expectError(
                userController.suspendUser,
                createRequest({
                    params: { userId: USER_ID }
                }),
                'You cannot suspend your own account.',
                400
            );
        });

        test('prevents suspending an administrator account', async () => {
            User.findById.mockResolvedValue({
                _id: OTHER_USER_ID,
                role: 'admin'
            });

            await expectError(
                userController.suspendUser,
                createRequest({
                    params: { userId: OTHER_USER_ID }
                }),
                'Administrator accounts cannot be suspended here.',
                400
            );
        });

        test('rejects an invalid suspension duration', async () => {
            User.findById.mockResolvedValue({
                _id: OTHER_USER_ID,
                role: 'farmer'
            });

            await expectError(
                userController.suspendUser,
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: { durationDays: 3651 }
                }),
                'Suspension duration must be between 1 and 3650 days.',
                400
            );
        });

        test('suspends a user with a reason and duration', async () => {
            const user = {
                _id: OTHER_USER_ID,
                role: 'farmer',
                accountStatus: 'active',
                save: jest.fn().mockResolvedValue(undefined)
            };

            User.findById.mockResolvedValue(user);

            const before = Date.now();
            const res = createResponse();
            const next = createNext();

            await userController.suspendUser(
                createRequest({
                    params: { userId: OTHER_USER_ID },
                    body: {
                        reason: '  Repeated abuse  ',
                        durationDays: 7
                    }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(user.accountStatus).toBe('suspended');
            expect(user.suspensionReason).toBe('Repeated abuse');
            expect(user.suspendedAt).toBeInstanceOf(Date);
            expect(user.suspendedUntil).toBeInstanceOf(Date);

            expect(user.suspendedUntil.getTime()).toBeGreaterThanOrEqual(
                before + 7 * 24 * 60 * 60 * 1000
            );

            expect(user.save).toHaveBeenCalledWith({
                validateBeforeSave: false
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User suspended successfully.',
                data: {
                    userId: OTHER_USER_ID,
                    accountStatus: 'suspended',
                    suspendedUntil: user.suspendedUntil
                }
            });
        });

        test('supports an indefinite suspension when duration is omitted', async () => {
            const user = {
                _id: OTHER_USER_ID,
                role: 'buyer',
                save: jest.fn().mockResolvedValue(undefined)
            };

            User.findById.mockResolvedValue(user);

            const res = createResponse();
            const next = createNext();

            await userController.suspendUser(
                createRequest({
                    params: { userId: OTHER_USER_ID }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(user.accountStatus).toBe('suspended');
            expect(user.suspendedUntil).toBeNull();
            expect(user.suspensionReason).toBe('');

            expect(user.save).toHaveBeenCalledWith({
                validateBeforeSave: false
            });
        });
    });

    describe('restoreUser', () => {
        test('rejects an invalid user ID', async () => {
            await expectError(
                userController.restoreUser,
                createRequest({
                    params: { userId: 'invalid' }
                }),
                'Invalid user ID.',
                400
            );

            expect(User.findById).not.toHaveBeenCalled();
        });

        test('returns not found when the target user does not exist', async () => {
            User.findById.mockResolvedValue(null);

            await expectError(
                userController.restoreUser,
                createRequest({
                    params: { userId: OTHER_USER_ID }
                }),
                'User not found.',
                404
            );
        });

        test('restores a user and clears suspension fields', async () => {
            const user = {
                _id: OTHER_USER_ID,
                accountStatus: 'suspended',
                suspensionReason: 'Abuse',
                suspendedAt: new Date(),
                suspendedUntil: new Date(),
                save: jest.fn().mockResolvedValue(undefined)
            };

            User.findById.mockResolvedValue(user);

            const res = createResponse();
            const next = createNext();

            await userController.restoreUser(
                createRequest({
                    params: { userId: OTHER_USER_ID }
                }),
                res,
                next
            );

            expect(next).not.toHaveBeenCalled();

            expect(user.accountStatus).toBe('active');
            expect(user.suspensionReason).toBe('');
            expect(user.suspendedAt).toBeNull();
            expect(user.suspendedUntil).toBeNull();

            expect(user.save).toHaveBeenCalledWith({
                validateBeforeSave: false
            });

            expect(res.status).toHaveBeenCalledWith(200);

            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'User account restored successfully.',
                data: {
                    userId: OTHER_USER_ID,
                    accountStatus: 'active'
                }
            });
        });
    });
});