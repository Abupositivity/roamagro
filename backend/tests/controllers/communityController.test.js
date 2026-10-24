const mongoose = require('mongoose');

jest.mock('../../models/AgriTip', () => ({
    findById: jest.fn()
}));

jest.mock('../../models/CommunityPost', () => ({
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn()
}));

jest.mock('../../models/Connection', () => ({
    find: jest.fn()
}));

jest.mock('../../models/Notification', () => ({
    create: jest.fn()
}));

const AgriTip = require('../../models/AgriTip');
const CommunityPost = require('../../models/CommunityPost');
const Connection = require('../../models/Connection');
const Notification = require('../../models/Notification');
const controller = require('../../controllers/communityController');

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f1f77bcf86cd799439012';
const POST_ID = '507f1f77bcf86cd799439013';
const COMMENT_ID = '507f1f77bcf86cd799439014';
const TIP_ID = '507f1f77bcf86cd799439015';

const makeResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

const makeRequest = (overrides = {}) => ({
    body: {},
    params: {},
    query: {},
    user: {
        _id: USER_ID,
        name: 'Test Farmer'
    },
    ...overrides
});

const invoke = async (handler, req) => {
    const res = makeResponse();
    const next = jest.fn();

    await handler(req, res, next);

    return { req, res, next };
};

const makePost = (overrides = {}) => {
    const post = {
        _id: POST_ID,
        user: USER_ID,
        title: 'Growing maize',
        content: 'My maize is growing well.',
        category: 'Maize',
        image: '',
        status: 'Active',
        featured: false,
        agriTip: null,
        sharedBy: [],
        shares: 0,
        likes: [],
        comments: [],
        populate: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
        ...overrides
    };

    return post;
};

const makeQuery = (result) => {
    const query = {
        select: jest.fn(),
        lean: jest.fn(),
        populate: jest.fn(),
        sort: jest.fn(),
        limit: jest.fn()
    };

    query.select.mockReturnValue(query);
    query.lean.mockResolvedValue(result);
    query.populate.mockReturnValue(query);
    query.sort.mockReturnValue(query);
    query.limit.mockResolvedValue(result);

    return query;
};

const expectAppError = async (handler, req, statusCode, message) => {
    const { res, next } = await invoke(handler, req);

    expect(next).toHaveBeenCalledTimes(1);

    const error = next.mock.calls[0][0];

    expect(error).toBeInstanceOf(Error);
    expect(error.statusCode || error.status).toBe(statusCode);

    if (message) {
        expect(error.message).toBe(message);
    }

    expect(res.json).not.toHaveBeenCalled();

    return error;
};

beforeEach(() => {
    jest.clearAllMocks();

    Connection.find.mockReturnValue(
        makeQuery([])
    );

    CommunityPost.countDocuments.mockResolvedValue(0);
    CommunityPost.aggregate.mockResolvedValue([]);
    CommunityPost.create.mockResolvedValue(makePost());

    Notification.create.mockResolvedValue({});
    AgriTip.findById.mockResolvedValue(null);
});

