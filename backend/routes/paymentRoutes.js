const express = require('express');

const router = express.Router();

const ensureAuthenticated = require(
    '../middleware/ensureAuthenticated'
);

const {
    initializePayment,
    verifyPayment,
    getPaymentHistory,
} = require('../controllers/paymentController');

router.use(ensureAuthenticated);

router.post('/initialize', initializePayment);

router.post('/verify', verifyPayment);

router.get('/history', getPaymentHistory);

module.exports = router;