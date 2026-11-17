const express = require('express');
const rateLimit = require('express-rate-limit');

const router = express.Router();

const {
    createAdvertisement,
    getAdminAdvertisements,
    getAdminAdvertisement,
    updateAdvertisement,
    deleteAdvertisement,
    getPlacementAdvertisement,
    recordImpression,
    recordClick,
} = require('../controllers/advertisementController');

const {
    updateCampaignBilling,
    generateReportLink,
    revokeReportLink,
    getAdvertiserReport,
} = require('../controllers/advertisementReportController');

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const authorizeRoles = require('../middleware/authorizeRoles');
const upload = require('../middleware/uploadImage');

const {
    parseAdvertisementFormData,
    validateAdvertisementId,
    validateCreateAdvertisement,
    validateUpdateAdvertisement,
} = require('../validators/advertisementValidator');

const reportLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: {
        success: false,
        message: 'Too many report requests. Please try again later.',
    },
});

// Public, private-token-protected advertiser report.
// Must remain above the authentication middleware.
router.get(
    '/report/:token',
    reportLimiter,
    getAdvertiserReport
);

// All remaining advertisement routes require authentication.
router.use(ensureAuthenticated);

// Admin-only advertisement management.
router.get(
    '/admin',
    authorizeRoles('admin'),
    getAdminAdvertisements
);

router.post(
    '/admin',
    authorizeRoles('admin'),
    upload.single('image'),
    parseAdvertisementFormData,
    validateCreateAdvertisement,
    createAdvertisement
);

router.get(
    '/admin/:id',
    authorizeRoles('admin'),
    validateAdvertisementId,
    getAdminAdvertisement
);

router.put(
    '/admin/:id',
    authorizeRoles('admin'),
    validateAdvertisementId,
    upload.single('image'),
    parseAdvertisementFormData,
    validateUpdateAdvertisement,
    updateAdvertisement
);

router.delete(
    '/admin/:id',
    authorizeRoles('admin'),
    validateAdvertisementId,
    deleteAdvertisement
);

// Admin-only billing and report-link management.
router.put(
    '/admin/:id/billing',
    authorizeRoles('admin'),
    validateAdvertisementId,
    updateCampaignBilling
);

router.post(
    '/admin/:id/report-link',
    authorizeRoles('admin'),
    validateAdvertisementId,
    generateReportLink
);

router.delete(
    '/admin/:id/report-link',
    authorizeRoles('admin'),
    validateAdvertisementId,
    revokeReportLink
);

// Advertisement delivery to eligible Free users.
router.get(
    '/placement/:placement',
    getPlacementAdvertisement
);

// Advertisement engagement tracking.
router.post(
    '/:id/impression',
    validateAdvertisementId,
    recordImpression
);

router.post(
    '/:id/click',
    validateAdvertisementId,
    recordClick
);

module.exports = router;