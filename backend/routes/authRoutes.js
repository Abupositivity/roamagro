const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const router = express.Route();

// Routes to rigister and login user
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;