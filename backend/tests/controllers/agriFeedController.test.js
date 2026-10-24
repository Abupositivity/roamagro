const mongoose = require('mongoose');

jest.mock('../../models/AgriTip', () => ({
    create: jest.fn(),
    countDocuments: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
}));

jest.mock('../../models/CommunityPost', () => ({
    create: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
}));

jest.mock('../../models/Notification', () => ({
    create: jest.fn(),
}));

const AgriTip = require('../../models/AgriTip');
const CommunityPost = require('../../models/CommunityPost');
const Notification = require('../../models/Notification');
const controller = require('../../controllers/agriFeedController');

const USER_ID = '507f1f77bcf86cd799439011';
const OTHER_USER_ID = '507f191e810c19729de860ea';
const TIP_ID = '507f1f77bcf86cd799439012';
const COMMENT_ID = '507f1f77bcf86cd799439013';
const COMMUNITY_POST_ID = '507f1f77bcf86cd799439014';

const makeObjectId = (id) => new mongoose.Types.ObjectId(id);

const makeRequest = ({
    user = { _id: USER_ID, name: 'Test Farmer', role: 'farmer' },
    params = {},
    query = {},
    body = {},
} = {}) => ({
    user,
    params,
    query,
    body,
});

const makeResponse = () => {
    const res = {
        status: jest.fn(),
        json: jest.fn(),
    };

    res.status.mockReturnValue(res);
    res.json.mockReturnValue(res);

    return res;
};

const execute = async (handler, req) => {
    const res = makeResponse();
    const next = jest.fn();

    await handler(req, res, next);

    return { req, res, next };
};

const makeTip = (overrides = {}) => {
    const tip = {
        _id: makeObjectId(TIP_ID),
        title: 'Growing Maize',
        content: 'Use good seeds and prepare the soil before planting.',
        category: 'Crop Farming',
        language: 'English',
        region: 'Northern Nigeria',
        source: 'Agricultural Extension Service',
        priority: 'Normal',
        status: 'Published',
        image: '',
        createdBy: makeObjectId(USER_ID),
        likes: [],
        comments: [],
        sharedBy: [],
        shares: 0,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        populate: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };

    return tip;
};

const makeQueryChain = (result) => {
    const chain = {
        populate: jest.fn(),
        sort: jest.fn(),
        skip: jest.fn(),
        limit: jest.fn(),
    };

    chain.populate.mockReturnValue(chain);
    chain.sort.mockReturnValue(chain);
    chain.skip.mockReturnValue(chain);
    chain.limit.mockResolvedValue(result);

    return chain;
};

const makeComment = ({
    id = COMMENT_ID,
    user = USER_ID,
    content = 'Helpful advice',
} = {}) => ({
    _id: makeObjectId(id),
    user: makeObjectId(user),
    content,
    deleteOne: jest.fn(),
});

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
});

