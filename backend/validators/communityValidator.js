
const { body } = require('express-validator');

const MAX_TITLE_LENGTH = 200;
const MAX_CONTENT_LENGTH = 5000;
const MIN_CONTENT_LENGTH = 5;
const MAX_CATEGORY_LENGTH = 100;
const MAX_COMMENT_LENGTH = 1000;
const MAX_IMAGE_LENGTH = 3_000_000;

const validateImage = (field = 'image', optional = true) => {
    let validator = body(field);

    if (optional) {
        validator = validator.optional({ nullable: true });
    }

    return validator
        .isString()
        .withMessage('Image must be valid text data.')
        .bail()
        .isLength({ max: MAX_IMAGE_LENGTH })
        .withMessage('Image data is too large.')
        .bail()
        .custom((value) => {
            if (value === '') return true;

            const isJpegDataUrl =
                /^data:image\/jpeg;base64,[A-Za-z0-9+/]+={0,2}$/.test(value);

            const isHttpUrl =
                /^https?:\/\/\S+$/i.test(value);

            if (!isJpegDataUrl && !isHttpUrl) {
                throw new Error(
                    'Image must be a JPEG data URL or a valid HTTP(S) URL.'
                );
            }

            return true;
        });
};

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
            max: MAX_CONTENT_LENGTH
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

exports.createCommunityValidator = [
    validateTitle(),
    validateContent(),
    validateCategory(),
    validateImage()
];

exports.updateCommunityValidator = [
    body().custom((value) => {
        const allowedFields = ['title', 'content', 'category', 'image'];

        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            throw new Error('Request body must be an object.');
        }

        const suppliedFields = Object.keys(value);

        if (suppliedFields.length === 0) {
            throw new Error('Provide at least one field to update.');
        }

        const unexpectedFields = suppliedFields.filter(
            (field) => !allowedFields.includes(field)
        );

        if (unexpectedFields.length > 0) {
            throw new Error(
                `Unsupported update field(s): ${unexpectedFields.join(', ')}.`
            );
        }

        return true;
    }),
    validateTitle(true),
    validateContent(true),
    validateCategory(true),
    validateImage()
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
        )
];