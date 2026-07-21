const { body } = require('express-validator');

exports.createTipValidation = [

    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required.'),
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required.'),
    body('category')
        .notEmpty()
        .withMessage('Category is required.'),

];