describe('AgriFeed controller - createTip', () => {
    test('creates a tip, assigns the authenticated user, populates it and returns 201', async () => {
        const tip = makeTip();
        AgriTip.create.mockResolvedValue(tip);

        const { res, next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: '  Growing Maize  ',
                    content: '  Use good seeds and prepare the soil.  ',
                    category: '  Crop Farming  ',
                    language: 'English',
                    region: '  Northern Nigeria  ',
                    source: '  Extension Service  ',
                    priority: 'Important',
                    status: 'Published',
                    image: '',
                },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(AgriTip.create).toHaveBeenCalledWith({
            title: 'Growing Maize',
            content: 'Use good seeds and prepare the soil.',
            category: 'Crop Farming',
            language: 'English',
            region: 'Northern Nigeria',
            source: 'Extension Service',
            priority: 'Important',
            status: 'Published',
            image: '',
            createdBy: USER_ID,
        });
        expect(tip.populate).toHaveBeenNthCalledWith(
            1,
            'createdBy',
            'name profilePhoto role state lga location'
        );
        expect(tip.populate).toHaveBeenNthCalledWith(
            2,
            'comments.user',
            'name profilePhoto role state lga location'
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Agricultural tip created successfully.',
            data: tip,
        });
    });

    test('rejects a missing title', async () => {
        const { res, next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                },
            })
        );

        expect(AgriTip.create).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Title is required.',
                statusCode: 400,
            })
        );
    });

    test('rejects blank title', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: '   ',
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Title is required.',
                statusCode: 400,
            })
        );
    });

    test('rejects missing content', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    category: 'Crop Farming',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Content is required.',
                statusCode: 400,
            })
        );
    });

    test('rejects content shorter than five characters', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'abcd',
                    category: 'Crop Farming',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Content must be at least 5 characters long.',
                statusCode: 400,
            })
        );
    });

    test('rejects a missing category', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'This content is long enough.',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Category is required.',
                statusCode: 400,
            })
        );
    });

    test('rejects non-string text fields', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 123,
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Title must be a string.',
                statusCode: 400,
            })
        );
    });

    test('rejects a title exceeding 150 characters', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'T'.repeat(151),
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Title cannot exceed 150 characters.',
                statusCode: 400,
            })
        );
    });

    test('rejects content exceeding 5000 characters', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'C'.repeat(5001),
                    category: 'Crop Farming',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Content cannot exceed 5000 characters.',
                statusCode: 400,
            })
        );
    });

    test('rejects a category exceeding 100 characters', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'This content is long enough.',
                    category: 'C'.repeat(101),
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Category cannot exceed 100 characters.',
                statusCode: 400,
            })
        );
    });

    test.each([
        ['language', 'French', 'Language has an invalid value.'],
        ['priority', 'Critical', 'Priority has an invalid value.'],
        ['status', 'Deleted', 'Status has an invalid value.'],
    ])('rejects invalid %s values', async (field, value, message) => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                    [field]: value,
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message,
                statusCode: 400,
            })
        );
    });

    test('rejects an image that is not an HTTP(S) URL or JPEG data URL', async () => {
        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                    image: 'javascript:alert(1)',
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Image must be a valid JPEG data URL or HTTP(S) URL.',
                statusCode: 400,
            })
        );
    });

    test('accepts a valid HTTPS image URL', async () => {
        const tip = makeTip();
        AgriTip.create.mockResolvedValue(tip);

        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                    image: 'https://example.com/maize.jpg',
                },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(AgriTip.create).toHaveBeenCalledWith(
            expect.objectContaining({
                image: 'https://example.com/maize.jpg',
            })
        );
    });

    test('accepts a JPEG base64 data URL', async () => {
        const tip = makeTip();
        AgriTip.create.mockResolvedValue(tip);

        const { next } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                    image: 'data:image/jpeg;base64,SGVsbG8=',
                },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(AgriTip.create).toHaveBeenCalledWith(
            expect.objectContaining({
                image: 'data:image/jpeg;base64,SGVsbG8=',
            })
        );
    });

    test('forwards database errors', async () => {
        AgriTip.create.mockRejectedValue(new Error('Database unavailable'));

        const { next, res } = await execute(
            controller.createTip,
            makeRequest({
                body: {
                    title: 'Growing Maize',
                    content: 'This content is long enough.',
                    category: 'Crop Farming',
                },
            })
        );

        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Database unavailable',
            })
        );
    });
});

