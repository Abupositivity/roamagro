const express = require('express');
const router = express.Router();

const {
    createTip,
    getTips,
    getFeaturedTips,
    updateTip,
    deleteTip,
    toggleLike,
    addComment,
    deleteComment,
    shareTip,
    unshareTip,
} = require('../controllers/agriFeedController');

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const authorizeRoles = require('../middleware/authorizeRoles');
const validateRequest = require('../middleware/validateRequest');

const {
    createTipValidation,
} = require('../validators/agriFeedValidator');

router.get('/', getTips);
router.get('/featured', getFeaturedTips);

router.post(
    '/',
    ensureAuthenticated,
    authorizeRoles('admin', 'extension_officer'),
    createTipValidation,
    validateRequest,
    createTip
);

router.put(
    '/:id',
    ensureAuthenticated,
    authorizeRoles('admin', 'extension_officer'),
    createTipValidation,
    validateRequest,
    updateTip
);

router.delete(
    '/:id',
    ensureAuthenticated,
    authorizeRoles('admin', 'extension_officer'),
    deleteTip
);

router.post(
    '/:id/like',
    ensureAuthenticated,
    toggleLike
);

router.post(
    '/:id/comments',
    ensureAuthenticated,
    addComment
);

router.delete(
    '/:tipId/comments/:commentId',
    ensureAuthenticated,
    deleteComment
);

router.post(
    '/:id/share',
    ensureAuthenticated,
    shareTip
);

router.delete(
    '/:id/share',
    ensureAuthenticated,
    unshareTip
);

module.exports = router;