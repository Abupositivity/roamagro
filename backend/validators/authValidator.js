const { body, query } = require('express-validator');

const emailValidator = body('email')
    .isString()
    .withMessage('Email must be a string.')
    .bail()
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address.');

const passwordValidator = field =>
    body(field)
        .isString()
        .withMessage('Password must be a string.')
        .bail()
        .notEmpty()
        .withMessage('Password is required.')
        .bail()
        .isLength({ min: 6, max: 128 })
        .withMessage('Password must be between 6 and 128 characters.');

exports.registerValidator = [
    body('name')
        .isString()
        .withMessage('Name must be a string.')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .bail()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters.')
        .escape(),
    emailValidator,
    passwordValidator('password')
];

exports.loginValidator = [
    emailValidator,
    body('password')
        .isString()
        .withMessage('Password must be a string.')
        .bail()
        .notEmpty()
        .withMessage('Password is required.')
        .bail()
        .isLength({ max: 128 })
        .withMessage('Password cannot exceed 128 characters.')
];

exports.googleValidator = [
    body('token')
        .isString()
        .withMessage('Google authentication token must be a string.')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Google authentication token is required.')
        .bail()
        .isLength({ max: 10000 })
        .withMessage('Google authentication token is too long.')
];

exports.verifyEmailValidator = [
    query('token')
        .isString()
        .withMessage('Email verification token must be a string.')
        .bail()
        .matches(/^[a-fA-F0-9]{64}$/)
        .withMessage('Email verification token is invalid.')
];

exports.forgotPasswordValidator = [
    emailValidator
];

exports.resetPasswordValidator = [
    body('token')
        .isString()
        .withMessage('Password reset token must be a string.')
        .bail()
        .matches(/^[a-fA-F0-9]{64}$/)
        .withMessage('Password reset token is invalid.'),
    passwordValidator('password')
];