describe('AgriFeed controller - getTips', () => {
    test('returns published tips with default pagination', async () => {
        const tips = [makeTip()];
        const chain = makeQueryChain(tips);

        AgriTip.countDocuments.mockResolvedValue(1);
        AgriTip.find.mockReturnValue(chain);

        const { res, next } = await execute(
            controller.getTips,
            makeRequest()
        );

        expect(next).not.toHaveBeenCalled();
        expect(AgriTip.countDocuments).toHaveBeenCalledWith({
            status: 'Published',
        });
        expect(AgriTip.find).toHaveBeenCalledWith({
            status: 'Published',
        });
        expect(chain.sort).toHaveBeenCalledWith({
            priority: -1,
            createdAt: -1,
            _id: -1,
        });
        expect(chain.skip).toHaveBeenCalledWith(0);
        expect(chain.limit).toHaveBeenCalledWith(15);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            count: 1,
            total: 1,
            page: 1,
            limit: 15,
            totalPages: 1,
            hasMore: false,
            mine: false,
            data: tips,
        });
    });

    test('filters by category, language, region and priority', async () => {
        const chain = makeQueryChain([]);
        AgriTip.countDocuments.mockResolvedValue(0);
        AgriTip.find.mockReturnValue(chain);

        const { next } = await execute(
            controller.getTips,
            makeRequest({
                query: {
                    category: 'Poultry',
                    language: 'Hausa',
                    region: 'Kaduna',
                    priority: 'Urgent',
                },
            })
        );

        const expectedQuery = {
            status: 'Published',
            category: 'Poultry',
            language: 'Hausa',
            region: 'Kaduna',
            priority: 'Urgent',
        };

        expect(next).not.toHaveBeenCalled();
        expect(AgriTip.countDocuments).toHaveBeenCalledWith(expectedQuery);
        expect(AgriTip.find).toHaveBeenCalledWith(expectedQuery);
    });

    test('returns the authenticated user’s tips when mine=true', async () => {
        const chain = makeQueryChain([]);
        AgriTip.countDocuments.mockResolvedValue(0);
        AgriTip.find.mockReturnValue(chain);

        const { res, next } = await execute(
            controller.getTips,
            makeRequest({
                query: { mine: 'true' },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(AgriTip.find).toHaveBeenCalledWith({
            createdBy: USER_ID,
        });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                mine: true,
                total: 0,
                data: [],
            })
        );
    });

    test('rejects mine=true for an unauthenticated user', async () => {
        const req = makeRequest({
            query: { mine: 'true' },
        });

        req.user = undefined;

        const { next } = await execute(
            controller.getTips,
            req
        );

        expect(AgriTip.find).not.toHaveBeenCalled();
        expect(AgriTip.countDocuments).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'You must be logged in to view your own tips.',
                statusCode: 401,
            })
        );
    });

    test('uses a safe case-insensitive search expression', async () => {
        const chain = makeQueryChain([]);
        AgriTip.countDocuments.mockResolvedValue(0);
        AgriTip.find.mockReturnValue(chain);

        await execute(
            controller.getTips,
            makeRequest({
                query: { search: 'maize.*' },
            })
        );

        expect(AgriTip.find).toHaveBeenCalledWith({
            status: 'Published',
            $or: [
                {
                    title: {
                        $regex: 'maize\\.\\*',
                        $options: 'i',
                    },
                },
                {
                    content: {
                        $regex: 'maize\\.\\*',
                        $options: 'i',
                    },
                },
            ],
        });
    });

    test('rejects a search longer than 100 characters', async () => {
        const { next } = await execute(
            controller.getTips,
            makeRequest({
                query: { search: 's'.repeat(101) },
            })
        );

        expect(AgriTip.find).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Search cannot exceed 100 characters.',
                statusCode: 400,
            })
        );
    });

    test('rejects an invalid language filter', async () => {
        const { next } = await execute(
            controller.getTips,
            makeRequest({
                query: { language: 'French' },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Language has an invalid value.',
                statusCode: 400,
            })
        );
    });

    test('rejects a blank category filter', async () => {
        const { next } = await execute(
            controller.getTips,
            makeRequest({
                query: { category: '   ' },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Category is required.',
                statusCode: 400,
            })
        );
    });

    test('caps page size at 50 and calculates the correct offset', async () => {
        const chain = makeQueryChain([]);
        AgriTip.countDocuments.mockResolvedValue(100);
        AgriTip.find.mockReturnValue(chain);

        const { res } = await execute(
            controller.getTips,
            makeRequest({
                query: {
                    page: '3',
                    limit: '500',
                },
            })
        );

        expect(chain.skip).toHaveBeenCalledWith(100);
        expect(chain.limit).toHaveBeenCalledWith(50);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 3,
                limit: 50,
                total: 100,
                totalPages: 2,
                hasMore: false,
            })
        );
    });

    test('falls back to page 1 and limit 15 for invalid pagination', async () => {
        const chain = makeQueryChain([]);
        AgriTip.countDocuments.mockResolvedValue(0);
        AgriTip.find.mockReturnValue(chain);

        const { res } = await execute(
            controller.getTips,
            makeRequest({
                query: {
                    page: '-2',
                    limit: 'invalid',
                },
            })
        );

        expect(chain.skip).toHaveBeenCalledWith(0);
        expect(chain.limit).toHaveBeenCalledWith(15);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                page: 1,
                limit: 15,
            })
        );
    });

    test('reports additional pages correctly', async () => {
        const chain = makeQueryChain([makeTip()]);
        AgriTip.countDocuments.mockResolvedValue(31);
        AgriTip.find.mockReturnValue(chain);

        const { res } = await execute(
            controller.getTips,
            makeRequest({
                query: {
                    page: '1',
                    limit: '15',
                },
            })
        );

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                total: 31,
                totalPages: 3,
                hasMore: true,
            })
        );
    });

    test('forwards query errors', async () => {
        AgriTip.countDocuments.mockRejectedValue(
            new Error('Count failed')
        );

        const { next } = await execute(
            controller.getTips,
            makeRequest()
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Count failed',
            })
        );
    });
});

