const mongoose = require('mongoose');
const AgriTip = require('../models/AgriTip');
const CommunityPost = require('../models/CommunityPost');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const PUBLIC_USER_FIELDS = 'name profilePhoto role state lga location';

const MAX_TITLE_LENGTH = 150;
const MAX_CONTENT_LENGTH = 5000;
const MAX_CATEGORY_LENGTH = 100;
const MAX_REGION_LENGTH = 100;
const MAX_SOURCE_LENGTH = 2048;
const MAX_IMAGE_LENGTH = 3000000;
const MAX_COMMENT_LENGTH = 1000;
const MAX_SEARCH_LENGTH = 100;
const MAX_PAGE_SIZE = 50;

const isAdmin = (req) => req.user?.role === 'admin';

const canManageTip = (req, tip) => {
    if (isAdmin(req)) {
        return true;
    }

    return Boolean(
        req.user?._id &&
        tip.createdBy &&
        tip.createdBy.toString() === req.user._id.toString()
    );
};

const escapeRegex = (value) =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateObjectId = (id, label = 'ID') => {
    if (
        typeof id !== 'string' ||
        !/^[a-f\d]{24}$/i.test(id) ||
        !mongoose.Types.ObjectId.isValid(id)
    ) {
        throw new AppError(`Invalid ${label}.`, 400);
    }
};

const validateString = (
    value,
    field,
    { required = false, max = 5000, min = 0 } = {}
) => {
    if (value === undefined) {
        if (required) {
            throw new AppError(`${field} is required.`, 400);
        }

        return undefined;
    }

    if (typeof value !== 'string') {
        throw new AppError(`${field} must be a string.`, 400);
    }

    const trimmed = value.trim();

    if (required && !trimmed) {
        throw new AppError(`${field} is required.`, 400);
    }

    if (trimmed.length < min) {
        throw new AppError(
            `${field} must be at least ${min} characters long.`,
            400
        );
    }

    if (trimmed.length > max) {
        throw new AppError(
            `${field} cannot exceed ${max} characters.`,
            400
        );
    }

    return trimmed;
};

const validateEnum = (value, field, allowedValues) => {
    if (value === undefined) {
        return undefined;
    }

    if (
        typeof value !== 'string' ||
        !allowedValues.includes(value)
    ) {
        throw new AppError(`${field} has an invalid value.`, 400);
    }

    return value;
};

const validateImage = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === '') {
        return '';
    }

    if (typeof value !== 'string' || value.length > MAX_IMAGE_LENGTH) {
        throw new AppError('Image is invalid or too large.', 400);
    }

    const isJpegDataUrl =
        /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);

    const isHttpUrl =
        value.length <= MAX_SOURCE_LENGTH &&
        /^https?:\/\/\S+$/i.test(value);

    if (!isJpegDataUrl && !isHttpUrl) {
        throw new AppError(
            'Image must be a valid JPEG data URL or HTTP(S) URL.',
            400
        );
    }

    return value;
};

const validateTipFields = (body, { partial = false } = {}) => {
    const fields = {};

    const title = validateString(body.title, 'Title', {
        required: !partial,
        max: MAX_TITLE_LENGTH,
    });

    const content = validateString(body.content, 'Content', {
        required: !partial,
        min: 5,
        max: MAX_CONTENT_LENGTH,
    });

    const category = validateString(body.category, 'Category', {
        required: !partial,
        max: MAX_CATEGORY_LENGTH,
    });

    const language = validateEnum(
        body.language,
        'Language',
        ['English', 'Hausa']
    );

    const region = validateString(body.region, 'Region', {
        max: MAX_REGION_LENGTH,
    });

    const source = validateString(body.source, 'Source', {
        max: MAX_SOURCE_LENGTH,
    });

    const priority = validateEnum(
        body.priority,
        'Priority',
        ['Normal', 'Important', 'Urgent']
    );

    const status = validateEnum(
        body.status,
        'Status',
        ['Draft', 'Published', 'Archived']
    );

    const image = validateImage(body.image);

    if (title !== undefined) fields.title = title;
    if (content !== undefined) fields.content = content;
    if (category !== undefined) fields.category = category;
    if (language !== undefined) fields.language = language;
    if (region !== undefined) fields.region = region;
    if (source !== undefined) fields.source = source;
    if (priority !== undefined) fields.priority = priority;
    if (status !== undefined) fields.status = status;
    if (image !== undefined) fields.image = image;

    return fields;
};

const createNotificationSafely = async (data) => {
    try {
        await Notification.create(data);
    } catch (error) {
        console.error('Notification creation failed:', error.message);
    }
};

const populateTip = async (tip) => {
    await tip.populate('createdBy', PUBLIC_USER_FIELDS);
    await tip.populate('comments.user', PUBLIC_USER_FIELDS);
    return tip;
};

