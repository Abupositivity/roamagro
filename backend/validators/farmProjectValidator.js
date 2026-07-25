const { body, param } = require('express-validator');

/**
 * Create Farm Project
 */
exports.createFarmProjectValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required.')
        .bail()
        .isLength({ max: 150 })
        .withMessage('Project name cannot exceed 150 characters.'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required.')
        .bail()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters.'),
    body('crop')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Crop name is too long.'),
    body('farmType')
        .optional()
        .isIn([
            'Crop',
            'Livestock',
            'Poultry',
            'Fishery',
            'Mixed',
            'Other',
        ])
        .withMessage('Invalid farm type.'),
    body('farmSize')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Farm size must be a positive number.'),
    body('measurementUnit')
        .optional()
        .isIn([
            'Hectares',
            'Acres',
            'Plots',
            'Square Meters',
        ])
        .withMessage('Invalid measurement unit.'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Location is too long.'),
    body('season')
        .optional()
        .isIn([
            'Dry',
            'Wet',
            'All Season',
        ])
        .withMessage('Invalid farming season.'),
    body('priority')
        .optional()
        .isIn([
            'Low',
            'Medium',
            'High',
        ])
        .withMessage('Invalid priority.'),
    body('status')
        .optional()
        .isIn([
            'Planning',
            'Active',
            'Completed',
            'Cancelled',
        ])
        .withMessage('Invalid status.'),
    body('progress')
        .optional()
        .isInt({
            min: 0,
            max: 100,
        })
        .withMessage('Progress must be between 0 and 100.'),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date.'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date.'),
    body('weatherNotes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Weather notes are too long.'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array.')
];

/**
 * Update Project
 */
exports.updateFarmProjectValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid project ID.'),
    body('name')
        .optional()
        .trim()
        .isLength({ max: 150 }),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 }),
    body('farmSize')
        .optional()
        .isFloat({ min: 0 }),
    body('progress')
        .optional()
        .isInt({
            min: 0,
            max: 100,
        }),
    body('status')
        .optional()
        .isIn([
            'Planning',
            'Active',
            'Completed',
            'Cancelled',
        ])
];

/**
 * Validate Mongo ID
 */
exports.projectIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid project ID.')

];