describe('createCommunityPost', () => {
    test('creates a post and populates its users', async () => {
        const post = makePost();

        CommunityPost.create.mockResolvedValue(post);

        const { res, next } = await invoke(
            controller.createCommunityPost,
            makeRequest({
                body: {
                    title: '  Growing maize  ',
                    content: '  Maize is growing well.  ',
                    category: '  Maize  ',
                    image: 'https://example.com/maize.jpg'
                }
            })
        );

        expect(next).not.toHaveBeenCalled();

        expect(CommunityPost.create).toHaveBeenCalledWith({
            title: 'Growing maize',
            content: 'Maize is growing well.',
            category: 'Maize',
            image: 'https://example.com/maize.jpg',
            user: USER_ID
        });

        expect(post.populate).toHaveBeenCalledTimes(2);
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Community post created successfully.',
            data: post
        });
    });

    test('creates a post without an image when no image is supplied', async () => {
        await invoke(
            controller.createCommunityPost,
            makeRequest({
                body: {
                    title: 'Growing rice',
                    content: 'Rice planting update.',
                    category: 'Rice'
                }
            })
        );

        expect(CommunityPost.create).toHaveBeenCalledWith(
            expect.objectContaining({
                image: ''
            })
        );
    });

    test.each([
        [{ content: 'Content', category: 'Maize' }, 'Title must be text.'],
        [{ title: 'Title', category: 'Maize' }, 'Content must be text.'],
        [{ title: 'Title', content: 'Content' }, 'Category must be text.'],
        [{ title: 123, content: 'Content', category: 'Maize' }, 'Title must be text.'],
        [{ title: 'Title', content: null, category: 'Maize' }, 'Content must be text.'],
        [{ title: 'Title', content: 'Content', category: [] }, 'Category must be text.'],
        [{ title: '   ', content: 'Content', category: 'Maize' }, 'Title is required.'],
        [{ title: 'Title', content: '   ', category: 'Maize' }, 'Content is required.'],
        [{ title: 'Title', content: 'Content', category: '   ' }, 'Category is required.']
    ])('rejects invalid post input: %j', async (body, message) => {
        await expectAppError(
            controller.createCommunityPost,
            makeRequest({ body }),
            400,
            message
        );

        expect(CommunityPost.create).not.toHaveBeenCalled();
    });

    test.each([
        ['title', 200],
        ['content', 5000],
        ['category', 100]
    ])('rejects a %s exceeding its maximum length', async (field, maxLength) => {
        const body = {
            title: 'Title',
            content: 'Content',
            category: 'Maize'
        };

        body[field] = 'x'.repeat(maxLength + 1);

        await expectAppError(
            controller.createCommunityPost,
            makeRequest({ body }),
            400,
            `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${maxLength} characters.`
        );

        expect(CommunityPost.create).not.toHaveBeenCalled();
    });

    test('rejects an image exceeding the maximum length', async () => {
        await expectAppError(
            controller.createCommunityPost,
            makeRequest({
                body: {
                    title: 'Title',
                    content: 'Content',
                    category: 'Maize',
                    image: 'x'.repeat(3000001)
                }
            }),
            400,
            'Image cannot exceed 3000000 characters.'
        );

        expect(CommunityPost.create).not.toHaveBeenCalled();
    });

    test('rejects a non-string image', async () => {
        await expectAppError(
            controller.createCommunityPost,
            makeRequest({
                body: {
                    title: 'Title',
                    content: 'Content',
                    category: 'Maize',
                    image: {}
                }
            }),
            400,
            'Image must be text.'
        );
    });

    test('forwards a database creation error', async () => {
        CommunityPost.create.mockRejectedValue(
            new Error('Database unavailable')
        );

        const { next } = await invoke(
            controller.createCommunityPost,
            makeRequest({
                body: {
                    title: 'Title',
                    content: 'Content',
                    category: 'Maize'
                }
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Database unavailable'
            })
        );
    });
});

