const express = ('express');
const { createPriceIndex, getPriceIndexes } = require('../controllers/priceIndexController');
const router = express.Router();

// routes for price Index
router.post('/', createPriceIndex);
router.get('/', getPriceIndexes);

module.exports = router;