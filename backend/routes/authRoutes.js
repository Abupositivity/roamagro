const express=require('express');
const passport=require('passport');

const{
    registerUser,
    loginUser,
    googleAuth,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser
}=require('../controllers/authController');

const ensureAuthenticated=require('../middleware/ensureAuthenticated');
const validateRequest=require('../middleware/validateRequest');

const{
    registerValidator,
    loginValidator,
    googleValidator,
    forgotPasswordValidator,
    resetPasswordValidator
}=require('../validators');

const router=express.Router();

router.post(
    '/register',
    registerValidator,
    validateRequest,
    registerUser
);

router.post(
    '/login',
    loginValidator,
    validateRequest,
    loginUser
);

router.post(
    '/google',
    googleValidator,
    validateRequest,
    googleAuth
);

router.get(
    '/verify-email',
    verifyEmail
);

router.post(
    '/forgot-password',
    forgotPasswordValidator,
    validateRequest,
    forgotPassword
);

router.post(
    '/reset-password',
    resetPasswordValidator,
    validateRequest,
    resetPassword
);

router.get(
    '/google',
    passport.authenticate('google',{
        scope:['profile','email']
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google',{
        session:false,
        failureRedirect:`${process.env.FRONTEND_URL}/login`
    }),
    (req,res)=>{
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

router.get(
    '/me',
    ensureAuthenticated,
    getCurrentUser
);

router.post('/logout',(req,res)=>{
    req.logout(()=>{
        req.session?.destroy(()=>{
            res.json({
                success:true,
                message:'Logged out successfully.'
            });
        });
    });
});

module.exports=router;