describe('getCommunityPosts', () => {
    test('returns an empty paginated list when no posts match', async () => {
        CommunityPost.countDocuments.mockResolvedValue(0);
        CommunityPost.aggregate.mockResolvedValue([]);

        const { res, next } = await invoke(
            controller.getCommunityPosts,
            makeRequest()
        );

        expect(next).not.toHaveBeenCalled();

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            count: 0,
            total: 0,
            page: 1,
            limit: 15,
            totalPages: 0,
            hasMore: false,
            search: '',
            category: '',
            mine: false,
            connectionsFirst: true,
            connectedUsersCount: 0,
            data: []
        });

        expect(Connection.find).toHaveBeenCalledWith({
            status: 'accepted',
            $or: [
                { requester: USER_ID },
                { recipient: USER_ID }
            ]
        });
    });

    test('applies search, category, and pagination filters', async () => {
        CommunityPost.countDocuments.mockResolvedValue(21);
        CommunityPost.aggregate.mockResolvedValue([]);

        const { res } = await invoke(
            controller.getCommunityPosts,
            makeRequest({
                query: {
                    search: 'maize',
                    category: 'Maize',
                    page: '2',
                    limit: '10'
                }
            })
        );

        expect(CommunityPost.countDocuments).toHaveBeenCalledWith({
            status: 'Active',
            category: 'Maize',
            $or: [
                { title: expect.any(RegExp) },
                { content: expect.any(RegExp) }
            ]
        });

        const filter = CommunityPost.countDocuments.mock.calls[0][0];

        expect(filter.$or[0].title.test('Maize planting')).toBe(true);
        expect(filter.$or[1].content.test('My maize is growing')).toBe(true);

        expect(CommunityPost.aggregate).toHaveBeenCalledWith(
            expect.arrayContaining([
                { $match: filter },
                { $skip: 10 },
                { $limit: 10 }
            ])
        );

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 2,
                limit: 10,
                total: 21,
                totalPages: 3,
                hasMore: true,
                search: 'maize',
                category: 'Maize'
            })
        );
    });

    test('escapes regex special characters in search text', async () => {
        CommunityPost.countDocuments.mockResolvedValue(0);

        await invoke(
            controller.getCommunityPosts,
            makeRequest({
                query: {
                    search: 'maize.*(test)'
                }
            })
        );

        const filter = CommunityPost.countDocuments.mock.calls[0][0];
        const regex = filter.$or[0].title;

        expect(regex.test('maize.*(test)')).toBe(true);
        expect(regex.test('maizeZZZtest')).toBe(false);
    });

    test('does not apply a category filter when category is all', async () => {
        await invoke(
            controller.getCommunityPosts,
            makeRequest({
                query: { category: 'all' }
            })
        );

        expect(CommunityPost.countDocuments).toHaveBeenCalledWith({
            status: 'Active'
        });
    });

    test('supports mine=true and skips connection lookup', async () => {
        CommunityPost.countDocuments.mockResolvedValue(0);

        const { res } = await invoke(
            controller.getCommunityPosts,
            makeRequest({
                query: { mine: 'true' }
            })
        );

        expect(Connection.find).not.toHaveBeenCalled();

        expect(CommunityPost.countDocuments).toHaveBeenCalledWith({
            status: 'Active',
            user: USER_ID
        });

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                mine: true,
                connectionsFirst: false,
                connectedUsersCount: 0
            })
        );
    });

    test('supports mine=1', async () => {
        await invoke(
            controller.getCommunityPosts,
            makeRequest({
                query: { mine: '1' }
            })
        );

        expect(CommunityPost.countDocuments).toHaveBeenCalledWith({
            status: 'Active',
            user: USER_ID
        });

        expect(Connection.find).not.toHaveBeenCalled();
    });

    test('uses default pagination for invalid page and limit values', async () => {
        await invoke(
            controller.getCommunityPosts,
            makeRequest({
                query: {
                    page: '-1',
                    limit: '0'
                }
            })
        );

        expect(CommunityPost.aggregate).toHaveBeenCalledWith(
            expect.arrayContaining([
                { $skip: 0 },
                { $limit: 15 }
            ])
        );
    });

    test('caps the requested limit at 50', async () => {
        await invoke(
            controller.getCommunityPosts,
            makeRequest({
                query: {
                    page: '1',
                    limit: '1000'
                }
            })
        );

        expect(CommunityPost.aggregate).toHaveBeenCalledWith(
            expect.arrayContaining([
                { $skip: 0 },
                { $limit: 50 }
            ])
        );
    });

    test('rejects a search term exceeding 100 characters', async () => {
        await expectAppError(
            controller.getCommunityPosts,
            makeRequest({
                query: { search: 'x'.repeat(101) }
            }),
            400,
            'Search cannot exceed 100 characters.'
        );

        expect(CommunityPost.countDocuments).not.toHaveBeenCalled();
    });

    test('rejects a non-string search term', async () => {
        await expectAppError(
            controller.getCommunityPosts,
            makeRequest({
                query: { search: ['maize'] }
            }),
            400,
            'Search must be text.'
        );
    });

    test('rejects a category exceeding 100 characters', async () => {
        await expectAppError(
            controller.getCommunityPosts,
            makeRequest({
                query: { category: 'x'.repeat(101) }
            }),
            400,
            'Category cannot exceed 100 characters.'
        );
    });

    test('prioritizes posts from connected users and preserves aggregate ordering', async () => {
        const connectedPostId = '507f1f77bcf86cd799439021';
        const otherPostId = '507f1f77bcf86cd799439022';

        Connection.find.mockReturnValue(
            makeQuery([
                {
                    requester: USER_ID,
                    recipient: OTHER_USER_ID
                }
            ])
        );

        CommunityPost.countDocuments.mockResolvedValue(2);

        CommunityPost.aggregate.mockResolvedValue([
            { _id: connectedPostId },
            { _id: otherPostId }
        ]);

        const fetchedPosts = [
            { _id: otherPostId, title: 'Other post' },
            { _id: connectedPostId, title: 'Connected post' }
        ];

        const query = makeQuery(fetchedPosts);

        CommunityPost.find.mockReturnValue(query);

        const { res } = await invoke(
            controller.getCommunityPosts,
            makeRequest()
        );

        expect(CommunityPost.aggregate).toHaveBeenCalledWith(
            expect.arrayContaining([
                {
                    $addFields: {
                        connectionPriority: {
                            $cond: [
                                { $in: ['$user', [OTHER_USER_ID]] },
                                1,
                                0
                            ]
                        }
                    }
                },
                {
                    $sort: {
                        connectionPriority: -1,
                        featured: -1,
                        createdAt: -1,
                        _id: -1
                    }
                }
            ])
        );

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                connectedUsersCount: 1,
                count: 2,
                data: [
                    { _id: connectedPostId, title: 'Connected post' },
                    { _id: otherPostId, title: 'Other post' }
                ]
            })
        );
    });

    test('handles a connection where the current user is the recipient', async () => {
        Connection.find.mockReturnValue(
            makeQuery([
                {
                    requester: OTHER_USER_ID,
                    recipient: USER_ID
                }
            ])
        );

        await invoke(
            controller.getCommunityPosts,
            makeRequest()
        );

        expect(CommunityPost.aggregate).toHaveBeenCalledWith(
            expect.arrayContaining([
                {
                    $addFields: {
                        connectionPriority: {
                            $cond: [
                                { $in: ['$user', [OTHER_USER_ID]] },
                                1,
                                0
                            ]
                        }
                    }
                }
            ])
        );
    });

    test('restores aggregate ordering after fetching posts in a different order', async () => {
        const firstId = '507f1f77bcf86cd799439031';
        const secondId = '507f1f77bcf86cd799439032';

        CommunityPost.aggregate.mockResolvedValue([
            { _id: firstId },
            { _id: secondId }
        ]);

        CommunityPost.find.mockReturnValue(
            makeQuery([
                { _id: secondId },
                { _id: firstId }
            ])
        );

        const { res } = await invoke(
            controller.getCommunityPosts,
            makeRequest()
        );

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                data: [
                    { _id: firstId },
                    { _id: secondId }
                ]
            })
        );
    });

    test('forwards connection query errors', async () => {
        Connection.find.mockImplementation(() => {
            throw new Error('Connection query failed');
        });

        const { next } = await invoke(
            controller.getCommunityPosts,
            makeRequest()
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Connection query failed'
            })
        );
    });
});

