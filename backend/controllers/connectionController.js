const mongoose = require('mongoose');
const User = require('../models/User');
const Connection = require('../models/Connection');
const MarketplaceItem = require('../models/MarketplaceItem');
const CommunityPost = require('../models/CommunityPost');
const Notification = require('../models/Notification');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const PUBLIC_USER_FIELDS = 'name profilePhoto bio state lga location language role createdAt';
const SEARCH_USER_FIELDS = 'name profilePhoto bio state lga location language role';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateUserId = (id) => {
    if (!mongoose.isValidObjectId(id)) {
        throw new AppError('Invalid user ID.', 400);
    }
};

const getPagination = (query) => {
    const requestedPage = Number.parseInt(query.page, 10);
    const requestedLimit = Number.parseInt(query.limit, 10);

    const page = Number.isFinite(requestedPage) && requestedPage > 0
        ? requestedPage
        : 1;
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;

    return {
        page,
        limit,
        skip: (page - 1) * limit
    };
};

const getTotalPages = (total, limit) => Math.ceil(total / limit);

const getPaginationResponse = (data, total, page, limit) => {
    const totalPages = getTotalPages(total, limit);

    return {
        success: true,
        count: data.length,
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages,
        data
    };
};

const getConnectionFilter = (userId, otherUserId) => ({
    $or: [
        { requester: userId, recipient: otherUserId },
        { requester: otherUserId, recipient: userId }
    ]
});

const normalizeConnectionStatus = (connection, currentUserId) => {
    if (!connection) return 'none';

    const currentId = String(currentUserId);
    const requesterId = String(connection.requester);
    const recipientId = String(connection.recipient);

    if (connection.status === 'accepted') return 'connected';

    if (requesterId === currentId) return 'outgoing_pending';
    if (recipientId === currentId) return 'incoming_pending';

    return 'none';
};

const createNotificationSafely = async ({
    sender,
    recipient,
    type,
    title,
    message,
    link
}) => {
    try {
        await Notification.create({
            sender,
            recipient,
            type,
            title,
            message,
            link
        });
    } catch (error) {
        console.error('Failed to create connection notification:', error.message);
    }
};

const getActiveUser = async (userId) => {
    return User.findOne({
        _id: userId,
        accountStatus: 'active'
    });
};

exports.searchUsers = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const searchTerm = String(
        req.query.search || req.query.q || req.query.query || ''
    ).trim();

    const { page, limit, skip } = getPagination(req.query);

    if (searchTerm.length > 100) {
        throw new AppError('Search term cannot exceed 100 characters.', 400);
    }

    if (searchTerm.length < 2) {
        return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasMore: false,
            data: []
        });
    }

    const searchRegex = new RegExp(escapeRegex(searchTerm), 'i');

    const filter = {
        _id: { $ne: currentUserId },
        accountStatus: 'active',
        $or: [
            { name: searchRegex },
            { email: searchRegex },
            { state: searchRegex },
            { lga: searchRegex },
            { location: searchRegex }
        ]
    };

    const [users, total] = await Promise.all([
        User.find(filter)
            .select(SEARCH_USER_FIELDS)
            .sort({ name: 1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter)
    ]);

    const connections = users.length
        ? await Connection.find({
            $or: [
                {
                    requester: currentUserId,
                    recipient: { $in: users.map((user) => user._id) }
                },
                {
                    requester: { $in: users.map((user) => user._id) },
                    recipient: currentUserId
                }
            ]
        }).select('requester recipient status')
        : [];

    const connectionMap = new Map();

    connections.forEach((connection) => {
        const otherUserId = String(
            String(connection.requester) === String(currentUserId)
                ? connection.recipient
                : connection.requester
        );

        connectionMap.set(otherUserId, connection);
    });

    const data = users.map((user) => {
        const connection = connectionMap.get(String(user._id));

        return {
            ...user,
            connectionStatus: normalizeConnectionStatus(connection, currentUserId),
            connectionId: connection ? connection._id : null
        };
    });

    return res.status(200).json(
        getPaginationResponse(data, total, page, limit)
    );
});

