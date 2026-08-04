const {body,param} = require('express-validator');

exports.createMarketplaceValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required.')
        .bail()
        .isLength({ max: 150 })
        .withMessage('Title is too long.')
        .escape(),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required.')
        .bail()
        .isLength({ min: 10 })
        .withMessage('Description is too short.'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required.')
        .escape(),
    body('price')
        .notEmpty()
        .withMessage('Price is required.')
        .bail()
        .isNumeric()
        .withMessage('Price must be a valid number.')
        .isFloat({min:1})
        .withMessage('Price must be greater than zero.'),
    body('quantity')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Quantity must be at least 1.'),
    body('unit')
        .optional()
        .trim()
        .escape(),
    body('location')
        .optional()
        .trim()
        .escape()
];

exports.marketplaceIdValidator=[
    param('id')
        .isMongoId()
        .withMessage('Invalid marketplace listing ID.')
];

exports.updateMarketplaceValidator=[
    param('id')
        .isMongoId()
        .withMessage('Invalid marketplace listing ID.'),
    body('title')
       .optional()
        .trim()
        .isLength({max:150}),
    body('price')
        .optional()
        .isNumeric(),
    body('quantity')
        .optional()
        .isInt({min:1})
];