describe('AgriFeed controller - getFeaturedTips', () => {
    test('returns published urgent and important tips, limited to six', async () => {
        const tips = [makeTip()];
        const chain = makeQueryChain(tips);
        AgriTip.find.mockReturnValue(chain);

        const { res, next } = await execute(
            controller.getFeaturedTips,
            makeRequest()
        );

        expect(next).not.toHaveBeenCalled();
        expect(AgriTip.find).toHaveBeenCalledWith({
            status: 'Published',
            priority: {
                $in: ['Urgent', 'Important'],
            },
        });
        expect(chain.sort).toHaveBeenCalledWith({
            createdAt: -1,
        });
        expect(chain.limit).toHaveBeenCalledWith(6);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            count: 1,
            data: tips,
        });
    });

    test('forwards database errors', async () => {
        AgriTip.find.mockImplementation(() => {
            throw new Error('Featured query failed');
        });

        const { next } = await execute(
            controller.getFeaturedTips,
            makeRequest()
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Featured query failed',
            })
        );
    });
});

describe('AgriFeed controller - updateTip', () => {
    test('updates an owned tip with valid fields', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { res, next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: TIP_ID },
                body: {
                    title: 'Updated Maize Guide',
                    content: 'Updated content with enough characters.',
                    priority: 'Important',
                },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.title).toBe('Updated Maize Guide');
        expect(tip.content).toBe('Updated content with enough characters.');
        expect(tip.priority).toBe('Important');
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Agricultural tip updated successfully.',
            data: tip,
        });
    });

    test('allows an admin to update another user’s tip', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                user: {
                    _id: USER_ID,
                    role: 'admin',
                },
                params: { id: TIP_ID },
                body: { title: 'Admin Updated Title' },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.title).toBe('Admin Updated Title');
        expect(tip.save).toHaveBeenCalledTimes(1);
    });

    test('rejects updating a tip owned by another user', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: TIP_ID },
                body: { title: 'Unauthorized Update' },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'You can only manage agricultural tips that you created.',
                statusCode: 403,
            })
        );
    });

    test('returns 404 when the tip does not exist', async () => {
        AgriTip.findById.mockResolvedValue(null);

        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: TIP_ID },
                body: { title: 'Updated Title' },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Agricultural tip not found.',
                statusCode: 404,
            })
        );
    });

    test('rejects invalid tip IDs', async () => {
        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: 'not-an-object-id' },
                body: { title: 'Updated Title' },
            })
        );

        expect(AgriTip.findById).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Invalid agricultural tip ID.',
                statusCode: 400,
            })
        );
    });

    test('rejects editing an archived tip', async () => {
        const tip = makeTip({ status: 'Archived' });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: TIP_ID },
                body: { title: 'Updated Title' },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Archived tips cannot be edited.',
                statusCode: 400,
            })
        );
    });

    test('rejects an empty update', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: TIP_ID },
                body: {},
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Provide at least one valid field to update.',
                statusCode: 400,
            })
        );
    });

    test('rejects invalid update fields', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: TIP_ID },
                body: { priority: 'Critical' },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Priority has an invalid value.',
                statusCode: 400,
            })
        );
    });

    test('forwards save errors', async () => {
        const tip = makeTip();
        tip.save.mockRejectedValue(new Error('Save failed'));
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.updateTip,
            makeRequest({
                params: { id: TIP_ID },
                body: { title: 'Updated Title' },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Save failed',
            })
        );
    });
});

