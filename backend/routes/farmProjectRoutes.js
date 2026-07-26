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
getFarmDashboardSummary
}=require('../controllers/farmProjectController');
const{
createFarmProjectValidator,
updateFarmProjectValidator,
projectIdValidator
}=require('../validators/farmProjectValidator');

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

module.exports=router;