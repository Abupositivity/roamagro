const {
    body,
    param,
} = require('express-validator');

exports.createMarketplaceValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage(
            'Title is required.'
        )
        .bail()
        .isLength({ max: 150 })
        .withMessage(
            'Title is too long.'
        )
        .escape(),

    body('description')
        .trim()
        .notEmpty()
        .withMessage(
            'Description is required.'
        )
        .bail()
        .isLength({ min: 10 })
        .withMessage(
            'Description is too short.'
        ),

    body('category')
        .trim()
        .notEmpty()
        .withMessage(
            'Category is required.'
        )
        .escape(),

    body('price')
        .notEmpty()
        .withMessage(
            'Price is required.'
        )
        .bail()
        .isNumeric()
        .withMessage(
            'Price must be a valid number.'
        )
        .isFloat({ min: 1 })
        .withMessage(
            'Price must be greater than zero.'
        ),

    body('quantity')
        .optional()
        .isFloat({ min: 1 })
        .withMessage(
            'Quantity must be at least 1.'
        ),

    body('unit')
        .optional()
        .trim()
        .escape(),

    body('location')
        .optional()
        .trim()
        .escape(),

    body('images')
        .optional()
        .isArray({ max: 3 })
        .withMessage(
            'You can add up to 3 images.'
        ),

    body('images.*')
        .optional()
        .isString()
        .withMessage(
            'Invalid image.'
        ),
];

exports.marketplaceIdValidator = [
    param('id')
        .isMongoId()
        .withMessage(
            'Invalid marketplace listing ID.'
        ),
];

exports.updateMarketplaceValidator = [
    param('id')
        .isMongoId()
        .withMessage(
            'Invalid marketplace listing ID.'
        ),

    body('title')
        .optional()
        .trim()
        .isLength({ max: 150 })
        .withMessage(
            'Title is too long.'
        ),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage(
            'Description is too short.'
        ),

    body('category')
        .optional()
        .trim(),

    body('price')
        .optional()
        .isNumeric()
        .withMessage(
            'Price must be a valid number.'
        )
        .isFloat({ min: 1 }),

    body('quantity')
        .optional()
        .isFloat({ min: 1 })
        .withMessage(
            'Quantity must be at least 1.'
        ),

    body('unit')
        .optional()
        .trim(),

    body('location')
        .optional()
        .trim(),

    body('available')
        .optional()
        .isBoolean()
        .withMessage(
            'Availability must be true or false.'
        ),

    body('images')
        .optional()
        .isArray({ max: 3 })
        .withMessage(
            'You can add up to 3 images.'
        ),

    body('images.*')
        .optional()
        .isString()
        .withMessage(
            'Invalid image.'
        ),
];