describe('AgriFeed controller - deleteTip', () => {
    test('archives an owned tip rather than physically deleting it', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { res, next } = await execute(
            controller.deleteTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.status).toBe('Archived');
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Agricultural tip deleted successfully.',
            data: {
                _id: tip._id,
                status: 'Archived',
            },
        });
    });

    test('rejects deletion by a non-owner non-admin', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.deleteTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                statusCode: 403,
            })
        );
    });

    test('allows an admin to archive another user’s tip', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.deleteTip,
            makeRequest({
                user: {
                    _id: USER_ID,
                    role: 'admin',
                },
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.status).toBe('Archived');
        expect(tip.save).toHaveBeenCalledTimes(1);
    });
});

describe('AgriFeed controller - toggleLike', () => {
    test('adds a like to a published tip and notifies its owner', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        AgriTip.findById.mockResolvedValue(tip);
        Notification.create.mockResolvedValue({});

        const { res, next } = await execute(
            controller.toggleLike,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.likes).toHaveLength(1);
        expect(tip.likes[0].toString()).toBe(USER_ID);
        expect(Notification.create).toHaveBeenCalledWith({
            recipient: tip.createdBy,
            sender: USER_ID,
            type: 'like',
            title: 'New Like',
            message: 'Test Farmer liked your agricultural tip.',
            link: '/community',
        });
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            data: tip,
        });
    });

    test('removes an existing like without creating a notification', async () => {
        const tip = makeTip({
            likes: [makeObjectId(USER_ID)],
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.toggleLike,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.likes).toHaveLength(0);
        expect(Notification.create).not.toHaveBeenCalled();
        expect(tip.save).toHaveBeenCalledTimes(1);
    });

    test('does not notify when the tip owner likes their own tip', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        await execute(
            controller.toggleLike,
            makeRequest({
                params: { id: TIP_ID },
                user: {
                    _id: USER_ID,
                    name: 'Test Farmer',
                    role: 'farmer',
                },
            })
        );

        expect(Notification.create).not.toHaveBeenCalled();
    });

    test('does not fail if notification creation fails', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        AgriTip.findById.mockResolvedValue(tip);
        Notification.create.mockRejectedValue(
            new Error('Notification service unavailable')
        );

        const { res, next } = await execute(
            controller.toggleLike,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(console.error).toHaveBeenCalledWith(
            'Notification creation failed:',
            'Notification service unavailable'
        );
    });

    test('rejects liking a non-published tip', async () => {
        const tip = makeTip({ status: 'Archived' });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.toggleLike,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'This tip is no longer available.',
                statusCode: 400,
            })
        );
    });
});

