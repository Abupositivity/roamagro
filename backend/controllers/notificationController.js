const Notification = require('../models/Notification');

const asyncHandler = require('../middleware/asyncHandler');

const AppError = require('../utils/AppError');

exports.getNotifications = asyncHandler(async (req, res) => {
    const notifications = await Notification.find({
        recipient: req.user._id
    })
        .populate('sender', 'name profilePhoto')
        .sort({ createdAt: -1 })
        .limit(50);

    res.status(200).json({
        success: true,
        count: notifications.length,
        data: notifications
    });
});

exports.getUnreadCount = asyncHandler(async (req, res) => {
    const count = await Notification.countDocuments({
        recipient: req.user._id,
        read: false
    });

    res.status(200).json({
        success: true,
        count
    });
});

exports.markAsRead = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id
    });

    if (!notification) {
        throw new AppError(
            'Notification not found.',
            404
        );
    }

    notification.read = true;

    await notification.save();

    res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        data: notification
    });
});

exports.markAllAsRead = asyncHandler(async (req, res) => {
    await Notification.updateMany(
        {
            recipient: req.user._id,
            read: false
        },
        {
            $set: {
                read: true
            }
        }
    );

    res.status(200).json({
        success: true,
        message: 'All notifications marked as read.'
    });
});

exports.deleteNotification = asyncHandler(async (req, res) => {
    const notification = await Notification.findOne({
        _id: req.params.id,
        recipient: req.user._id
    });

    if (!notification) {
        throw new AppError(
            'Notification not found.',
            404
        );
    }

    await notification.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Notification deleted successfully.'
    });
});