const express = require('express');

const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification
} = require('../controllers/notificationController');

router.get(
    '/',
    ensureAuthenticated,
    getNotifications
);

router.get(
    '/unread-count',
    ensureAuthenticated,
    getUnreadCount
);

router.patch(
    '/read-all',
    ensureAuthenticated,
    markAllAsRead
);

router.patch(
    '/:id/read',
    ensureAuthenticated,
    markAsRead
);

router.delete(
    '/:id',
    ensureAuthenticated,
    deleteNotification
);

module.exports = router;