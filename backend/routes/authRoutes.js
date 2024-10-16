const express = require('express');
const passport = require('passport');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Route();

// Routes to rigister and login user
router.post('/register', registerUser);
router.post('/login', loginUser);

// Routes for google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => {
        res.redirect('/dashboard');
    }
);

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) return res.status(500).json({ error: 'Failed to logout' });
        res.redirect('/');
    });
});

module.exports = router;