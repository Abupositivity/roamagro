const{body}=require('express-validator');

const emailValidator=body('email')
    .trim()
    .normalizeEmail()
    .notEmpty()
    .withMessage('Email is required.')
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address.');

exports.registerValidator=[
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .bail()
        .isLength({min:2,max:100})
        .withMessage('Name must be between 2 and 100 characters.')
        .escape(),
    emailValidator,
    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .bail()
        .isLength({min:6})
        .withMessage('Password must be at least 6 characters.')
];

exports.loginValidator=[
    emailValidator,
    body('password')
        .notEmpty()
        .withMessage('Password is required.')
];

exports.forgotPasswordValidator=[
    emailValidator
];

exports.resetPasswordValidator=[
    body('token')
        .trim()
        .notEmpty()
        .withMessage('Password reset token is required.'),
    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .bail()
        .isLength({min:6})
        .withMessage('Password must be at least 6 characters.')
];

exports.googleValidator=[
    body('token')
        .notEmpty()
        .withMessage('Google authentication token is required.')
];