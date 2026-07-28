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
getProjectActivities,
createActivity,
updateActivity,
updateActivityStatus,
deleteActivity
}=require('../controllers/farmProjectController');

const{
createFarmProjectValidator,
updateFarmProjectValidator,
projectIdValidator,
activityIdValidator,
createActivityValidator,
updateActivityValidator,
updateActivityStatusValidator
}=require('../validators/farmProjectValidator');

/*
|--------------------------------------------------------------------------
| Farm Projects
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

router.get(
'/:id/activities',
ensureAuthenticated,
projectIdValidator,
validateRequest,
getProjectActivities
);

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
| Commit 6.1.3+
|--------------------------------------------------------------------------
|
| Tasks
| Expenses
| Harvests
| Reminders
|
*/

module.exports=router;