const findTipOrThrow = async (id) => {
    validateObjectId(id, 'agricultural tip ID');

    const tip = await AgriTip.findById(id);

    if (!tip) {
        throw new AppError('Agricultural tip not found.', 404);
    }

    return tip;
};

const getPagination = (query) => {
    const parsedPage = Number.parseInt(query.page, 10);
    const parsedLimit = Number.parseInt(query.limit, 10);

    const page = Number.isSafeInteger(parsedPage) && parsedPage > 0
        ? Math.min(parsedPage, 1000000)
        : 1;

    const limit = Number.isSafeInteger(parsedLimit) && parsedLimit > 0
        ? Math.min(parsedLimit, MAX_PAGE_SIZE)
        : 15;

    return {
        page,
        limit,
        skip: (page - 1) * limit,
    };
};

exports.createTip = asyncHandler(async (req, res) => {
    const fields = validateTipFields(req.body || {});

    const tip = await AgriTip.create({
        ...fields,
        createdBy: req.user._id,
    });

    await populateTip(tip);

    res.status(201).json({
        success: true,
        message: 'Agricultural tip created successfully.',
        data: tip,
    });
});

exports.getTips = asyncHandler(async (req, res) => {
    const query = {};
    const mine = req.query.mine === 'true';

    if (mine) {
        if (!req.user?._id) {
            throw new AppError(
                'You must be logged in to view your own tips.',
                401
            );
        }

        query.createdBy = req.user._id;
    } else {
        query.status = 'Published';
    }

    if (req.query.category !== undefined) {
        query.category = validateString(
            req.query.category,
            'Category',
            { required: true, max: MAX_CATEGORY_LENGTH }
        );
    }

    if (req.query.language !== undefined) {
        query.language = validateEnum(
            req.query.language,
            'Language',
            ['English', 'Hausa']
        );
    }

    if (req.query.region !== undefined) {
        query.region = validateString(
            req.query.region,
            'Region',
            { required: true, max: MAX_REGION_LENGTH }
        );
    }

    if (req.query.priority !== undefined) {
        query.priority = validateEnum(
            req.query.priority,
            'Priority',
            ['Normal', 'Important', 'Urgent']
        );
    }

    if (req.query.search !== undefined) {
        const search = validateString(
            req.query.search,
            'Search',
            { max: MAX_SEARCH_LENGTH }
        );

        if (search) {
            const safeSearch = escapeRegex(search);

            query.$or = [
                {
                    title: {
                        $regex: safeSearch,
                        $options: 'i',
                    },
                },
                {
                    content: {
                        $regex: safeSearch,
                        $options: 'i',
                    },
                },
            ];
        }
    }

    const { page, limit, skip } = getPagination(req.query);

    const total = await AgriTip.countDocuments(query);

    const tips = await AgriTip.find(query)
        .populate('createdBy', PUBLIC_USER_FIELDS)
        .populate('comments.user', PUBLIC_USER_FIELDS)
        .sort({
            priority: -1,
            createdAt: -1,
            _id: -1,
        })
        .skip(skip)
        .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
        success: true,
        count: tips.length,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
        mine,
        data: tips,
    });
});

exports.getFeaturedTips = asyncHandler(async (req, res) => {
    const tips = await AgriTip.find({
        status: 'Published',
        priority: {
            $in: ['Urgent', 'Important'],
        },
    })
        .populate('createdBy', PUBLIC_USER_FIELDS)
        .populate('comments.user', PUBLIC_USER_FIELDS)
        .sort({
            createdAt: -1,
        })
        .limit(6);

    res.status(200).json({
        success: true,
        count: tips.length,
        data: tips,
    });
});

exports.updateTip = asyncHandler(async (req, res) => {
    const tip = await findTipOrThrow(req.params.id);

    if (!canManageTip(req, tip)) {
        throw new AppError(
            'You can only manage agricultural tips that you created.',
            403
        );
    }

    if (tip.status === 'Archived') {
        throw new AppError(
            'Archived tips cannot be edited.',
            400
        );
    }

    const fields = validateTipFields(req.body || {}, {
        partial: true,
    });

    if (Object.keys(fields).length === 0) {
        throw new AppError(
            'Provide at least one valid field to update.',
            400
        );
    }

    Object.assign(tip, fields);

    await tip.save();
    await populateTip(tip);

    res.status(200).json({
        success: true,
        message: 'Agricultural tip updated successfully.',
        data: tip,
    });
});

exports.deleteTip = asyncHandler(async (req, res) => {
    const tip = await findTipOrThrow(req.params.id);

    if (!canManageTip(req, tip)) {
        throw new AppError(
            'You can only manage agricultural tips that you created.',
            403
        );
    }

    tip.status = 'Archived';
    await tip.save();

    res.status(200).json({
        success: true,
        message: 'Agricultural tip deleted successfully.',
        data: {
            _id: tip._id,
            status: tip.status,
        },
    });
});