describe('AgriFeed controller - addComment', () => {
    test('adds a comment and notifies the tip owner', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        tip.comments = {
            push: jest.fn((comment) => {
                tip.commentsList.push(comment);
            }),
            list: undefined,
        };
        tip.commentsList = [];
        AgriTip.findById.mockResolvedValue(tip);

        const { res, next } = await execute(
            controller.addComment,
            makeRequest({
                params: { id: TIP_ID },
                body: { content: '  This is helpful advice.  ' },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.comments.push).toHaveBeenCalledWith({
            user: USER_ID,
            content: 'This is helpful advice.',
        });
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(Notification.create).toHaveBeenCalledWith({
            recipient: tip.createdBy,
            sender: USER_ID,
            type: 'comment',
            title: 'New Comment',
            message: 'Test Farmer commented on your agricultural tip.',
            link: '/community',
        });
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Comment added successfully.',
            data: tip,
        });
    });

    test('rejects a blank comment', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.addComment,
            makeRequest({
                params: { id: TIP_ID },
                body: { content: '   ' },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Comment content is required.',
                statusCode: 400,
            })
        );
    });

    test('rejects a comment longer than 1000 characters', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.addComment,
            makeRequest({
                params: { id: TIP_ID },
                body: { content: 'C'.repeat(1001) },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Comment content cannot exceed 1000 characters.',
                statusCode: 400,
            })
        );
    });

    test('rejects comments on archived tips', async () => {
        const tip = makeTip({ status: 'Archived' });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.addComment,
            makeRequest({
                params: { id: TIP_ID },
                body: { content: 'Helpful advice' },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Comments cannot be added to this tip.',
                statusCode: 400,
            })
        );
    });

    test('does not notify when the owner comments on their own tip', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        await execute(
            controller.addComment,
            makeRequest({
                params: { id: TIP_ID },
                body: { content: 'My own note' },
            })
        );

        expect(Notification.create).not.toHaveBeenCalled();
    });

    test('does not fail when notification creation fails', async () => {
        const tip = makeTip({
            createdBy: makeObjectId(OTHER_USER_ID),
        });
        AgriTip.findById.mockResolvedValue(tip);
        Notification.create.mockRejectedValue(new Error('Notify failed'));

        const { next } = await execute(
            controller.addComment,
            makeRequest({
                params: { id: TIP_ID },
                body: { content: 'Helpful advice' },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(console.error).toHaveBeenCalledWith(
            'Notification creation failed:',
            'Notify failed'
        );
    });
});

describe('AgriFeed controller - deleteComment', () => {
    test('deletes a comment owned by the authenticated user', async () => {
        const comment = makeComment();
        const tip = makeTip({
            comments: {
                id: jest.fn().mockReturnValue(comment),
            },
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { res, next } = await execute(
            controller.deleteComment,
            makeRequest({
                params: {
                    tipId: TIP_ID,
                    commentId: COMMENT_ID,
                },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(comment.deleteOne).toHaveBeenCalledTimes(1);
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Comment deleted.',
            data: tip,
        });
    });

    test('rejects an invalid comment ID', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.deleteComment,
            makeRequest({
                params: {
                    tipId: TIP_ID,
                    commentId: 'invalid-id',
                },
            })
        );

        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Invalid comment ID.',
                statusCode: 400,
            })
        );
    });

    test('returns 404 when the comment does not exist', async () => {
        const tip = makeTip({
            comments: {
                id: jest.fn().mockReturnValue(null),
            },
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.deleteComment,
            makeRequest({
                params: {
                    tipId: TIP_ID,
                    commentId: COMMENT_ID,
                },
            })
        );

        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Comment not found.',
                statusCode: 404,
            })
        );
    });

    test('rejects deleting another user’s comment', async () => {
        const comment = makeComment({ user: OTHER_USER_ID });
        const tip = makeTip({
            comments: {
                id: jest.fn().mockReturnValue(comment),
            },
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.deleteComment,
            makeRequest({
                params: {
                    tipId: TIP_ID,
                    commentId: COMMENT_ID,
                },
            })
        );

        expect(comment.deleteOne).not.toHaveBeenCalled();
        expect(tip.save).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'You can only delete your own comments.',
                statusCode: 403,
            })
        );
    });
});

