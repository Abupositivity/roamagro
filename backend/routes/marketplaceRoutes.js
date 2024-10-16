const express = require('express');
const { createMarketplaceItem, getMarketplaceItems } = require('../controllers/marketplaceController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

//routes for Marketplace Item
router.post('/', createMarketplaceItem);
router.get('/', getMarketplaceItems);

module.exports = router;