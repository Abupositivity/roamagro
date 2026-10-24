const User = require('../models/User');
const { OAuth2Client } = require('google-auth-library');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');
const generateToken = require('../utils/generateToken');
const { sendEmail } = require('../utils/email');
const { createRawToken, hashToken } = require('../utils/authTokens');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

const getSafeUser = user => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    profilePhoto: user.profilePhoto || '',
    bio: user.bio || '',
    phone: user.phone || '',
    state: user.state || '',
    location: user.location || '',
    lga: user.lga || '',
    language: user.language || 'English',
    role: user.role,
    isVerified: user.isVerified,
    accountStatus: user.accountStatus,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
});

const escapeHtml = value =>
    String(value || '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[character]);

const ensureAccountActive = async user => {
    if (user.accountStatus !== 'suspended') {
        return;
    }

    const suspensionEnd = user.suspendedUntil
        ? new Date(user.suspendedUntil).getTime()
        : NaN;

    if (!Number.isFinite(suspensionEnd) || suspensionEnd > Date.now()) {
        throw new AppError(
            'Your RoamAgro account is currently suspended.',
            403
        );
    }

    user.accountStatus = 'active';
    user.suspensionReason = '';
    user.suspendedAt = null;
    user.suspendedUntil = null;

    await user.save({ validateBeforeSave: false });
};

const sendVerificationEmail = async user => {
    const rawToken = createRawToken();

    user.emailVerificationToken = hashToken(rawToken);
    user.emailVerificationExpires = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    await user.save({ validateBeforeSave: false });

    const verificationUrl =
        `${frontendUrl}/verify-email?token=${encodeURIComponent(rawToken)}`;

    const safeName = escapeHtml(user.name);

    await sendEmail({
        to: user.email,
        subject: 'Verify your RoamAgro email',
        text: `Verify your RoamAgro account: ${verificationUrl}`,
        html: `
            <h2>Verify your RoamAgro account</h2>
            <p>Hello ${safeName},</p>
            <p>Please verify your email address to activate your RoamAgro account.</p>
            <p><a href="${verificationUrl}">Verify Email Address</a></p>
            <p>This link expires in 24 hours.</p>
        `
    });
};

exports.registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
        email: normalizedEmail
    });

    if (existingUser) {
        if (!existingUser.isVerified) {
            await sendVerificationEmail(existingUser);

            return res.status(200).json({
                success: true,
                message: 'A new verification email has been sent.'
            });
        }

        throw new AppError('Email already registered.', 409);
    }

    const user = await User.create({
        name,
        email: normalizedEmail,
        password,
        isVerified: false
    });

    await sendVerificationEmail(user);

    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
            email: user.email
        }
    });
});

exports.verifyEmail = asyncHandler(async (req, res) => {
    const { token } = req.query;

    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError('Email verification token is required.', 400);
    }

    const user = await User.findOne({
        emailVerificationToken: hashToken(token),
        emailVerificationExpires: { $gt: new Date() }
    });

    if (!user) {
        throw new AppError(
            'This verification link is invalid or has expired.',
            400
        );
    }

    user.isVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;

    await user.save({ validateBeforeSave: false });

    res.json({
        success: true,
        message: 'Email verified successfully.'
    });
});

exports.loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
        email: normalizedEmail
    });

    if (!user || !(await user.matchPassword(password))) {
        throw new AppError('Invalid email or password.', 401);
    }

    await ensureAccountActive(user);

    if (!user.isVerified) {
        throw new AppError(
            'Please verify your email address before logging in.',
            403
        );
    }

    res.json({
        success: true,
        message: 'Login successful.',
        data: {
            token: generateToken(user._id),
            user: getSafeUser(user)
        }
    });
});

exports.googleAuth = asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError('Google sign-in token is required.', 400);
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
        throw new AppError('Google sign-in is not configured.', 500);
    }

    let payload;

    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        payload = ticket.getPayload();
    } catch (error) {
        throw new AppError('Google sign-in token is invalid or expired.', 401);
    }

    if (
        !payload ||
        !payload.sub ||
        !payload.email ||
        payload.email_verified !== true
    ) {
        throw new AppError(
            'Google must provide a verified email address to sign in.',
            401
        );
    }

    const normalizedEmail = payload.email.toLowerCase().trim();

    let user = await User.findOne({
        email: normalizedEmail
    });

    if (!user) {
        user = await User.create({
            googleId: payload.sub,
            name: payload.name || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            profilePhoto: payload.picture || '',
            isVerified: true
        });
    } else {
        await ensureAccountActive(user);

        if (user.googleId && user.googleId !== payload.sub) {
            throw new AppError(
                'This email account is linked to a different Google account.',
                409
            );
        }

        let changed = false;

        if (!user.googleId) {
            user.googleId = payload.sub;
            changed = true;
        }

        if (!user.isVerified) {
            user.isVerified = true;
            user.emailVerificationToken = null;
            user.emailVerificationExpires = null;
            changed = true;
        }

        if (!user.profilePhoto && payload.picture) {
            user.profilePhoto = payload.picture;
            changed = true;
        }

        if (changed) {
            await user.save();
        }
    }

    res.json({
        success: true,
        message: 'Google login successful.',
        data: {
            token: generateToken(user._id),
            user: getSafeUser(user)
        }
    });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({
        email: normalizedEmail
    });

    if (user) {
        const rawToken = createRawToken();

        user.passwordResetToken = hashToken(rawToken);
        user.passwordResetExpires = new Date(
            Date.now() + 30 * 60 * 1000
        );

        await user.save({ validateBeforeSave: false });

        const resetUrl =
            `${frontendUrl}/reset-password?token=${encodeURIComponent(rawToken)}`;

        const safeName = escapeHtml(user.name);

        await sendEmail({
            to: user.email,
            subject: 'Reset your RoamAgro password',
            text: `Reset your RoamAgro password: ${resetUrl}`,
            html: `
                <h2>Password Reset</h2>
                <p>Hello ${safeName},</p>
                <p>We received a request to reset your RoamAgro password.</p>
                <p><a href="${resetUrl}">Reset Password</a></p>
                <p>This link expires in 30 minutes.</p>
                <p>If you did not request this, you can safely ignore this email.</p>
            `
        });
    }

    res.json({
        success: true,
        message: 'If an account exists for that email, password reset instructions have been sent.'
    });
});

exports.resetPassword = asyncHandler(async (req, res) => {
    const { token, password } = req.body;

    if (typeof token !== 'string' || !token.trim()) {
        throw new AppError('Password reset token is required.', 400);
    }

    const user = await User.findOne({
        passwordResetToken: hashToken(token),
        passwordResetExpires: { $gt: new Date() }
    });

    if (!user) {
        throw new AppError(
            'This password reset link is invalid or has expired.',
            400
        );
    }

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    res.json({
        success: true,
        message: 'Password reset successfully.'
    });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        data: getSafeUser(req.user)
    });
});