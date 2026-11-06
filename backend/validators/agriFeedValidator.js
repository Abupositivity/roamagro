const { body } = require('express-validator');

const MAX_TITLE_LENGTH = 150;
const MAX_CONTENT_LENGTH = 5000;
const MAX_CATEGORY_LENGTH = 100;
const MAX_REGION_LENGTH = 100;
const MAX_SOURCE_LENGTH = 2048;
const MAX_IMAGE_URL_LENGTH = 2048;

const ALLOWED_FIELDS = [
    'title',
    'content',
    'category',
    'language',
    'region',
    'image',
    'source',
    'priority',
    'status',
];

const validateTitle = (required = true) => {
    let validator = body('title');

    if (!required) {
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
            `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`
        );
};

const validateContent = (required = true) => {
    let validator = body('content');

    if (!required) {
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
            min: 5,
            max: MAX_CONTENT_LENGTH,
        })
        .withMessage(
            `Content must be between 5 and ${MAX_CONTENT_LENGTH} characters.`
        );
};

const validateCategory = (required = true) => {
    let validator = body('category');

    if (!required) {
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
            `Category cannot exceed ${MAX_CATEGORY_LENGTH} characters.`
        );
};

const validateLanguage = () =>
    body('language')
        .optional()
        .isString()
        .withMessage('Language must be text.')
        .bail()
        .isIn(['English', 'Hausa'])
        .withMessage(
            'Language must be English or Hausa.'
        );

const validatePriority = () =>
    body('priority')
        .optional()
        .isString()
        .withMessage('Priority must be text.')
        .bail()
        .isIn([
            'Normal',
            'Important',
            'Urgent',
        ])
        .withMessage('Invalid priority.');

const validateStatus = () =>
    body('status')
        .optional()
        .isString()
        .withMessage('Status must be text.')
        .bail()
        .isIn([
            'Draft',
            'Published',
            'Archived',
        ])
        .withMessage('Invalid status.');

const validateRegion = () =>
    body('region')
        .optional()
        .isString()
        .withMessage('Region must be text.')
        .bail()
        .trim()
        .isLength({ max: MAX_REGION_LENGTH })
        .withMessage(
            `Region cannot exceed ${MAX_REGION_LENGTH} characters.`
        );

const validateImage = () =>
    body('image')
        .optional({ values: 'null' })
        .custom((value) => {
            if (value === '') {
                return true;
            }

            if (
                typeof value !== 'string' ||
                value.length > MAX_IMAGE_URL_LENGTH ||
                !/^https:\/\/[^\s]+$/i.test(value)
            ) {
                throw new Error(
                    'Image must be a valid HTTPS URL or empty to remove it.'
                );
            }

            return true;
        });

const validateSource = () =>
    body('source')
        .optional()
        .isString()
        .withMessage('Source must be text.')
        .bail()
        .trim()
        .isLength({ max: MAX_SOURCE_LENGTH })
        .withMessage(
            `Source cannot exceed ${MAX_SOURCE_LENGTH} characters.`
        );

const validateAllowedFields = (requireFields = false) =>
    body().custom((value, { req }) => {
        const requestBody = req.body || {};

        const suppliedFields = Object.keys(requestBody);

        const unexpectedFields = suppliedFields.filter(
            (field) => !ALLOWED_FIELDS.includes(field)
        );

        if (unexpectedFields.length > 0) {
            throw new Error(
                `Unexpected field(s): ${unexpectedFields.join(', ')}.`
            );
        }

        if (
            requireFields &&
            !suppliedFields.some(
                (field) => ALLOWED_FIELDS.includes(field)
            ) &&
            !req.file
        ) {
            throw new Error(
                'Provide at least one field to update.'
            );
        }

        return true;
    });

exports.createTipValidation = [
    validateAllowedFields(),
    validateTitle(),
    validateContent(),
    validateCategory(),
    validateLanguage(),
    validatePriority(),
    validateStatus(),
    validateRegion(),
    validateImage(),
    validateSource(),
];

exports.updateTipValidation = [
    validateAllowedFields(true),
    validateTitle(false),
    validateContent(false),
    validateCategory(false),
    validateLanguage(),
    validatePriority(),
    validateStatus(),
    validateRegion(),
    validateImage(),
    validateSource(),
];