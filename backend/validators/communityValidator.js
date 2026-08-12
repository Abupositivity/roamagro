const { body } = require('express-validator');

exports.createCommunityValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required.')
        .bail()
        .isLength({ max: 200 })
        .withMessage('Title is too long.')
        .escape(),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required.')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Content is too short.'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required.')
        .escape(),

    body('image')
        .optional({ nullable: true })
        .isString()
        .withMessage('Image must be valid text data.'),
];

exports.updateCommunityValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required.')
        .bail()
        .isLength({ max: 200 })
        .withMessage('Title is too long.')
        .escape(),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required.')
        .bail()
        .isLength({ min: 5 })
        .withMessage('Content is too short.'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required.')
        .escape(),

    body('image')
        .optional({ nullable: true })
        .isString()
        .withMessage('Image must be valid text data.'),
];

exports.commentCommunityValidator = [
    body('content')
        .trim()
        .notEmpty()
        .withMessage('Comment is required.')
        .bail()
        .isLength({ max: 1000 })
        .withMessage('Comment is too long.'),
];