describe('AgriFeed controller - shareTip', () => {
    test('shares a published tip to the Community', async () => {
        const tip = makeTip();
        const communityPost = {
            _id: makeObjectId(COMMUNITY_POST_ID),
        };

        AgriTip.findById.mockResolvedValue(tip);
        CommunityPost.findOne.mockResolvedValue(null);
        CommunityPost.create.mockResolvedValue(communityPost);

        const { res, next } = await execute(
            controller.shareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(CommunityPost.create).toHaveBeenCalledWith({
            title: tip.title,
            content: tip.content,
            category: tip.category,
            image: '',
            user: USER_ID,
            agriTip: tip._id,
        });
        expect(tip.sharedBy).toHaveLength(1);
        expect(tip.sharedBy[0].toString()).toBe(USER_ID);
        expect(tip.shares).toBe(1);
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Agricultural tip shared to the Community.',
            data: tip,
            communityPost,
        });
    });

    test('rejects sharing a non-published tip', async () => {
        const tip = makeTip({ status: 'Archived' });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.shareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(CommunityPost.create).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'This agricultural tip is no longer available.',
                statusCode: 400,
            })
        );
    });

    test('rejects sharing when the user is already in sharedBy', async () => {
        const tip = makeTip({
            sharedBy: [makeObjectId(USER_ID)],
            shares: 1,
        });
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.shareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(CommunityPost.findOne).not.toHaveBeenCalled();
        expect(CommunityPost.create).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'You have already shared this agricultural tip to the Community.',
                statusCode: 400,
            })
        );
    });

    test('rejects sharing when an active Community post already exists', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);
        CommunityPost.findOne.mockResolvedValue({
            _id: makeObjectId(COMMUNITY_POST_ID),
        });

        const { next } = await execute(
            controller.shareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(CommunityPost.create).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'You have already shared this agricultural tip to the Community.',
                statusCode: 400,
            })
        );
    });

    test('deletes the newly created Community post if saving the tip fails', async () => {
        const tip = makeTip();
        tip.save.mockRejectedValue(new Error('Tip save failed'));

        const communityPost = {
            _id: makeObjectId(COMMUNITY_POST_ID),
        };

        AgriTip.findById.mockResolvedValue(tip);
        CommunityPost.findOne.mockResolvedValue(null);
        CommunityPost.create.mockResolvedValue(communityPost);
        CommunityPost.deleteOne.mockResolvedValue({ deletedCount: 1 });

        const { next } = await execute(
            controller.shareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(CommunityPost.deleteOne).toHaveBeenCalledWith({
            _id: communityPost._id,
        });
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'Tip save failed',
            })
        );
    });
});

describe('AgriFeed controller - unshareTip', () => {
    test('archives the active Community post and removes the share', async () => {
        const tip = makeTip({
            sharedBy: [makeObjectId(USER_ID), makeObjectId(OTHER_USER_ID)],
            shares: 2,
        });

        const communityPost = {
            status: 'Active',
            save: jest.fn().mockResolvedValue(undefined),
        };

        AgriTip.findById.mockResolvedValue(tip);
        CommunityPost.findOne.mockResolvedValue(communityPost);

        const { res, next } = await execute(
            controller.unshareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(CommunityPost.findOne).toHaveBeenCalledWith({
            agriTip: tip._id,
            user: USER_ID,
            status: 'Active',
        });
        expect(communityPost.status).toBe('Archived');
        expect(communityPost.save).toHaveBeenCalledTimes(1);
        expect(tip.sharedBy).toHaveLength(1);
        expect(tip.sharedBy[0].toString()).toBe(OTHER_USER_ID);
        expect(tip.shares).toBe(1);
        expect(tip.save).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({
            success: true,
            message: 'Agricultural tip removed from the Community.',
            data: tip,
        });
    });

    test('rejects unsharing when the user has not shared the tip', async () => {
        const tip = makeTip();
        AgriTip.findById.mockResolvedValue(tip);

        const { next } = await execute(
            controller.unshareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(CommunityPost.findOne).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalledWith(
            expect.objectContaining({
                message: 'You have not shared this agricultural tip to the Community.',
                statusCode: 400,
            })
        );
    });

    test('updates the tip even if no active Community post is found', async () => {
        const tip = makeTip({
            sharedBy: [makeObjectId(USER_ID)],
            shares: 1,
        });

        AgriTip.findById.mockResolvedValue(tip);
        CommunityPost.findOne.mockResolvedValue(null);

        const { next } = await execute(
            controller.unshareTip,
            makeRequest({
                params: { id: TIP_ID },
            })
        );

        expect(next).not.toHaveBeenCalled();
        expect(tip.sharedBy).toHaveLength(0);
        expect(tip.shares).toBe(0);
        expect(tip.save).toHaveBeenCalledTimes(1);
    });
});