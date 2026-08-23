const express=require('express');

const router=express.Router();

const ensureAuthenticated=require('../middleware/ensureAuthenticated');
const ensureAdmin=require('../middleware/ensureAdmin');
const validateRequest=require('../middleware/validateRequest');

const{
    getProfile,
    updateProfile,
    searchUsers,
    getUserById,
    reportUser,
    deleteAccount,
    getReports,
    updateReport,
    suspendUser,
    restoreUser
}=require('../controllers/userController');

const{
    updateProfileValidator,
    reportUserValidator,
    suspensionValidator,
    reportStatusValidator
}=require('../validators/userValidator');

router.get(
    '/profile',
    ensureAuthenticated,
    getProfile
);

router.put(
    '/profile',
    ensureAuthenticated,
    updateProfileValidator,
    validateRequest,
    updateProfile
);

router.get(
    '/search',
    ensureAuthenticated,
    searchUsers
);

router.get(
    '/admin/reports',
    ensureAuthenticated,
    ensureAdmin,
    getReports
);

router.patch(
    '/admin/reports/:reportId',
    ensureAuthenticated,
    ensureAdmin,
    reportStatusValidator,
    validateRequest,
    updateReport
);

router.patch(
    '/admin/:userId/suspend',
    ensureAuthenticated,
    ensureAdmin,
    suspensionValidator,
    validateRequest,
    suspendUser
);

router.patch(
    '/admin/:userId/restore',
    ensureAuthenticated,
    ensureAdmin,
    restoreUser
);

router.post(
    '/:userId/report',
    ensureAuthenticated,
    reportUserValidator,
    validateRequest,
    reportUser
);

router.delete(
    '/account',
    ensureAuthenticated,
    deleteAccount
);

router.get(
    '/:userId',
    ensureAuthenticated,
    getUserById
);

module.exports=router;