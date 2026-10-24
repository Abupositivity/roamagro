const mongoose = require('mongoose');
const User = require('../models/User');
const UserReport = require('../models/UserReport');
const CommunityPost = require('../models/CommunityPost');
const MarketplaceItem = require('../models/MarketplaceItem');
const FarmProject = require('../models/FarmProject');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const AgriTip = require('../models/AgriTip');
const PriceAlert = require('../models/PriceAlert');
const PriceIndex = require('../models/PriceIndex');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const COMMUNITY_USER_FIELDS = 'name profilePhoto role state lga location';
const MARKETPLACE_USER_FIELDS = 'name phone location state profilePhoto role bio';

const escapeRegex = value =>
    value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateUserId = userId => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID.', 400);
    }
};

const PRIVATE_FIELDS =
    '-password -googleId -emailVerificationToken -emailVerificationExpires -passwordResetToken -passwordResetExpires';

exports.getProfile = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const [
        user,
        communityCount,
        marketplaceCount,
        communityPosts,
        marketplaceListings
    ] = await Promise.all([
        User.findById(userId)
            .select(PRIVATE_FIELDS)
            .lean(),
        CommunityPost.countDocuments({
            user: userId,
            status: 'Active'
        }),
        MarketplaceItem.countDocuments({
            user: userId,
            available: true
        }),
        CommunityPost.find({
            user: userId,
            status: 'Active'
        })
            .populate('user', COMMUNITY_USER_FIELDS)
            .sort({ createdAt: -1 })
            .limit(3)
            .lean(),
        MarketplaceItem.find({
            user: userId,
            available: true
        })
            .populate('user', MARKETPLACE_USER_FIELDS)
            .sort({ createdAt: -1 })
            .limit(3)
            .lean()
    ]);

    if (!user) {
        throw new AppError('User profile not found.', 404);
    }

    res.status(200).json({
        success: true,
        data: {
            ...user,
            communityPosts,
            marketplaceListings,
            stats: {
                communityPosts: communityCount,
                marketplaceListings: marketplaceCount
            }
        }
    });
});

exports.updateProfile = asyncHandler(async (req, res) => {
    const allowedFields = [
        'name',
        'phone',
        'state',
        'lga',
        'location',
        'language',
        'profilePhoto',
        'bio'
    ];

    const updates = {};

    allowedFields.forEach(field => {
        if (Object.prototype.hasOwnProperty.call(req.body, field)) {
            updates[field] = req.body[field];
        }
    });

    if (Object.keys(updates).length === 0) {
        throw new AppError(
            'No profile information was provided.',
            400
        );
    }

    for (const field of allowedFields) {
        if (updates[field] !== undefined) {
            if (typeof updates[field] !== 'string') {
                throw new AppError(
                    `${field} must be text.`,
                    400
                );
            }

            updates[field] = updates[field].trim();
        }
    }

    if (updates.name !== undefined) {
        if (updates.name.length < 2 || updates.name.length > 100) {
            throw new AppError(
                'Name must be between 2 and 100 characters.',
                400
            );
        }
    }

    if (updates.bio !== undefined && updates.bio.length > 500) {
        throw new AppError(
            'Bio must not exceed 500 characters.',
            400
        );
    }

    if (updates.phone !== undefined && updates.phone.length > 30) {
        throw new AppError(
            'Phone number is too long.',
            400
        );
    }

    if (updates.state !== undefined && updates.state.length > 100) {
        throw new AppError('State is too long.', 400);
    }

    if (updates.lga !== undefined && updates.lga.length > 100) {
        throw new AppError('LGA is too long.', 400);
    }

    if (updates.location !== undefined && updates.location.length > 200) {
        throw new AppError('Location is too long.', 400);
    }

    if (updates.profilePhoto !== undefined && updates.profilePhoto.length > 3_000_000) {
        throw new AppError('Profile photo data is too large.', 400);
    }

    if (
        updates.language !== undefined &&
        !['English', 'Hausa'].includes(updates.language)
    ) {
        throw new AppError('Invalid language.', 400);
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        {
            new: true,
            runValidators: true
        }
    ).select(PRIVATE_FIELDS);

    if (!user) {
        throw new AppError('User profile not found.', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        data: user
    });
});

