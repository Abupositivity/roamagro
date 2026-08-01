const express=require('express');
const router=express.Router();
const ensureAuthenticated=require('../middleware/ensureAuthenticated');
const validateRequest=require('../middleware/validateRequest');

const{
createFarmProject,
getFarmProjects,
getFarmProject,
updateFarmProject,
deleteFarmProject,
getFarmDashboardSummary,
createActivity,
updateActivity,
deleteActivity,
updateActivityStatus,
createTask,
updateTask,
deleteTask,
updateTaskStatus,
createExpense,
updateExpense,
deleteExpense,
createHarvest,
updateHarvest,
deleteHarvest
}=require('../controllers/farmProjectController');

const{
createFarmProjectValidator,
updateFarmProjectValidator,
projectIdValidator,
createActivityValidator,
updateActivityValidator,
activityIdValidator,
updateActivityStatusValidator,
createTaskValidator,
updateTaskValidator,
taskIdValidator,
updateTaskStatusValidator,
createExpenseValidator,
updateExpenseValidator,
expenseIdValidator,
createHarvestValidator,
updateHarvestValidator,
harvestIdValidator
}=require('../validators/farmProjectValidator');

/*
|--------------------------------------------------------------------------
| Farm Project
|--------------------------------------------------------------------------
*/
router.post(
'/',
ensureAuthenticated,
createFarmProjectValidator,
validateRequest,
createFarmProject
);

router.get(
'/',
ensureAuthenticated,
getFarmProjects
);

router.get(
'/dashboard/summary',
ensureAuthenticated,
getFarmDashboardSummary
);

router.get(
'/:id',
ensureAuthenticated,
projectIdValidator,
validateRequest,
getFarmProject
);

router.put(
'/:id',
ensureAuthenticated,
projectIdValidator,
updateFarmProjectValidator,
validateRequest,
updateFarmProject
);

router.delete(
'/:id',
ensureAuthenticated,
projectIdValidator,
validateRequest,
deleteFarmProject
);

/*
|--------------------------------------------------------------------------
| Activities
|--------------------------------------------------------------------------
*/
router.post(
'/:id/activities',
ensureAuthenticated,
createActivityValidator,
validateRequest,
createActivity
);

router.put(
'/:id/activities/:activityId',
ensureAuthenticated,
updateActivityValidator,
validateRequest,
updateActivity
);

router.patch(
'/:id/activities/:activityId/status',
ensureAuthenticated,
updateActivityStatusValidator,
validateRequest,
updateActivityStatus
);

router.delete(
'/:id/activities/:activityId',
ensureAuthenticated,
activityIdValidator,
validateRequest,
deleteActivity
);

/*
|--------------------------------------------------------------------------
| Tasks
|--------------------------------------------------------------------------
*/
router.post(
'/:id/tasks',
ensureAuthenticated,
createTaskValidator,
validateRequest,
createTask
);

router.put(
'/:id/tasks/:taskId',
ensureAuthenticated,
updateTaskValidator,
validateRequest,
updateTask
);

router.patch(
'/:id/tasks/:taskId/status',
ensureAuthenticated,
updateTaskStatusValidator,
validateRequest,
updateTaskStatus
);

router.delete(
'/:id/tasks/:taskId',
ensureAuthenticated,
taskIdValidator,
validateRequest,
deleteTask
);

/*
|--------------------------------------------------------------------------
| Expenses
|--------------------------------------------------------------------------
*/
router.post(
'/:id/expenses',
ensureAuthenticated,
createExpenseValidator,
validateRequest,
createExpense
);

router.put(
'/:id/expenses/:expenseId',
ensureAuthenticated,
updateExpenseValidator,
validateRequest,
updateExpense
);

router.delete(
'/:id/expenses/:expenseId',
ensureAuthenticated,
expenseIdValidator,
validateRequest,
deleteExpense
);

/*
|--------------------------------------------------------------------------
| Harvests
|--------------------------------------------------------------------------
*/
router.post(
'/:id/harvests',
ensureAuthenticated,
createHarvestValidator,
validateRequest,
createHarvest
);

router.put(
'/:id/harvests/:harvestId',
ensureAuthenticated,
updateHarvestValidator,
validateRequest,
updateHarvest
);

router.delete(
'/:id/harvests/:harvestId',
ensureAuthenticated,
harvestIdValidator,
validateRequest,
deleteHarvest
);

module.exports=router;