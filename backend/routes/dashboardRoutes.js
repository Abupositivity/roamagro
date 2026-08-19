const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const authorizeRoles = require('../middleware/authorizeRoles');

const {
    getDashboard,
    getAdminDashboard,
    getExtensionDashboard,
} = require('../controllers/dashboardController');

router.get(
    '/',
    ensureAuthenticated,
    getDashboard
);

router.get(
    '/admin',
    ensureAuthenticated,
    authorizeRoles('admin'),
    getAdminDashboard
);

router.get(
    '/extension',
    ensureAuthenticated,
    authorizeRoles('extension_officer'),
    getExtensionDashboard
);

module.exports = router;