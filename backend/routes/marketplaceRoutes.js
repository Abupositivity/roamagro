const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    createMarketplaceItem,
    getMarketplaceItems,
    getMarketplaceItem,
    updateMarketplaceItem,
    deleteMarketplaceItem
} = require('../controllers/marketplaceController');

const {
    createMarketplaceValidator,
    marketplaceIdValidator,
    updateMarketplaceValidator
} = require('../validators');

router.post(
    '/',
    ensureAuthenticated,
    createMarketplaceValidator,
    validateRequest,
    createMarketplaceItem
);

router.get(
    '/',
    ensureAuthenticated,
    getMarketplaceItems
);

router.get(
    '/:id',
    ensureAuthenticated,
    marketplaceIdValidator,
    validateRequest,
    getMarketplaceItem
);

router.put(
    '/:id',
    ensureAuthenticated,
    updateMarketplaceValidator,
    validateRequest,
    updateMarketplaceItem
);
router.delete(
    '/:id',
    ensureAuthenticated,
    marketplaceIdValidator,
    validateRequest,
    deleteMarketplaceItem
);

module.exports = router;