describe('getFeaturedPosts', () => {
    test('returns featured active posts, newest first, limited to five', async () => {
        const posts = [
            makePost({ featured: true })
        ];

        const query = makeQuery(posts);
        CommunityPost.find.mockReturnValue(query);

        const { res, next } = await invoke(
            controller.getFeaturedPosts,
            makeRequest()
        );

        expect(next).not.toHaveBeenCalled();

        expect(CommunityPost.find).toHaveBeenCalledWith({
            featured: true,
            status: 'Active'
        });

        expect(query.sort).toHaveBeenCalledWith({
            createdAt: -1
        });

        expect(query.limit).toHaveBeenCalledWith(5);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: posts
        });
    });

    test('forwards database errors', async () => {
        CommunityPost.find.mockImplementation(() => {
            throw new Error('Featured posts query failed');
        });

        const { next } = await invoke(
            controller.getFeaturedPosts,
            makeRequest()
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Featured posts query failed'
            })
        );
    });
});

describe('updateCommunityPost', () => {
    test('updates allowed fields and populates the post', async () => {
        const post = makePost();

        CommunityPost.findById.mockResolvedValue(post);

        const { res, next } = await invoke(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID },
                body: {
                    title: '  Updated title  ',
                    content: ' Updated content ',
                    category: ' Rice ',
                    image: 'https://example.com/rice.jpg',
                    status: 'Archived',
                    user: OTHER_USER_ID
                }
            })
        );

        expect(next).not.toHaveBeenCalled();

        expect(post.title).toBe('Updated title');
        expect(post.content).toBe('Updated content');
        expect(post.category).toBe('Rice');
        expect(post.image).toBe('https://example.com/rice.jpg');

        expect(post.status).toBe('Active');
        expect(post.user).toBe(USER_ID);

        expect(post.save).toHaveBeenCalledTimes(1);
        expect(post.populate).toHaveBeenCalledTimes(2);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Community post updated successfully.',
            data: post
        });
    });

    test('allows an owner to remove an image', async () => {
        const post = makePost({
            image: 'https://example.com/old.jpg'
        });

        CommunityPost.findById.mockResolvedValue(post);

        await invoke(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID },
                body: { image: '' }
            })
        );

        expect(post.image).toBe('');
        expect(post.save).toHaveBeenCalledTimes(1);
    });

    test('allows an owner to clear an image with null', async () => {
        const post = makePost({
            image: 'https://example.com/old.jpg'
        });

        CommunityPost.findById.mockResolvedValue(post);

        await invoke(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID },
                body: { image: null }
            })
        );

        expect(post.image).toBe('');
    });

    test('rejects an invalid post ID', async () => {
        await expectAppError(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: 'invalid-id' }
            }),
            400,
            'Invalid post ID.'
        );

        expect(CommunityPost.findById).not.toHaveBeenCalled();
    });

    test('rejects a missing post', async () => {
        CommunityPost.findById.mockResolvedValue(null);

        await expectAppError(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            }),
            404,
            'Community post not found.'
        );
    });

    test('prevents another user from updating a post', async () => {
        CommunityPost.findById.mockResolvedValue(
            makePost({ user: OTHER_USER_ID })
        );

        await expectAppError(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID },
                body: { title: 'Unauthorized update' }
            }),
            403,
            'You can only manage your own posts.'
        );

        expect(CommunityPost.findById.mock.results[0].value).toBeDefined();
    });

    test('rejects updates to an archived post', async () => {
        const post = makePost({
            status: 'Archived'
        });

        CommunityPost.findById.mockResolvedValue(post);

        await expectAppError(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID },
                body: { title: 'Updated title' }
            }),
            400,
            'This post is no longer active.'
        );

        expect(post.save).not.toHaveBeenCalled();
    });

    test.each([
        ['title', 201, 'Title cannot exceed 200 characters.'],
        ['content', 5001, 'Content cannot exceed 5000 characters.'],
        ['category', 101, 'Category cannot exceed 100 characters.']
    ])('validates updated %s length', async (field, length, message) => {
        CommunityPost.findById.mockResolvedValue(makePost());

        await expectAppError(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID },
                body: { [field]: 'x'.repeat(length) }
            }),
            400,
            message
        );
    });

    test('rejects an invalid updated image', async () => {
        CommunityPost.findById.mockResolvedValue(makePost());

        await expectAppError(
            controller.updateCommunityPost,
            makeRequest({
                params: { id: POST_ID },
                body: { image: 'x'.repeat(3000001) }
            }),
            400,
            'Image cannot exceed 3000000 characters.'
        );
    });
});

