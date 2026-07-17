const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const {
    createPriceIndex,
    getPriceIndexes,
} = require('../controllers/priceIndexController');

router.post('/', ensureAuthenticated, createPriceIndex);

router.get('/', ensureAuthenticated, getPriceIndexes);

module.exports = router;