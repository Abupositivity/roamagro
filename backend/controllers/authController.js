const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.registerUser = asyncHandler(async (req, res) => {

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({
        email: email.toLowerCase(),
    });

    if (existingUser) {
        throw new AppError('Email already registered.', 409);
    }

    const user = await User.create({
        name,
        email: email.toLowerCase(),
        password,
    });

    console.log(`✅ User registered: ${user.email}`);

    res.status(201).json({
        success: true,
        message: 'Registration successful.',
        data: {
            token: generateToken(user._id),
            user,
        },
    });

});

exports.loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body;

    const user = await User.findOne({
        email: email.toLowerCase(),
    });

    if (!user || !(await user.matchPassword(password))) {
        throw new AppError('Invalid credentials.', 401);
    }

    console.log(`✅ Login: ${user.email}`);

    res.json({
        success: true,
        message: 'Login successful.',
        data: {
            token: generateToken(user._id),
            user,
        },
    });

});

exports.googleAuth = asyncHandler(async (req, res) => {

    const { token } = req.body;

    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({
        email: payload.email,
    });

    if (!user) {

        user = await User.create({
            googleId: payload.sub,
            name: payload.name,
            email: payload.email,
            profilePhoto: payload.picture,
            isVerified: true,
        });

    }

    res.json({
        success: true,
        message: 'Google login successful.',
        data: {
            token: generateToken(user._id),
            user,
        },
    });

});

exports.getCurrentUser = asyncHandler(async (req, res) => {

    res.json({
        success: true,
        data: req.user,
    });

});