exports.discoverUsers = asyncHandler(async (req, res) => {
    const currentUser = req.user;
    const currentUserId = currentUser._id;
    const { page, limit, skip } = getPagination(req.query);

    const existingConnections = await Connection.find({
        $or: [
            { requester: currentUserId },
            { recipient: currentUserId }
        ]
    }).select('requester recipient');

    const excludedIds = new Set([String(currentUserId)]);

    existingConnections.forEach((connection) => {
        excludedIds.add(String(connection.requester));
        excludedIds.add(String(connection.recipient));
    });

    const filter = {
        _id: {
            $nin: Array.from(excludedIds).map((id) => new mongoose.Types.ObjectId(id))
        },
        accountStatus: 'active'
    };

    const [users, total] = await Promise.all([
        User.find(filter)
            .select(SEARCH_USER_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(),
        User.countDocuments(filter)
    ]);

    const scoreUser = (user) => {
        let score = 0;

        if (
            currentUser.state &&
            user.state &&
            currentUser.state.toLowerCase() === user.state.toLowerCase()
        ) {
            score += 3;
        }

        if (
            currentUser.lga &&
            user.lga &&
            currentUser.lga.toLowerCase() === user.lga.toLowerCase()
        ) {
            score += 2;
        }

        if (currentUser.role && user.role === currentUser.role) {
            score += 1;
        }

        return score;
    };

    const data = users
        .map((user) => ({
            ...user,
            connectionStatus: 'none',
            connectionId: null,
            recommendationScore: scoreUser(user)
        }))
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .map(({ recommendationScore, ...user }) => user);

    return res.status(200).json(
        getPaginationResponse(data, total, page, limit)
    );
});

exports.getPublicProfile = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    validateUserId(userId);

    const currentUserId = String(req.user._id);
    const isSelf = currentUserId === String(userId);

    const user = await User.findOne({
        _id: userId,
        accountStatus: 'active'
    }).select(PUBLIC_USER_FIELDS).lean();

    if (!user) {
        throw new AppError('User not found.', 404);
    }

    if (isSelf) {
        return res.status(200).json({
            success: true,
            data: {
                user,
                stats: {
                    connections: await Connection.countDocuments({
                        $or: [
                            { requester: userId, status: 'accepted' },
                            { recipient: userId, status: 'accepted' }
                        ]
                    }),
                    marketplaceListings: await MarketplaceItem.countDocuments({
                        user: userId,
                        available: true
                    }),
                    communityPosts: await CommunityPost.countDocuments({
                        user: userId,
                        status: 'active'
                    })
                },
                connectionStatus: 'self',
                connectionId: null
            }
        });
    }

    const [connection, connectionsCount, marketplaceListings, communityPosts] =
        await Promise.all([
            Connection.findOne(getConnectionFilter(currentUserId, userId)),
            Connection.countDocuments({
                $or: [
                    { requester: userId, status: 'accepted' },
                    { recipient: userId, status: 'accepted' }
                ]
            }),
            MarketplaceItem.find({
                user: userId,
                available: true
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean(),
            CommunityPost.find({
                user: userId,
                status: 'active'
            })
                .sort({ createdAt: -1 })
                .limit(3)
                .lean()
        ]);

    return res.status(200).json({
        success: true,
        data: {
            user,
            stats: {
                connections: connectionsCount,
                marketplaceListings: await MarketplaceItem.countDocuments({
                    user: userId,
                    available: true
                }),
                communityPosts: await CommunityPost.countDocuments({
                    user: userId,
                    status: 'active'
                })
            },
            marketplaceListings,
            communityPosts,
            connectionStatus: normalizeConnectionStatus(connection, currentUserId),
            connectionId: connection ? connection._id : null
        }
    });
});

exports.getConnectionStatus = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    validateUserId(userId);

    const currentUserId = String(req.user._id);

    if (currentUserId === String(userId)) {
        return res.status(200).json({
            success: true,
            data: {
                connectionStatus: 'self',
                connectionId: null
            }
        });
    }

    const otherUser = await getActiveUser(userId);

    if (!otherUser) {
        throw new AppError('User not found.', 404);
    }

    const connection = await Connection.findOne(
        getConnectionFilter(currentUserId, userId)
    );

    return res.status(200).json({
        success: true,
        data: {
            connectionStatus: normalizeConnectionStatus(connection, currentUserId),
            connectionId: connection ? connection._id : null
        }
    });
});

exports.sendConnectionRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    validateUserId(userId);

    if (String(currentUserId) === String(userId)) {
        throw new AppError('You cannot send a connection request to yourself.', 400);
    }

    const recipient = await getActiveUser(userId);

    if (!recipient) {
        throw new AppError('User not found or account is unavailable.', 404);
    }

    const existingConnection = await Connection.findOne(
        getConnectionFilter(currentUserId, userId)
    );

    if (existingConnection) {
        if (existingConnection.status === 'accepted') {
            throw new AppError('You are already connected with this user.', 409);
        }

        if (String(existingConnection.requester) === String(currentUserId)) {
            throw new AppError('You have already sent a connection request.', 409);
        }

        throw new AppError('This user has already sent you a connection request.', 409);
    }

    let connection;

    try {
        connection = await Connection.create({
            requester: currentUserId,
            recipient: userId,
            status: 'pending'
        });
    } catch (error) {
        if (error.code === 11000) {
            throw new AppError('A connection request already exists.', 409);
        }

        throw error;
    }

    await createNotificationSafely({
        sender: currentUserId,
        recipient: userId,
        type: 'connection_request',
        title: 'New connection request',
        message: `${req.user.name || 'A user'} sent you a connection request.`,
        link: '/connections'
    });

    const populatedConnection = await Connection.findById(connection._id)
        .populate('requester', PUBLIC_USER_FIELDS)
        .populate('recipient', PUBLIC_USER_FIELDS);

    return res.status(201).json({
        success: true,
        message: 'Connection request sent successfully.',
        data: populatedConnection
    });
});

