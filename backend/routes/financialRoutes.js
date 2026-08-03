const express=require('express');
const router=express.Router();
const ensureAuthenticated=require('../middleware/ensureAuthenticated');

const{
getFinancialDashboard,
getExpenseBreakdown,
getProjectProfitability,
getMonthlyCashFlow
}=require('../controllers/financialController');

/*
|--------------------------------------------------------------------------
| Financial Dashboard
|--------------------------------------------------------------------------
*/
router.get(
'/dashboard',
ensureAuthenticated,
getFinancialDashboard
);

router.get(
'/expenses',
ensureAuthenticated,
getExpenseBreakdown
);

router.get(
'/projects',
ensureAuthenticated,
getProjectProfitability
);

router.get(
'/cashflow',
ensureAuthenticated,
getMonthlyCashFlow
);

module.exports=router;