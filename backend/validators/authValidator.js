const { body } = require('express-validator');

/*
|--------------------------------------------------------------------------
| Register Validator
|--------------------------------------------------------------------------
*/

exports.registerValidator = [

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required.')
        .bail()
        .isLength({ min: 2, max: 100 })
        .withMessage('Name must be between 2 and 100 characters.')
        .escape(),

    body('email')
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage('Email is required.')
        .bail()
        .isEmail()
        .withMessage('Please provide a valid email address.'),

    body('password')
        .notEmpty()
        .withMessage('Password is required.')
        .bail()
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters.')

];

/*
|--------------------------------------------------------------------------
| Login Validator
|--------------------------------------------------------------------------
*/

exports.loginValidator = [

    body('email')
        .trim()
        .normalizeEmail()
        .notEmpty()
        .withMessage('Email is required.')
        .bail()
        .isEmail()
        .withMessage('Please provide a valid email.'),

    body('password')
        .notEmpty()
        .withMessage('Password is required.')

];

/*
|--------------------------------------------------------------------------
| Google Validator
|--------------------------------------------------------------------------
*/

exports.googleValidator = [

    body('token')
        .notEmpty()
        .withMessage('Google authentication token is required.')

];