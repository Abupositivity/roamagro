const express = require('express');
const passport = require('passport');
const { rateLimit } = require('express-rate-limit');

const {
    registerUser,
    loginUser,
    googleAuth,
    verifyEmail,
    forgotPassword,
    resetPassword,
    getCurrentUser
} = require('../controllers/authController');

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    registerValidator,
    loginValidator,
    googleValidator,
    verifyEmailValidator,
    forgotPasswordValidator,
    resetPasswordValidator
} = require('../validators');

const router = express.Router();
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const createRateLimiter = (windowMs, limit, message, options = {}) =>
    rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message
        },
        ...options
    });

const registerLimiter = createRateLimiter(
    60 * 60 * 1000,
    10,
    'Too many registration attempts. Please try again later.'
);

const loginLimiter = createRateLimiter(
    15 * 60 * 1000,
    10,
    'Too many login attempts. Please try again later.',
    { skipSuccessfulRequests: true }
);

const googleLimiter = createRateLimiter(
    15 * 60 * 1000,
    15,
    'Too many Google sign-in attempts. Please try again later.'
);

const verificationLimiter = createRateLimiter(
    15 * 60 * 1000,
    20,
    'Too many email verification attempts. Please try again later.'
);

const forgotPasswordLimiter = createRateLimiter(
    15 * 60 * 1000,
    5,
    'Too many password recovery requests. Please try again later.'
);

const resetPasswordLimiter = createRateLimiter(
    15 * 60 * 1000,
    10,
    'Too many password reset attempts. Please try again later.'
);

router.post(
    '/register',
    registerLimiter,
    registerValidator,
    validateRequest,
    registerUser
);

router.post(
    '/login',
    loginLimiter,
    loginValidator,
    validateRequest,
    loginUser
);

router.post(
    '/google',
    googleLimiter,
    googleValidator,
    validateRequest,
    googleAuth
);

router.get(
    '/verify-email',
    verificationLimiter,
    verifyEmailValidator,
    validateRequest,
    verifyEmail
);

router.post(
    '/forgot-password',
    forgotPasswordLimiter,
    forgotPasswordValidator,
    validateRequest,
    forgotPassword
);

router.post(
    '/reset-password',
    resetPasswordLimiter,
    resetPasswordValidator,
    validateRequest,
    resetPassword
);

router.get(
    '/google',
    passport.authenticate('google', {
        scope: ['profile', 'email']
    })
);

router.get(
    '/google/callback',
    passport.authenticate('google', {
        session: false,
        failureRedirect: `${frontendUrl}/login`
    }),
    (req, res) => {
        res.redirect(`${frontendUrl}/dashboard`);
    }
);

router.get(
    '/me',
    ensureAuthenticated,
    getCurrentUser
);

router.post('/logout', (req, res, next) => {
    const destroySession = () => {
        if (!req.session) {
            res.clearCookie('roamagro.sid', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return res.json({
                success: true,
                message: 'Logged out successfully.'
            });
        }

        req.session.destroy(error => {
            if (error) {
                return next(error);
            }

            res.clearCookie('roamagro.sid', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/'
            });

            return res.json({
                success: true,
                message: 'Logged out successfully.'
            });
        });
    };

    if (typeof req.logout === 'function') {
        return req.logout(error => {
            if (error) {
                return next(error);
            }

            destroySession();
        });
    }

    return destroySession();
});

module.exports = router;