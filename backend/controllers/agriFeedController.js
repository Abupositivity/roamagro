const AgriTip = require('../models/AgriTip');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @desc    Create a new agricultural tip
 * @route   POST /api/v1/feed
 * @access  Private (Admin / Extension Officer)
 */
exports.createTip = asyncHandler(async (req, res) => {
    const tip = await AgriTip.create({
        ...req.body,
        createdBy: req.user._id,
    });
    console.log(`✅ AgriTip created: ${tip.title}`);
    res.status(201).json({
        success: true,
        message: 'Agricultural tip created successfully.',
        data: tip,
    });
});

/**
 * @desc    Get all published agricultural tips
 * @route   GET /api/v1/feed
 * @access  Public
 */
exports.getTips = asyncHandler(async (req, res) => {
    const query = {
        status: 'Published',
    };
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
    if (req.query.search) {
        query.$or = [
            {
                title: {
                    $regex: req.query.search,
                    $options: 'i',
                },
            },
            {
                content: {
                    $regex: req.query.search,
                    $options: 'i',
                },
            },
        ];
    }

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await AgriTip.countDocuments(query);
    const tips = await AgriTip.find(query)
        .populate('createdBy', 'name')
        .sort({
            priority: -1,
            createdAt: -1,
        })
        .skip(skip)
        .limit(limit);
    res.status(200).json({
        success: true,
        count: tips.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: tips,
    });
});

/**
 * @desc    Get featured agricultural tips
 * @route   GET /api/v1/feed/featured
 * @access  Public
 */
exports.getFeaturedTips = asyncHandler(async (req, res) => {
    const tips = await AgriTip.find({
        status: 'Published',
        priority: {
            $in: ['Urgent', 'Important'],
        },
    })
        .populate('createdBy', 'name')
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

/**
 * @desc    Update agricultural tip
 * @route   PUT /api/v1/feed/:id
 * @access  Private (Admin / Extension Officer)
 */
exports.updateTip = asyncHandler(async (req, res) => {
    const tip = await AgriTip.findById(req.params.id);
    if (!tip) {
        throw new AppError('Agricultural tip not found.', 404);
    }
    Object.assign(tip, req.body);
    await tip.save();
    console.log(`✏️ AgriTip updated: ${tip.title}`);
    res.status(200).json({
        success: true,
        message: 'Agricultural tip updated successfully.',
        data: tip,
    });
});

/**
 * @desc    Delete agricultural tip
 * @route   DELETE /api/v1/feed/:id
 * @access  Private (Admin / Extension Officer)
 */
exports.deleteTip = asyncHandler(async (req, res) => {
    const tip = await AgriTip.findById(req.params.id);
    if (!tip) {
        throw new AppError('Agricultural tip not found.', 404);
    }
    await tip.deleteOne();
    console.log(`🗑️ AgriTip deleted: ${tip.title}`);
    res.status(200).json({
        success: true,
        message: 'Agricultural tip deleted successfully.',
    });
});