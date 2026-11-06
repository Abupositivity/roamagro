const { body } = require('express-validator');

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MIN_CONTENT_LENGTH = 5;
const MAX_CATEGORY_LENGTH = 100;
const MAX_COMMENT_LENGTH = 1000;
const MAX_IMAGE_URL_LENGTH = 2048;

const isValidImageValue = (value) => {
    if (value === '') {
        return true;
    }

    if (
        typeof value !== 'string' ||
        value.length > MAX_IMAGE_URL_LENGTH
    ) {
        return false;
    }

    return /^https:\/\/[^\s]+$/i.test(value);
};

const validateImage = () =>
    body('image')
        .optional({ values: 'null' })
        .custom((value) => {
            if (!isValidImageValue(value)) {
                throw new Error(
                    'Image must be a valid HTTPS URL or empty to remove it.'
                );
            }

            return true;
        });

const validateTitle = (optional = false) => {
    let validator = body('title');

    if (optional) {
        validator = validator.optional();
    }

    return validator
        .isString()
        .withMessage('Title must be text.')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Title is required.')
        .bail()
        .isLength({ max: MAX_TITLE_LENGTH })
        .withMessage(
            `Title must not exceed ${MAX_TITLE_LENGTH} characters.`
        );
};

const validateContent = (optional = false) => {
    let validator = body('content');

    if (optional) {
        validator = validator.optional();
    }

    return validator
        .isString()
        .withMessage('Content must be text.')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Content is required.')
        .bail()
        .isLength({
            min: MIN_CONTENT_LENGTH,
            max: MAX_CONTENT_LENGTH,
        })
        .withMessage(
            `Content must be between ${MIN_CONTENT_LENGTH} and ${MAX_CONTENT_LENGTH} characters.`
        );
};

const validateCategory = (optional = false) => {
    let validator = body('category');

    if (optional) {
        validator = validator.optional();
    }

    return validator
        .isString()
        .withMessage('Category must be text.')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Category is required.')
        .bail()
        .isLength({ max: MAX_CATEGORY_LENGTH })
        .withMessage(
            `Category must not exceed ${MAX_CATEGORY_LENGTH} characters.`
        );
};

const validateAllowedFields = (requireFields = false) =>
    body().custom((value, { req }) => {
        const allowedFields = [
            'title',
            'content',
            'category',
            'image',
        ];

        if (
            !value ||
            typeof value !== 'object' ||
            Array.isArray(value)
        ) {
            throw new Error(
                'Request body must be an object.'
            );
        }

        const suppliedFields = Object.keys(value);

        const unexpectedFields = suppliedFields.filter(
            (field) => !allowedFields.includes(field)
        );

        if (unexpectedFields.length > 0) {
            throw new Error(
                `Unsupported update field(s): ${unexpectedFields.join(', ')}.`
            );
        }

        if (
            requireFields &&
            suppliedFields.length === 0 &&
            !req.file
        ) {
            throw new Error(
                'Provide at least one field to update.'
            );
        }

        return true;
    });

exports.createCommunityValidator = [
    validateTitle(),
    validateContent(),
    validateCategory(),
    validateImage(),
];

exports.updateCommunityValidator = [
    validateAllowedFields(true),
    validateTitle(true),
    validateContent(true),
    validateCategory(true),
    validateImage(),
];

exports.commentCommunityValidator = [
    body('content')
        .isString()
        .withMessage('Comment must be text.')
        .bail()
        .trim()
        .notEmpty()
        .withMessage('Comment is required.')
        .bail()
        .isLength({ max: MAX_COMMENT_LENGTH })
        .withMessage(
            `Comment must not exceed ${MAX_COMMENT_LENGTH} characters.`
        ),
];