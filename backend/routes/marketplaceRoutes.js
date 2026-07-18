const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    createMarketplaceItem,
    getMarketplaceItems,
} = require('../controllers/marketplaceController');

const {
    createMarketplaceValidator,
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

module.exports = router;