const express = require('express');
const passport = require('passport');
const { registerUser, loginUser, googleAuth } = require('../controllers/authController');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google', googleAuth);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback', passport.authenticate('google', { failureRedirect: '/' }),
    (req, res) => res.redirect('/dashboard'));

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;