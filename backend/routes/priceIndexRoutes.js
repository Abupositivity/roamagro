const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    createPriceIndex,
    getPriceIndexes,
} = require('../controllers/priceIndexController');

const {
    createPriceValidator,
} = require('../validators');

router.post(
    '/',
    ensureAuthenticated,
    createPriceValidator,
    validateRequest,
    createPriceIndex
);

router.get(
    '/',
    ensureAuthenticated,
    getPriceIndexes
);

module.exports = router;