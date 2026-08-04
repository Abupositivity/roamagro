const { body } = require('express-validator');

exports.createPriceAlertValidator = [

    body('product')
        .trim()
        .notEmpty()
        .withMessage('Product is required.')
        .escape(),

    body('targetPrice')
        .notEmpty()
        .withMessage('Target price is required.')
        .bail()
        .isNumeric()
        .withMessage('Target price must be numeric.'),

    body('alertType')
        .isIn([
            'Above',
            'Below',
        ])
        .withMessage(
            'Invalid alert type.'
        ),

    body('location')
        .optional()
        .trim()
        .escape(),

];