exports.toggleLike = asyncHandler(async (req, res) => {
    const tip = await findTipOrThrow(req.params.id);

    if (tip.status !== 'Published') {
        throw new AppError(
            'This tip is no longer available.',
            400
        );
    }

    const userId = req.user._id.toString();

    const alreadyLiked = tip.likes.some(
        (id) => id.toString() === userId
    );

    if (alreadyLiked) {
        tip.likes = tip.likes.filter(
            (id) => id.toString() !== userId
        );
    } else {
        tip.likes.push(req.user._id);

        if (
            tip.createdBy &&
            tip.createdBy.toString() !== userId
        ) {
            await createNotificationSafely({
                recipient: tip.createdBy,
                sender: req.user._id,
                type: 'like',
                title: 'New Like',
                message: `${req.user.name || 'Someone'} liked your agricultural tip.`,
                link: '/community',
            });
        }
    }

    await tip.save();
    await populateTip(tip);

    res.status(200).json({
        success: true,
        data: tip,
    });
});

exports.addComment = asyncHandler(async (req, res) => {
    const tip = await findTipOrThrow(req.params.id);

    if (tip.status !== 'Published') {
        throw new AppError(
            'Comments cannot be added to this tip.',
            400
        );
    }

    const content = validateString(
        req.body?.content,
        'Comment content',
        {
            required: true,
            min: 1,
            max: MAX_COMMENT_LENGTH,
        }
    );

    tip.comments.push({
        user: req.user._id,
        content,
    });

    await tip.save();

    if (
        tip.createdBy &&
        tip.createdBy.toString() !== req.user._id.toString()
    ) {
        await createNotificationSafely({
            recipient: tip.createdBy,
            sender: req.user._id,
            type: 'comment',
            title: 'New Comment',
            message: `${req.user.name || 'Someone'} commented on your agricultural tip.`,
            link: '/community',
        });
    }

    await populateTip(tip);

    res.status(200).json({
        success: true,
        message: 'Comment added successfully.',
        data: tip,
    });
});

exports.deleteComment = asyncHandler(async (req, res) => {
    const tip = await findTipOrThrow(req.params.tipId);

    validateObjectId(req.params.commentId, 'comment ID');

    const comment = tip.comments.id(req.params.commentId);

    if (!comment) {
        throw new AppError('Comment not found.', 404);
    }

    if (
        comment.user.toString() !== req.user._id.toString()
    ) {
        throw new AppError(
            'You can only delete your own comments.',
            403
        );
    }

    comment.deleteOne();
    await tip.save();
    await populateTip(tip);

    res.status(200).json({
        success: true,
        message: 'Comment deleted.',
        data: tip,
    });
});

exports.shareTip = asyncHandler(async (req, res) => {
    const tip = await findTipOrThrow(req.params.id);

    if (tip.status !== 'Published') {
        throw new AppError(
            'This agricultural tip is no longer available.',
            400
        );
    }

    const userId = req.user._id.toString();

    const alreadyShared = tip.sharedBy.some(
        (id) => id.toString() === userId
    );

    if (alreadyShared) {
        throw new AppError(
            'You have already shared this agricultural tip to the Community.',
            400
        );
    }

    const existingCommunityPost = await CommunityPost.findOne({
        agriTip: tip._id,
        user: req.user._id,
        status: 'Active',
    });

    if (existingCommunityPost) {
        throw new AppError(
            'You have already shared this agricultural tip to the Community.',
            400
        );
    }

    const communityPost = await CommunityPost.create({
        title: tip.title,
        content: tip.content,
        category: tip.category,
        image: tip.image || '',
        user: req.user._id,
        agriTip: tip._id,
    });

    try {
        if (!tip.sharedBy.some((id) => id.toString() === userId)) {
            tip.sharedBy.push(req.user._id);
        }

        tip.shares = tip.sharedBy.length;
        await tip.save();
    } catch (error) {
        await CommunityPost.deleteOne({ _id: communityPost._id });
        throw error;
    }

    await populateTip(tip);

    res.status(200).json({
        success: true,
        message: 'Agricultural tip shared to the Community.',
        data: tip,
        communityPost,
    });
});

exports.unshareTip = asyncHandler(async (req, res) => {
    const tip = await findTipOrThrow(req.params.id);
    const userId = req.user._id.toString();

    const hasShared = tip.sharedBy.some(
        (id) => id.toString() === userId
    );

    if (!hasShared) {
        throw new AppError(
            'You have not shared this agricultural tip to the Community.',
            400
        );
    }

    const communityPost = await CommunityPost.findOne({
        agriTip: tip._id,
        user: req.user._id,
        status: 'Active',
    });

    if (communityPost) {
        communityPost.status = 'Archived';
        await communityPost.save();
    }

    tip.sharedBy = tip.sharedBy.filter(
        (id) => id.toString() !== userId
    );

    tip.shares = tip.sharedBy.length;

    await tip.save();
    await populateTip(tip);

    res.status(200).json({
        success: true,
        message: 'Agricultural tip removed from the Community.',
        data: tip,
    });
});