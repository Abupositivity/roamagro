const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/*
|--------------------------------------------------------------------------
| Generate JWT
|--------------------------------------------------------------------------
*/

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        {
            expiresIn: '7d',
        }
    );
};

/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/

exports.registerUser = async (req, res) => {
    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Name, email and password are required.'
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful.',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                language: user.language,
                role: user.role
            }
        });

    } catch (error) {

        console.error('REGISTER ERROR:', error);

        res.status(500).json({
            success: false,
            message: 'Server error.'
        });

    }
};

/*
|--------------------------------------------------------------------------
| Login User
|--------------------------------------------------------------------------
*/

exports.loginUser = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        const passwordMatch = await user.matchPassword(password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }

        const token = generateToken(user._id);

        res.json({

            success: true,

            message: 'Login successful.',

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                language: user.language,

                role: user.role

            }

        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            message: 'Server error.'

        });

    }

};

/*
|--------------------------------------------------------------------------
| Google Login
|--------------------------------------------------------------------------
*/

exports.googleAuth = async (req, res) => {

    try {

        const { token } = req.body;

        if (!token) {

            return res.status(400).json({

                success: false,

                message: 'Google token missing.'

            });

        }

        const ticket = await client.verifyIdToken({

            idToken: token,

            audience: process.env.GOOGLE_CLIENT_ID

        });

        const payload = ticket.getPayload();

        let user = await User.findOne({

            email: payload.email

        });

        if (!user) {

            user = await User.create({

                googleId: payload.sub,

                name: payload.name,

                email: payload.email,

                profilePhoto: payload.picture,

                isVerified: true

            });

        }

        const jwtToken = generateToken(user._id);

        res.json({

            success: true,

            message: 'Google login successful.',

            token: jwtToken,

            user: {

                id: user._id,

                name: user.name,

                email: user.email,

                profilePhoto: user.profilePhoto

            }

        });

    }

    catch (error) {

        console.error(error);

        res.status(400).json({

            success: false,

            message: 'Google authentication failed.'

        });

    }

};

/*
|--------------------------------------------------------------------------
| Current User
|--------------------------------------------------------------------------
*/

exports.getCurrentUser = async (req, res) => {

    res.json({

        success: true,

        user: req.user

    });

};