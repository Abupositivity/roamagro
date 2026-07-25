const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const {
    getDashboard,
} = require('../controllers/dashboardController');

router.get(
    '/',
    ensureAuthenticated,
    getDashboard
);

module.exports = router;