const mongoose = require('mongoose');
const AgriTip = require('../models/AgriTip');
const CommunityPost = require('../models/CommunityPost');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const PUBLIC_USER_FIELDS = 'name profilePhoto role state lga location';

const MAX_SEARCH_LENGTH = 100;
const MAX_CATEGORY_LENGTH = 100;
const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MAX_COMMENT_LENGTH = 1000;
const MAX_IMAGE_LENGTH = 3000000;

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateObjectId = (id, label = 'ID') => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError(`Invalid ${label}.`, 400);
    }
};

const validateText = (value, field, maxLength, required = true) => {
    if (typeof value !== 'string') {
        throw new AppError(`${field} must be text.`, 400);
    }

    const text = value.trim();

    if (required && !text) {
        throw new AppError(`${field} is required.`, 400);
    }

    if (text.length > maxLength) {
        throw new AppError(
            `${field} cannot exceed ${maxLength} characters.`,
            400
        );
    }

    return text;
};

const getPagination = (query) => {
    const requestedPage = Number.parseInt(query.page, 10);
    const requestedLimit = Number.parseInt(query.limit, 10);

    const page = Number.isSafeInteger(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;

    const limit = Number.isSafeInteger(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 15;

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

const createNotificationSafely = async (data) => {
    try {
        await Notification.create(data);
    } catch (error) {
        console.error('Notification creation failed:', error.message);
    }
};

const populatePostUsers = async (post) => {
    await post.populate('user', PUBLIC_USER_FIELDS);
    await post.populate('comments.user', PUBLIC_USER_FIELDS);
    return post;
};

const findPostById = async (id) => {
    validateObjectId(id, 'post ID');

    const post = await CommunityPost.findById(id);

    if (!post) {
        throw new AppError('Community post not found.', 404);
    }

    return post;
};

const ensurePostOwner = (post, userId) => {
    if (String(post.user) !== String(userId)) {
        throw new AppError('You can only manage your own posts.', 403);
    }
};

const ensureActivePost = (post) => {
    if (post.status !== 'Active') {
        throw new AppError('This post is no longer active.', 400);
    }
};

exports.createCommunityPost = asyncHandler(async (req, res) => {
    const title = validateText(
        req.body.title,
        'Title',
        MAX_TITLE_LENGTH
    );

    const content = validateText(
        req.body.content,
        'Content',
        MAX_CONTENT_LENGTH
    );

    const category = validateText(
        req.body.category,
        'Category',
        MAX_CATEGORY_LENGTH
    );

    let image = '';

    if (req.body.image !== undefined && req.body.image !== null) {
        image = validateText(
            req.body.image,
            'Image',
            MAX_IMAGE_LENGTH,
            false
        );
    }

    const post = await CommunityPost.create({
        title,
        content,
        category,
        image,
        user: req.user._id
    });

    await populatePostUsers(post);

    return res.status(201).json({
        success: true,
        message: 'Community post created successfully.',
        data: post
    });
});

exports.getCommunityPosts = asyncHandler(async (req, res) => {
    const { page, limit, skip } = getPagination(req.query);

    const search = req.query.search === undefined
        ? ''
        : validateText(
            req.query.search,
            'Search',
            MAX_SEARCH_LENGTH,
            false
        );

    const category = req.query.category === undefined
        ? ''
        : validateText(
            req.query.category,
            'Category',
            MAX_CATEGORY_LENGTH,
            false
        );

    const mine = req.query.mine === 'true' || req.query.mine === '1';

    const filter = { status: 'Active' };

    if (mine) {
        filter.user = req.user._id;
    }

    if (category && category.toLowerCase() !== 'all') {
        filter.category = category;
    }

    if (search) {
        const searchRegex = new RegExp(escapeRegex(search), 'i');

        filter.$or = [
            { title: searchRegex },
            { content: searchRegex }
        ];
    }

    let connectedUserIds = [];

    if (!mine) {
        const connections = await Connection.find({
            status: 'accepted',
            $or: [
                { requester: req.user._id },
                { recipient: req.user._id }
            ]
        })
            .select('requester recipient')
            .lean();

        const currentUserId = String(req.user._id);

        connectedUserIds = connections.map((connection) => (
            String(connection.requester) === currentUserId
                ? connection.recipient
                : connection.requester
        ));
    }

    const total = await CommunityPost.countDocuments(filter);

    const orderedPostIds = await CommunityPost.aggregate([
        { $match: filter },
        {
            $addFields: {
                connectionPriority: {
                    $cond: [
                        { $in: ['$user', connectedUserIds] },
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
        },
        { $skip: skip },
        { $limit: limit },
        { $project: { _id: 1 } }
    ]);

    const postIds = orderedPostIds.map((post) => post._id);

    let posts = [];

    if (postIds.length) {
        const fetchedPosts = await CommunityPost.find({
            _id: { $in: postIds }
        })
            .populate('user', PUBLIC_USER_FIELDS)
            .populate('comments.user', PUBLIC_USER_FIELDS)
            .lean();

        const postMap = new Map(
            fetchedPosts.map((post) => [String(post._id), post])
        );

        posts = postIds
            .map((id) => postMap.get(String(id)))
            .filter(Boolean);
    }

    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
        success: true,
        count: posts.length,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
        search,
        category,
        mine,
        connectionsFirst: !mine,
        connectedUsersCount: connectedUserIds.length,
        data: posts
    });
});

exports.getFeaturedPosts = asyncHandler(async (req, res) => {
    const posts = await CommunityPost.find({
        featured: true,
        status: 'Active'
    })
        .populate('user', PUBLIC_USER_FIELDS)
        .populate('comments.user', PUBLIC_USER_FIELDS)
        .sort({ createdAt: -1 })
        .limit(5);

    return res.status(200).json({
        success: true,
        data: posts
    });
});

exports.updateCommunityPost = asyncHandler(async (req, res) => {
    const post = await findPostById(req.params.id);

    ensurePostOwner(post, req.user._id);
    ensureActivePost(post);

    const allowedFields = ['title', 'content', 'category', 'image'];

    for (const field of allowedFields) {
        if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
            continue;
        }

        if (field === 'title') {
            post.title = validateText(
                req.body.title,
                'Title',
                MAX_TITLE_LENGTH
            );
        }

        if (field === 'content') {
            post.content = validateText(
                req.body.content,
                'Content',
                MAX_CONTENT_LENGTH
            );
        }

        if (field === 'category') {
            post.category = validateText(
                req.body.category,
                'Category',
                MAX_CATEGORY_LENGTH
            );
        }

        if (field === 'image') {
            if (req.body.image === null || req.body.image === '') {
                post.image = '';
            } else {
                post.image = validateText(
                    req.body.image,
                    'Image',
                    MAX_IMAGE_LENGTH
                );
            }
        }
    }

    await post.save();
    await populatePostUsers(post);

    return res.status(200).json({
        success: true,
        message: 'Community post updated successfully.',
        data: post
    });
});

exports.archiveCommunityPost = asyncHandler(async (req, res) => {
    const post = await findPostById(req.params.id);

    ensurePostOwner(post, req.user._id);

    if (post.status === 'Archived') {
        return res.status(200).json({
            success: true,
            message: 'Post is already archived.',
            data: { _id: post._id }
        });
    }

    if (post.agriTip) {
        const tip = await AgriTip.findById(post.agriTip);

        if (tip) {
            tip.sharedBy = tip.sharedBy.filter(
                (id) => String(id) !== String(req.user._id)
            );

            tip.shares = tip.sharedBy.length;

            await tip.save();
        }
    }

    post.status = 'Archived';
    await post.save();

    return res.status(200).json({
        success: true,
        message: 'Community post archived successfully.',
        data: { _id: post._id }
    });
});

exports.shareCommunityPost = asyncHandler(async (req, res) => {
    const post = await findPostById(req.params.id);

    ensureActivePost(post);

    const userId = String(req.user._id);
    const alreadyShared = post.sharedBy.some(
        (id) => String(id) === userId
    );

    if (!alreadyShared) {
        post.sharedBy.push(req.user._id);
        post.shares = post.sharedBy.length;
        await post.save();
    }

    await populatePostUsers(post);

    return res.status(200).json({
        success: true,
        message: alreadyShared
            ? 'You have already shared this post.'
            : 'Community post share recorded.',
        data: post
    });
});

exports.addComment = asyncHandler(async (req, res) => {
    const post = await findPostById(req.params.id);

    ensureActivePost(post);

    const content = validateText(
        req.body.content,
        'Comment',
        MAX_COMMENT_LENGTH
    );

    post.comments.push({
        user: req.user._id,
        content
    });

    await post.save();

    if (String(post.user) !== String(req.user._id)) {
        await createNotificationSafely({
            recipient: post.user,
            sender: req.user._id,
            type: 'comment',
            title: 'New Comment',
            message: `${req.user.name || 'Someone'} commented on your community post.`,
            link: `/community/${post._id}`
        });
    }

    await populatePostUsers(post);

    return res.status(201).json({
        success: true,
        message: 'Comment added successfully.',
        data: post
    });
});

exports.deleteComment = asyncHandler(async (req, res) => {
    validateObjectId(req.params.postId, 'post ID');
    validateObjectId(req.params.commentId, 'comment ID');

    const post = await CommunityPost.findById(req.params.postId);

    if (!post) {
        throw new AppError('Community post not found.', 404);
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
        throw new AppError('Comment not found.', 404);
    }

    if (String(comment.user) !== String(req.user._id)) {
        throw new AppError('You can only delete your own comments.', 403);
    }

    comment.deleteOne();
    await post.save();
    await populatePostUsers(post);

    return res.status(200).json({
        success: true,
        message: 'Comment deleted successfully.',
        data: post
    });
});

exports.toggleLike = asyncHandler(async (req, res) => {
    const post = await findPostById(req.params.id);

    ensureActivePost(post);

    const userId = String(req.user._id);
    const alreadyLiked = post.likes.some(
        (id) => String(id) === userId
    );

    if (alreadyLiked) {
        post.likes = post.likes.filter(
            (id) => String(id) !== userId
        );
    } else {
        post.likes.push(req.user._id);

        if (String(post.user) !== userId) {
            await createNotificationSafely({
                recipient: post.user,
                sender: req.user._id,
                type: 'like',
                title: 'New Like',
                message: `${req.user.name || 'Someone'} liked your community post.`,
                link: `/community/${post._id}`
            });
        }
    }

    await post.save();
    await populatePostUsers(post);

    return res.status(200).json({
        success: true,
        data: post
    });
});