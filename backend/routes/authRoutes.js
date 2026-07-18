const express = require('express');
const passport = require('passport');

const {
    registerUser,
    loginUser,
    googleAuth,
    getCurrentUser,
} = require('../controllers/authController');

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const validateRequest = require('../middleware/validateRequest');

const {
    registerValidator,
    loginValidator,
    googleValidator,
} = require('../validators');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public
|--------------------------------------------------------------------------
*/
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

/*
|--------------------------------------------------------------------------
| Passport Google OAuth
|--------------------------------------------------------------------------
*/
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email'],
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login`,
    }),
    (req, res) => {
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    }
);

/*
|--------------------------------------------------------------------------
| Protected
|--------------------------------------------------------------------------
*/
router.get(
    '/me',
    ensureAuthenticated,
    getCurrentUser
);

router.post('/logout', (req, res) => {
    req.logout(() => {
        req.session?.destroy(() => {
            res.json({
                success: true,
                message: 'Logged out successfully.',
            });
        });
    });
});

module.exports = router;