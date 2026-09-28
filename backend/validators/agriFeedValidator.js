const { body } = require('express-validator');

exports.createTipValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Title is required.')
        .isLength({
            max: 150,
        })
        .withMessage(
            'Title cannot exceed 150 characters.'
        ),

    body('content')
        .trim()
        .notEmpty()
        .withMessage('Content is required.'),

    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required.'),

    body('language')
        .optional()
        .isIn([
            'English',
            'Hausa',
        ])
        .withMessage(
            'Language must be English or Hausa.'
        ),

    body('priority')
        .optional()
        .isIn([
            'Normal',
            'Important',
            'Urgent',
        ])
        .withMessage(
            'Invalid priority.'
        ),

    body('status')
        .optional()
        .isIn([
            'Draft',
            'Published',
            'Archived',
        ])
        .withMessage(
            'Invalid status.'
        ),

    body('region')
        .optional()
        .trim()
        .isLength({
            max: 100,
        })
        .withMessage(
            'Region cannot exceed 100 characters.'
        ),
];