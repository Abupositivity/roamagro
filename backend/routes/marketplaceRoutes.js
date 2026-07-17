const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const {
    createMarketplaceItem,
    getMarketplaceItems,
} = require('../controllers/marketplaceController');

router.post('/', ensureAuthenticated, createMarketplaceItem);

router.get('/', ensureAuthenticated, getMarketplaceItems);

module.exports = router;