describe('archiveCommunityPost', () => {
    test('archives an owned post', async () => {
        const post = makePost();

        CommunityPost.findById.mockResolvedValue(post);

        const { res, next } = await invoke(
            controller.archiveCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(post.status).toBe('Archived');
        expect(post.save).toHaveBeenCalledTimes(1);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Community post archived successfully.',
            data: { _id: POST_ID }
        });
    });

    test('removes the archived post from its linked AgriTip shares', async () => {
        const post = makePost({
            agriTip: TIP_ID
        });

        const tip = {
            sharedBy: [USER_ID, OTHER_USER_ID],
            shares: 2,
            save: jest.fn().mockResolvedValue(undefined)
        };

        CommunityPost.findById.mockResolvedValue(post);
        AgriTip.findById.mockResolvedValue(tip);

        await invoke(
            controller.archiveCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(AgriTip.findById).toHaveBeenCalledWith(TIP_ID);
        expect(tip.sharedBy).toEqual([OTHER_USER_ID]);
        expect(tip.shares).toBe(1);
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(post.status).toBe('Archived');
    });

    test('does not save a linked AgriTip if it cannot be found', async () => {
        const post = makePost({
            agriTip: TIP_ID
        });

        CommunityPost.findById.mockResolvedValue(post);
        AgriTip.findById.mockResolvedValue(null);

        const { res } = await invoke(
            controller.archiveCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(post.status).toBe('Archived');
        expect(res.status).toHaveBeenCalledWith(200);
    });

    test('returns successfully if the post is already archived', async () => {
        const post = makePost({
            status: 'Archived',
            agriTip: TIP_ID
        });

        CommunityPost.findById.mockResolvedValue(post);

        const { res } = await invoke(
            controller.archiveCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(AgriTip.findById).not.toHaveBeenCalled();
        expect(post.save).not.toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Post is already archived.',
            data: { _id: POST_ID }
        });
    });

    test('prevents a non-owner from archiving a post', async () => {
        CommunityPost.findById.mockResolvedValue(
            makePost({ user: OTHER_USER_ID })
        );

        await expectAppError(
            controller.archiveCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            }),
            403,
            'You can only manage your own posts.'
        );
    });

    test('rejects an invalid post ID', async () => {
        await expectAppError(
            controller.archiveCommunityPost,
            makeRequest({
                params: { id: 'invalid-id' }
            }),
            400,
            'Invalid post ID.'
        );
    });
});

