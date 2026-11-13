const express = require('express');

const router = express.Router();

const ensureAuthenticated = require(
    '../middleware/ensureAuthenticated'
);

const requirePremium = require(
    '../middleware/requirePremium'
);

const {
    getFinancialDashboard,
    getExpenseBreakdown,
    getProjectProfitability,
    getMonthlyCashFlow,
} = require('../controllers/financialController');

router.use(ensureAuthenticated);

router.use(
    requirePremium('financialDashboard')
);

router.get(
    '/dashboard',
    getFinancialDashboard
);

router.get(
    '/expenses',
    getExpenseBreakdown
);

router.get(
    '/projects',
    getProjectProfitability
);

router.get(
    '/cashflow',
    getMonthlyCashFlow
);

module.exports = router;