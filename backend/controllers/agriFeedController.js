const AgriTip = require('../models/AgriTip');
const CommunityPost = require('../models/CommunityPost');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const PUBLIC_USER_FIELDS = 'name profilePhoto role state lga location';

const isAdmin = (req) => req.user?.role === 'admin';

const canManageTip = (req, tip) => {
    if (isAdmin(req)) {
        return true;
    }

    return (
        tip.createdBy &&
        tip.createdBy.toString() === req.user._id.toString()
    );
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
    const tip = await AgriTip.findById(id);

    if (!tip) {
        throw new AppError('Agricultural tip not found.', 404);
    }

    return tip;
};

exports.createTip = asyncHandler(async (req, res) => {
    const tip = await AgriTip.create({
        ...req.body,
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
    const query = {
        status: 'Published',
    };

    if (req.query.mine === 'true') {
        query.createdBy = req.user._id;
    }

    if (req.query.category) {
        query.category = req.query.category;
    }

    if (req.query.language) {
        query.language = req.query.language;
    }

    if (req.query.region) {
        query.region = req.query.region;
    }

    if (req.query.priority) {
        query.priority = req.query.priority;
    }

    if (req.query.search?.trim()) {
        const search = req.query.search.trim();

        query.$or = [
            {
                title: {
                    $regex: search,
                    $options: 'i',
                },
            },
            {
                content: {
                    $regex: search,
                    $options: 'i',
                },
            },
        ];
    }

    const page = Math.max(
        parseInt(req.query.page, 10) || 1,
        1
    );

    const limit = Math.min(
        Math.max(
            parseInt(req.query.limit, 10) || 15,
            1
        ),
        50
    );

    const skip = (page - 1) * limit;

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
        mine: req.query.mine === 'true',
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

    const allowedFields = [
        'title',
        'content',
        'category',
        'language',
        'region',
        'image',
        'source',
        'priority',
        'status',
    ];

    allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
            tip[field] = req.body[field];
        }
    });

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

    const content = req.body.content?.trim();

    if (!content) {
        throw new AppError(
            'Comment content is required.',
            400
        );
    }

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
    const comment = tip.comments.id(req.params.commentId);

    if (!comment) {
        throw new AppError('Comment not found.', 404);
    }

    if (
        comment.user.toString() !==
        req.user._id.toString()
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
    const tip = await AgriTip.findById(req.params.id);

    if (!tip) {
        throw new AppError(
            'Agricultural tip not found.',
            404
        );
    }

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

    const existingCommunityPost =
        await CommunityPost.findOne({
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

    const communityPost =
        await CommunityPost.create({
            title: tip.title,
            content: tip.content,
            category: tip.category,
            image: tip.image || '',
            user: req.user._id,
            agriTip: tip._id,
        });

    tip.sharedBy.push(req.user._id);
    tip.shares = tip.sharedBy.length;

    await tip.save();

    await populateTip(tip);

    res.status(200).json({
        success: true,
        message:
            'Agricultural tip shared to the Community.',
        data: tip,
        communityPost,
    });
});

exports.unshareTip = asyncHandler(async (req, res) => {
    const tip = await AgriTip.findById(req.params.id);

    if (!tip) {
        throw new AppError(
            'Agricultural tip not found.',
            404
        );
    }

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

    const communityPost =
        await CommunityPost.findOne({
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
        message:
            'Agricultural tip removed from the Community.',
        data: tip,
    });
});