describe('shareCommunityPost', () => {
    test('records a share for an active post', async () => {
        const post = makePost();

        CommunityPost.findById.mockResolvedValue(post);

        const { res, next } = await invoke(
            controller.shareCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(post.sharedBy).toEqual([USER_ID]);
        expect(post.shares).toBe(1);
        expect(post.save).toHaveBeenCalledTimes(1);
        expect(post.populate).toHaveBeenCalledTimes(2);

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Community post share recorded.',
            data: post
        });
    });

    test('does not duplicate an existing share', async () => {
        const post = makePost({
            sharedBy: [USER_ID],
            shares: 1
        });

        CommunityPost.findById.mockResolvedValue(post);

        const { res } = await invoke(
            controller.shareCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(post.sharedBy).toEqual([USER_ID]);
        expect(post.shares).toBe(1);
        expect(post.save).not.toHaveBeenCalled();

        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'You have already shared this post.',
            data: post
        });
    });

    test('rejects sharing an archived post', async () => {
        CommunityPost.findById.mockResolvedValue(
            makePost({ status: 'Archived' })
        );

        await expectAppError(
            controller.shareCommunityPost,
            makeRequest({
                params: { id: POST_ID }
            }),
            400,
            'This post is no longer active.'
        );
    });

    test('rejects an invalid post ID', async () => {
        await expectAppError(
            controller.shareCommunityPost,
            makeRequest({
                params: { id: 'invalid-id' }
            }),
            400,
            'Invalid post ID.'
        );
    });
});

