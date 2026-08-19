const express=require('express');

const router=express.Router();

const ensureAuthenticated=require('../middleware/ensureAuthenticated');
const validateRequest=require('../middleware/validateRequest');

const{
    getProfile,
    updateProfile
}=require('../controllers/userController');

const{
    updateProfileValidator
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

module.exports=router;