const express = require('express');

const router = express.Router();

const ensureAuthenticated = require(
    '../middleware/ensureAuthenticated'
);

const {
    getMySubscription,
    getSubscriptionPlans,
} = require('../controllers/subscriptionController');

router.get(
    '/plans',
    getSubscriptionPlans
);

router.get(
    '/me',
    ensureAuthenticated,
    getMySubscription
);

module.exports = router;