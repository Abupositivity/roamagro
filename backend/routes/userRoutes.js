const express=require('express');

const router=express.Router();

const ensureAuthenticated=require('../middleware/ensureAuthenticated');
const ensureAdmin=require('../middleware/ensureAdmin');
const validateRequest=require('../middleware/validateRequest');

const{
    getProfile,
    updateProfile,
    searchUsers,
    searchAdminUsers,
    getUserById,
    reportUser,
    deleteAccount,
    getReports,
    updateReport,
    suspendUser,
    restoreUser,
    updateUserRole
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

router.get(
    '/admin/search',
    ensureAuthenticated,
    ensureAdmin,
    searchAdminUsers
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
    '/admin/:userId/role',
    ensureAuthenticated,
    ensureAdmin,
    updateUserRole
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