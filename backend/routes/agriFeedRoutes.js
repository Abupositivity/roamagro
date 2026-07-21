const express = require('express');
const router = express.Router();

const {
    createTip,
    getTips,
    getFeaturedTips,
    updateTip,
    deleteTip,
} = require('../controllers/agriFeedController');

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

// Uncomment after Commit 6 (Role Based Authorization)
// const authorizeRoles = require('../middleware/authorizeRoles');

// Validation
const {
    createTipValidation,
} = require('../validators/agriFeedValidator');

const validateRequest = require('../middleware/validateRequest');

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
router.get('/', getTips);
router.get('/featured', getFeaturedTips);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/
router.post(
    '/',
    ensureAuthenticated,
    // authorizeRoles('admin', 'extension_officer'),
    createTipValidation,
    validateRequest,
    createTip
);

router.put(
    '/:id',
    ensureAuthenticated,
    // authorizeRoles('admin', 'extension_officer'),
    createTipValidation,
    validateRequest,
    updateTip
);

router.delete(
    '/:id',
    ensureAuthenticated,
    // authorizeRoles('admin', 'extension_officer'),
    deleteTip
);

module.exports = router;