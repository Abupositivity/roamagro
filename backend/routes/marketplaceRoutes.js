const express = require('express');
const { createMarketplaceItem, getMarketplaceItems } = require('../controllers/marketplaceController');
const router = express.Router();

//routes for Marketplace Item
router.post('/', createMarketplaceItem);
router.get('/', getMarketplaceItems);

module.exports = router;