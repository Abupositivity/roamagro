const { body } = require('express-validator');

exports.createFarmProjectValidator = [

    body('name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required.')
        .bail()
        .isLength({ max: 150 })
        .withMessage('Project name is too long.')
        .escape(),

    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required.')
        .bail()
        .isLength({ min: 10 })
        .withMessage('Description is too short.'),

    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date.'),

    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date.')

];