exports.searchUsers = asyncHandler(async (req, res) => {
    const search = String(req.query.search || '').trim().slice(0, 100);
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
        50
    );

    if (!search) {
        return res.status(200).json({
            success: true,
            data: [],
            pagination: {
                page,
                limit,
                total: 0,
                pages: 0
            }
        });
    }

    const regex = new RegExp(escapeRegex(search), 'i');

    const query = {
        _id: { $ne: req.user._id },
        accountStatus: 'active',
        $or: [
            { name: regex },
            { state: regex },
            { lga: regex },
            { location: regex }
        ]
    };

    const total = await User.countDocuments(query);

    const users = await User.find(query)
        .select('name profilePhoto bio state lga location language role')
        .sort({ name: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

    res.status(200).json({
        success: true,
        data: users,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

exports.searchAdminUsers = asyncHandler(async (req, res) => {
    const search = String(req.query.search || '').trim().slice(0, 100);

    if (!search) {
        return res.status(200).json({
            success: true,
            data: []
        });
    }

    if (search.length < 2) {
        throw new AppError(
            'Search must contain at least 2 characters.',
            400
        );
    }

    const regex = new RegExp(escapeRegex(search), 'i');

    const users = await User.find({
        $or: [
            { name: regex },
            { email: regex }
        ]
    })
        .select('name email profilePhoto role isVerified accountStatus createdAt')
        .sort({ name: 1 })
        .limit(25)
        .lean();

    res.status(200).json({
        success: true,
        data: users
    });
});

exports.getUserById = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    validateUserId(userId);

    const isSelf = String(userId) === String(req.user._id);

    const fields = isSelf
        ? 'name email profilePhoto bio phone state lga location language role createdAt'
        : 'name profilePhoto bio state lga location language role createdAt';

    const user = await User.findOne({
        _id: userId,
        accountStatus: 'active'
    })
        .select(fields)
        .lean();

    if (!user) {
        throw new AppError('User not found.', 404);
    }

    res.status(200).json({
        success: true,
        data: {
            ...user,
            isSelf
        }
    });
});

exports.reportUser = asyncHandler(async (req, res) => {
    const reportedUserId = req.params.userId;
    const reporterId = req.user._id;

    validateUserId(reportedUserId);

    if (String(reportedUserId) === String(reporterId)) {
        throw new AppError(
            'You cannot report your own account.',
            400
        );
    }

    const reportedUser = await User.findOne({
        _id: reportedUserId,
        accountStatus: 'active'
    });

    if (!reportedUser) {
        throw new AppError('User not found.', 404);
    }

    const { reason, details = '' } = req.body;

    const existingReport = await UserReport.findOne({
        reporter: reporterId,
        reportedUser: reportedUserId
    });

    if (existingReport) {
        throw new AppError(
            'You have already reported this user.',
            409
        );
    }

    const report = await UserReport.create({
        reporter: reporterId,
        reportedUser: reportedUserId,
        reason,
        details: String(details).trim()
    });

    res.status(201).json({
        success: true,
        message: 'Report submitted successfully.',
        data: {
            id: report._id
        }
    });
});

exports.deleteAccount = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const session = await mongoose.startSession();

    try {
        await session.withTransaction(async () => {
            const user = await User.findById(userId).session(session);

            if (!user) {
                throw new AppError('User account not found.', 404);
            }

            const ownTips = await AgriTip.find({
                createdBy: userId
            })
                .select('_id')
                .session(session);

            const ownTipIds = ownTips.map(tip => tip._id);

            const affectedTips = await AgriTip.find({
                sharedBy: userId
            })
                .select('_id sharedBy')
                .session(session);

            const affectedPosts = await CommunityPost.find({
                sharedBy: userId
            })
                .select('_id sharedBy')
                .session(session);

            await FarmProject.deleteMany(
                { user: userId },
                { session }
            );

            await MarketplaceItem.deleteMany(
                { user: userId },
                { session }
            );

            await CommunityPost.deleteMany(
                { user: userId },
                { session }
            );

            if (ownTipIds.length > 0) {
                await CommunityPost.updateMany(
                    { agriTip: { $in: ownTipIds } },
                    { $set: { agriTip: null } },
                    { session }
                );

                await AgriTip.deleteMany(
                    { _id: { $in: ownTipIds } },
                    { session }
                );
            }

            await AgriTip.updateMany(
                {},
                {
                    $pull: {
                        sharedBy: userId,
                        likes: userId,
                        bookmarks: userId,
                        comments: { user: userId }
                    }
                },
                { session }
            );

            await CommunityPost.updateMany(
                {},
                {
                    $pull: {
                        sharedBy: userId,
                        likes: userId,
                        comments: { user: userId }
                    }
                },
                { session }
            );

            for (const tip of affectedTips) {
                const remainingShares = tip.sharedBy.filter(
                    id => String(id) !== String(userId)
                ).length;

                await AgriTip.updateOne(
                    { _id: tip._id },
                    { $set: { shares: remainingShares } },
                    { session }
                );
            }

            for (const post of affectedPosts) {
                const remainingShares = post.sharedBy.filter(
                    id => String(id) !== String(userId)
                ).length;

                await CommunityPost.updateOne(
                    { _id: post._id },
                    { $set: { shares: remainingShares } },
                    { session }
                );
            }

            await Connection.deleteMany(
                {
                    $or: [
                        { requester: userId },
                        { recipient: userId }
                    ]
                },
                { session }
            );

            await Notification.deleteMany(
                {
                    $or: [
                        { recipient: userId },
                        { sender: userId }
                    ]
                },
                { session }
            );

            await UserReport.deleteMany(
                {
                    $or: [
                        { reporter: userId },
                        { reportedUser: userId },
                        { reviewedBy: userId }
                    ]
                },
                { session }
            );

            await PriceAlert.deleteMany(
                { user: userId },
                { session }
            );

            await PriceIndex.deleteMany(
                { user: userId },
                { session }
            );

            await User.deleteOne(
                { _id: userId },
                { session }
            );
        });

        res.status(200).json({
            success: true,
            message: 'Your RoamAgro account has been deleted successfully.'
        });
    } finally {
        await session.endSession();
    }
});

exports.getReports = asyncHandler(async (req, res) => {
    const page = Math.max(
        Number.parseInt(req.query.page, 10) || 1,
        1
    );

    const limit = Math.min(
        Math.max(Number.parseInt(req.query.limit, 10) || 20, 1),
        50
    );

    const allowedStatuses = [
        'Pending',
        'Reviewed',
        'Dismissed',
        'Action Taken'
    ];

    const filter = {};

    if (req.query.status) {
        if (!allowedStatuses.includes(req.query.status)) {
            throw new AppError('Invalid report status.', 400);
        }

        filter.status = req.query.status;
    }

    const [reports, total] = await Promise.all([
        UserReport.find(filter)
            .populate('reporter', 'name email profilePhoto role')
            .populate('reportedUser', 'name email profilePhoto role accountStatus')
            .populate('reviewedBy', 'name email')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        UserReport.countDocuments(filter)
    ]);

    res.status(200).json({
        success: true,
        data: reports,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
});

exports.updateReport = asyncHandler(async (req, res) => {
    const { status } = req.body;

    const allowedStatuses = [
        'Pending',
        'Reviewed',
        'Dismissed',
        'Action Taken'
    ];

    if (!allowedStatuses.includes(status)) {
        throw new AppError('Invalid report status.', 400);
    }

    if (!mongoose.Types.ObjectId.isValid(req.params.reportId)) {
        throw new AppError('Invalid report ID.', 400);
    }

    const report = await UserReport.findByIdAndUpdate(
        req.params.reportId,
        {
            status,
            reviewedBy: req.user._id,
            reviewedAt: new Date()
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!report) {
        throw new AppError('Report not found.', 404);
    }

    res.status(200).json({
        success: true,
        message: 'Report updated successfully.',
        data: report
    });
});

exports.updateUserRole = asyncHandler(async (req, res) => {
    const userId = req.params.userId;
    const { role } = req.body;

    const allowedRoles = [
        'farmer',
        'buyer',
        'extension_officer',
        'admin'
    ];

    validateUserId(userId);

    if (!allowedRoles.includes(role)) {
        throw new AppError('Invalid user role.', 400);
    }

    if (String(userId) === String(req.user._id)) {
        throw new AppError('You cannot change your own role.', 400);
    }

    const user = await User.findById(userId);

    if (!user) {
        throw new AppError('User not found.', 404);
    }

    if (user.role === role) {
        return res.status(200).json({
            success: true,
            message: 'User already has this role.',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                accountStatus: user.accountStatus
            }
        });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'User role updated successfully.',
        data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            accountStatus: user.accountStatus
        }
    });
});

exports.suspendUser = asyncHandler(async (req, res) => {
    validateUserId(req.params.userId);

    const user = await User.findById(req.params.userId);

    if (!user) {
        throw new AppError('User not found.', 404);
    }

    if (String(user._id) === String(req.user._id)) {
        throw new AppError('You cannot suspend your own account.', 400);
    }

    if (user.role === 'admin') {
        throw new AppError(
            'Administrator accounts cannot be suspended here.',
            400
        );
    }

    const { reason = '', durationDays = null } = req.body;

    if (typeof reason !== 'string' || reason.length > 500) {
        throw new AppError(
            'Suspension reason must be text of at most 500 characters.',
            400
        );
    }

    let suspendedUntil = null;

    if (durationDays !== null && durationDays !== '') {
        const days = Number(durationDays);

        if (!Number.isFinite(days) || days <= 0 || days > 3650) {
            throw new AppError(
                'Suspension duration must be between 1 and 3650 days.',
                400
            );
        }

        suspendedUntil = new Date(
            Date.now() + days * 24 * 60 * 60 * 1000
        );
    }

    user.accountStatus = 'suspended';
    user.suspensionReason = reason.trim();
    user.suspendedAt = new Date();
    user.suspendedUntil = suspendedUntil;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'User suspended successfully.',
        data: {
            userId: user._id,
            accountStatus: user.accountStatus,
            suspendedUntil: user.suspendedUntil
        }
    });
});

exports.restoreUser = asyncHandler(async (req, res) => {
    validateUserId(req.params.userId);

    const user = await User.findById(req.params.userId);

    if (!user) {
        throw new AppError('User not found.', 404);
    }

    user.accountStatus = 'active';
    user.suspensionReason = '';
    user.suspendedAt = null;
    user.suspendedUntil = null;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true,
        message: 'User account restored successfully.',
        data: {
            userId: user._id,
            accountStatus: user.accountStatus
        }
    });
});