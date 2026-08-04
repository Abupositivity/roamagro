const express = require('express');
const router = express.Router();

const ensureAuthenticated =
require('../middleware/ensureAuthenticated');

const validateRequest =
require('../middleware/validateRequest');

const {
    createPriceAlert,
    getPriceAlerts,
    deletePriceAlert,
} = require('../controllers/priceAlertController');

const {
    createPriceAlertValidator,
} = require('../validators');

router.get(
    '/',
    ensureAuthenticated,
    getPriceAlerts
);

router.post(
    '/',
    ensureAuthenticated,
    createPriceAlertValidator,
    validateRequest,
    createPriceAlert
);

router.delete(
    '/:id',
    ensureAuthenticated,
    deletePriceAlert
);

module.exports = router;