describe('addComment', () => {
    test('adds a comment and notifies the post owner', async () => {
        const post = makePost({
            user: OTHER_USER_ID
        });

        CommunityPost.findById.mockResolvedValue(post);

        const { res, next } = await invoke(
            controller.addComment,
            makeRequest({
                params: { id: POST_ID },
                body: {
                    content: '  Good farming advice.  '
                }
            })
        );

        expect(next).not.toHaveBeenCalled();

        expect(post.comments).toEqual([
            {
                user: USER_ID,
                content: 'Good farming advice.'
            }
        ]);

        expect(post.save).toHaveBeenCalledTimes(1);

        expect(Notification.create).toHaveBeenCalledWith({
            recipient: OTHER_USER_ID,
            sender: USER_ID,
            type: 'comment',
            title: 'New Comment',
            message: 'Test Farmer commented on your community post.',
            link: `/community/${POST_ID}`
        });

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Comment added successfully.',
            data: post
        });
    });

    test('does not notify when the owner comments on their own post', async () => {
        const post = makePost();

        CommunityPost.findById.mockResolvedValue(post);

        await invoke(
            controller.addComment,
            makeRequest({
                params: { id: POST_ID },
                body: { content: 'My own update.' }
            })
        );

        expect(Notification.create).not.toHaveBeenCalled();
        expect(post.comments).toHaveLength(1);
    });

    test('still adds a comment if notification creation fails', async () => {
        const post = makePost({
            user: OTHER_USER_ID
        });

        CommunityPost.findById.mockResolvedValue(post);

        const logSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        Notification.create.mockRejectedValue(
            new Error('Notification database unavailable')
        );

        try {
            const { res, next } = await invoke(
                controller.addComment,
                makeRequest({
                    params: { id: POST_ID },
                    body: { content: 'Helpful advice.' }
                })
            );

            expect(next).not.toHaveBeenCalled();
            expect(post.comments).toHaveLength(1);
            expect(post.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(logSpy).toHaveBeenCalledWith(
                'Notification creation failed:',
                'Notification database unavailable'
            );
        } finally {
            logSpy.mockRestore();
        }
    });

    test.each([
        ['', 'Comment is required.'],
        ['   ', 'Comment is required.'],
        [123, 'Comment must be text.'],
        ['x'.repeat(1001), 'Comment cannot exceed 1000 characters.']
    ])('rejects invalid comment content', async (content, message) => {
        CommunityPost.findById.mockResolvedValue(makePost());

        await expectAppError(
            controller.addComment,
            makeRequest({
                params: { id: POST_ID },
                body: { content }
            }),
            400,
            message
        );
    });

    test('rejects comments on archived posts', async () => {
        CommunityPost.findById.mockResolvedValue(
            makePost({ status: 'Archived' })
        );

        await expectAppError(
            controller.addComment,
            makeRequest({
                params: { id: POST_ID },
                body: { content: 'A comment' }
            }),
            400,
            'This post is no longer active.'
        );
    });
});

