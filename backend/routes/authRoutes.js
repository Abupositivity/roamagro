const express = require('express');
const passport = require('passport');

const {
    registerUser,
    loginUser,
    googleAuth,
    getCurrentUser
} = require('../controllers/authController');

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const router = express.Router();

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Google Login (Frontend sends Google credential token)
router.post('/google', googleAuth);

/*
|--------------------------------------------------------------------------
| Passport Google OAuth
|--------------------------------------------------------------------------
*/

// Redirect user to Google
router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

// Google callback
router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL}/login`
    }),
    (req, res) => {

        // JWT flow is handled by POST /google.
        // This endpoint exists for Passport compatibility.
        res.redirect(`${process.env.FRONTEND_URL}/dashboard`);

    }
);

/*
|--------------------------------------------------------------------------
| Protected Routes
|--------------------------------------------------------------------------
*/

// Current logged-in user
router.get('/me', ensureAuthenticated, getCurrentUser);

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/

router.post('/logout', (req, res) => {

    req.logout(function (err) {

        if (err) {

            return res.status(500).json({

                success: false,

                message: 'Logout failed.'

            });

        }

        req.session.destroy(() => {

            res.json({

                success: true,

                message: 'Logged out successfully.'

            });

        });

    });

});

module.exports = router;