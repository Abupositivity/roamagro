const { body } = require('express-validator');

exports.createPriceValidator = [

    body('product')
        .trim()
        .notEmpty()
        .withMessage('Product is required.')
        .escape(),

    body('price')
        .notEmpty()
        .withMessage('Price is required.')
        .bail()
        .isNumeric()
        .withMessage('Price must be numeric.'),

    body('location')
        .trim()
        .notEmpty()
        .withMessage('Location is required.')
        .escape(),

    body('category')
        .optional()
        .trim()
        .escape(),

    body('market')
        .optional()
        .trim()
        .escape(),

    body('unit')
        .optional()
        .trim()
        .escape()

];