describe('deleteComment', () => {
    test('deletes a comment owned by the current user', async () => {
        const comment = {
            user: USER_ID,
            deleteOne: jest.fn()
        };

        const post = makePost({
            comments: {
                id: jest.fn().mockReturnValue(comment)
            }
        });

        CommunityPost.findById.mockResolvedValue(post);

        const { res, next } = await invoke(
            controller.deleteComment,
            makeRequest({
                params: {
                    postId: POST_ID,
                    commentId: COMMENT_ID
                }
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(comment.deleteOne).toHaveBeenCalledTimes(1);
        expect(post.save).toHaveBeenCalledTimes(1);
        expect(post.populate).toHaveBeenCalledTimes(2);

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Comment deleted successfully.',
            data: post
        });
    });

    test('rejects an invalid post ID', async () => {
        await expectAppError(
            controller.deleteComment,
            makeRequest({
                params: {
                    postId: 'invalid-id',
                    commentId: COMMENT_ID
                }
            }),
            400,
            'Invalid post ID.'
        );

        expect(CommunityPost.findById).not.toHaveBeenCalled();
    });

    test('rejects an invalid comment ID', async () => {
        await expectAppError(
            controller.deleteComment,
            makeRequest({
                params: {
                    postId: POST_ID,
                    commentId: 'invalid-id'
                }
            }),
            400,
            'Invalid comment ID.'
        );

        expect(CommunityPost.findById).not.toHaveBeenCalled();
    });

    test('rejects a missing post', async () => {
        CommunityPost.findById.mockResolvedValue(null);

        await expectAppError(
            controller.deleteComment,
            makeRequest({
                params: {
                    postId: POST_ID,
                    commentId: COMMENT_ID
                }
            }),
            404,
            'Community post not found.'
        );
    });

    test('rejects a missing comment', async () => {
        const post = makePost({
            comments: {
                id: jest.fn().mockReturnValue(null)
            }
        });

        CommunityPost.findById.mockResolvedValue(post);

        await expectAppError(
            controller.deleteComment,
            makeRequest({
                params: {
                    postId: POST_ID,
                    commentId: COMMENT_ID
                }
            }),
            404,
            'Comment not found.'
        );
    });

    test('prevents deleting another user’s comment', async () => {
        const comment = {
            user: OTHER_USER_ID,
            deleteOne: jest.fn()
        };

        const post = makePost({
            comments: {
                id: jest.fn().mockReturnValue(comment)
            }
        });

        CommunityPost.findById.mockResolvedValue(post);

        await expectAppError(
            controller.deleteComment,
            makeRequest({
                params: {
                    postId: POST_ID,
                    commentId: COMMENT_ID
                }
            }),
            403,
            'You can only delete your own comments.'
        );

        expect(comment.deleteOne).not.toHaveBeenCalled();
        expect(post.save).not.toHaveBeenCalled();
    });
});

describe('toggleLike', () => {
    test('adds a like and notifies the owner', async () => {
        const post = makePost({
            user: OTHER_USER_ID
        });

        CommunityPost.findById.mockResolvedValue(post);

        const { res, next } = await invoke(
            controller.toggleLike,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(post.likes).toEqual([USER_ID]);
        expect(post.save).toHaveBeenCalledTimes(1);

        expect(Notification.create).toHaveBeenCalledWith({
            recipient: OTHER_USER_ID,
            sender: USER_ID,
            type: 'like',
            title: 'New Like',
            message: 'Test Farmer liked your community post.',
            link: `/community/${POST_ID}`
        });

        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: post
        });
    });

    test('removes an existing like without creating a notification', async () => {
        const post = makePost({
            likes: [USER_ID, OTHER_USER_ID]
        });

        CommunityPost.findById.mockResolvedValue(post);

        await invoke(
            controller.toggleLike,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(post.likes).toEqual([OTHER_USER_ID]);
        expect(post.save).toHaveBeenCalledTimes(1);
        expect(Notification.create).not.toHaveBeenCalled();
    });

    test('does not notify when a user likes their own post', async () => {
        const post = makePost();

        CommunityPost.findById.mockResolvedValue(post);

        await invoke(
            controller.toggleLike,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(post.likes).toEqual([USER_ID]);
        expect(Notification.create).not.toHaveBeenCalled();
    });

    test('still records a like if notification creation fails', async () => {
        const post = makePost({
            user: OTHER_USER_ID
        });

        CommunityPost.findById.mockResolvedValue(post);

        const logSpy = jest
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        Notification.create.mockRejectedValue(
            new Error('Notification failed')
        );

        try {
            const { res, next } = await invoke(
                controller.toggleLike,
                makeRequest({
                    params: { id: POST_ID }
                })
            );

            expect(next).not.toHaveBeenCalled();
            expect(post.likes).toEqual([USER_ID]);
            expect(post.save).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(logSpy).toHaveBeenCalledWith(
                'Notification creation failed:',
                'Notification failed'
            );
        } finally {
            logSpy.mockRestore();
        }
    });

    test('rejects likes on archived posts', async () => {
        CommunityPost.findById.mockResolvedValue(
            makePost({ status: 'Archived' })
        );

        await expectAppError(
            controller.toggleLike,
            makeRequest({
                params: { id: POST_ID }
            }),
            400,
            'This post is no longer active.'
        );
    });

    test('rejects an invalid post ID', async () => {
        await expectAppError(
            controller.toggleLike,
            makeRequest({
                params: { id: 'invalid-id' }
            }),
            400,
            'Invalid post ID.'
        );

        expect(CommunityPost.findById).not.toHaveBeenCalled();
    });
});

describe('shared controller error handling', () => {
    test('forwards an unexpected post lookup error', async () => {
        CommunityPost.findById.mockRejectedValue(
            new Error('Database connection lost')
        );

        const { next } = await invoke(
            controller.toggleLike,
            makeRequest({
                params: { id: POST_ID }
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Database connection lost'
            })
        );
    });

    test('uses Mongoose ObjectId validation for supplied IDs', async () => {
        const valid = mongoose.isValidObjectId(POST_ID);
        const invalid = mongoose.isValidObjectId('not-an-object-id');

        expect(valid).toBe(true);
        expect(invalid).toBe(false);
    });
});