exports.acceptConnectionRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    validateUserId(userId);

    const requester = await getActiveUser(userId);

    if (!requester) {
        throw new AppError('User not found or account is unavailable.', 404);
    }

    const connection = await Connection.findOneAndUpdate(
        {
            requester: userId,
            recipient: currentUserId,
            status: 'pending'
        },
        { status: 'accepted' },
        { new: true, runValidators: true }
    )
        .populate('requester', PUBLIC_USER_FIELDS)
        .populate('recipient', PUBLIC_USER_FIELDS);

    if (!connection) {
        throw new AppError('Pending connection request not found.', 404);
    }

    await createNotificationSafely({
        sender: currentUserId,
        recipient: userId,
        type: 'connection_accepted',
        title: 'Connection request accepted',
        message: `${req.user.name || 'A user'} accepted your connection request.`,
        link: '/connections'
    });

    return res.status(200).json({
        success: true,
        message: 'Connection request accepted.',
        data: connection
    });
});

exports.declineConnectionRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    validateUserId(userId);

    const connection = await Connection.findOneAndDelete({
        requester: userId,
        recipient: currentUserId,
        status: 'pending'
    });

    if (!connection) {
        throw new AppError('Pending connection request not found.', 404);
    }

    await createNotificationSafely({
        sender: currentUserId,
        recipient: userId,
        type: 'connection_rejected',
        title: 'Connection request declined',
        message: `${req.user.name || 'A user'} declined your connection request.`,
        link: '/connections'
    });

    return res.status(200).json({
        success: true,
        message: 'Connection request declined.'
    });
});

exports.cancelConnectionRequest = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    validateUserId(userId);

    const connection = await Connection.findOneAndDelete({
        requester: currentUserId,
        recipient: userId,
        status: 'pending'
    });

    if (!connection) {
        throw new AppError('Outgoing connection request not found.', 404);
    }

    return res.status(200).json({
        success: true,
        message: 'Connection request cancelled.'
    });
});

exports.removeConnection = asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    validateUserId(userId);

    if (String(currentUserId) === String(userId)) {
        throw new AppError('Invalid connection.', 400);
    }

    const connection = await Connection.findOneAndDelete({
        ...getConnectionFilter(currentUserId, userId),
        status: 'accepted'
    });

    if (!connection) {
        throw new AppError('Connection not found.', 404);
    }

    return res.status(200).json({
        success: true,
        message: 'Connection removed successfully.'
    });
});

exports.getConnections = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const { page, limit, skip } = getPagination(req.query);

    const filter = {
        $or: [
            { requester: currentUserId },
            { recipient: currentUserId }
        ],
        status: 'accepted'
    };

    const [connections, total] = await Promise.all([
        Connection.find(filter)
            .populate('requester', PUBLIC_USER_FIELDS)
            .populate('recipient', PUBLIC_USER_FIELDS)
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit),
        Connection.countDocuments(filter)
    ]);

    const data = connections
        .map((connection) => {
            const requester = connection.requester;
            const recipient = connection.recipient;
            const user = String(requester?._id) === String(currentUserId)
                ? recipient
                : requester;

            if (!user || user.accountStatus === 'suspended') return null;

            return {
                user,
                connectionStatus: 'connected',
                connectionId: connection._id
            };
        })
        .filter(Boolean);

    return res.status(200).json(
        getPaginationResponse(data, total, page, limit)
    );
});

exports.getIncomingRequests = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const { page, limit, skip } = getPagination(req.query);

    const filter = {
        recipient: currentUserId,
        status: 'pending'
    };

    const [connections, total] = await Promise.all([
        Connection.find(filter)
            .populate('requester', PUBLIC_USER_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Connection.countDocuments(filter)
    ]);

    const data = connections
        .filter((connection) => (
            connection.requester &&
            connection.requester.accountStatus !== 'suspended'
        ))
        .map((connection) => ({
            user: connection.requester,
            connectionStatus: 'incoming_pending',
            connectionId: connection._id
        }));

    return res.status(200).json(
        getPaginationResponse(data, total, page, limit)
    );
});

exports.getOutgoingRequests = asyncHandler(async (req, res) => {
    const currentUserId = req.user._id;
    const { page, limit, skip } = getPagination(req.query);

    const filter = {
        requester: currentUserId,
        status: 'pending'
    };

    const [connections, total] = await Promise.all([
        Connection.find(filter)
            .populate('recipient', PUBLIC_USER_FIELDS)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Connection.countDocuments(filter)
    ]);

    const data = connections
        .filter((connection) => (
            connection.recipient &&
            connection.recipient.accountStatus !== 'suspended'
        ))
        .map((connection) => ({
            user: connection.recipient,
            connectionStatus: 'outgoing_pending',
            connectionId: connection._id
        }));

    return res.status(200).json(
        getPaginationResponse(data, total, page, limit)
    );
});