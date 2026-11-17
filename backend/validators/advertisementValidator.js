const {
    body,
    param,
    validationResult,
} = require('express-validator');

const mongoose = require('mongoose');
const AppError = require('../utils/AppError');

const ALLOWED_PLACEMENTS = [
    'dashboard',
    'extension-dashboard',
];

const ALLOWED_STATUSES = [
    'draft',
    'active',
    'paused',
];

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return next(
            new AppError(
                errors.array()[0].msg,
                400
            )
        );
    }

    next();
};

const isSafeHttpsUrl = (value) => {
    if (typeof value !== 'string') {
        return false;
    }

    try {
        const url = new URL(value);

        return (
            url.protocol === 'https:' &&
            Boolean(url.hostname) &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
};

// FormData sends arrays as strings.
// JSON requests already contain proper arrays.
const parseAdvertisementFormData = (req, res, next) => {
    if (
        req.body &&
        typeof req.body.targetStates === 'string'
    ) {
        try {
            req.body.targetStates = JSON.parse(
                req.body.targetStates
            );
        } catch {
            return next(
                new AppError(
                    'Target states must be a valid array.',
                    400
                )
            );
        }
    }

    next();
};

const validateAdvertisementId = [
    param('id')
        .custom((value) =>
            mongoose.isValidObjectId(value)
        )
        .withMessage('Invalid advertisement ID.'),

    validateRequest,
];

const advertisementFields = (optional = false) => {
    const field = (name) => {
        const validator = body(name);

        return optional
            ? validator.optional()
            : validator.exists({
                values: 'null',
            });
    };

    return [
        field('title')
            .isString()
            .withMessage('Title must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Advertisement title is required.')
            .bail()
            .isLength({ max: 150 })
            .withMessage('Title cannot exceed 150 characters.'),

        field('description')
            .isString()
            .withMessage('Description must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Advertisement description is required.')
            .bail()
            .isLength({ max: 1000 })
            .withMessage('Description cannot exceed 1000 characters.'),

        field('advertiserName')
            .isString()
            .withMessage('Advertiser name must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Advertiser name is required.')
            .bail()
            .isLength({ max: 150 })
            .withMessage('Advertiser name cannot exceed 150 characters.'),

        // Existing URL may be sent unchanged during editing.
        // New URLs are rejected by the controller.
        body('imageUrl')
            .optional()
            .isString()
            .withMessage('Image URL must be text.')
            .bail()
            .trim()
            .custom(isSafeHttpsUrl)
            .withMessage('Image URL must use HTTPS.'),

        field('destinationUrl')
            .isString()
            .withMessage('Destination URL must be text.')
            .bail()
            .trim()
            .custom(isSafeHttpsUrl)
            .withMessage(
                'A valid HTTPS destination URL is required.'
            ),

        field('placement')
            .isIn(ALLOWED_PLACEMENTS)
            .withMessage('Invalid advertisement placement.'),

        body('targetStates')
            .optional()
            .isArray({ max: 37 })
            .withMessage(
                'Target states must be an array of at most 37 states.'
            ),

        body('targetStates.*')
            .isString()
            .withMessage('Each target state must be text.')
            .bail()
            .trim()
            .notEmpty()
            .withMessage('Target state cannot be empty.')
            .bail()
            .isLength({ max: 100 })
            .withMessage('Target state is too long.'),

        field('startsAt')
            .isISO8601({ strict: true })
            .withMessage('Invalid advertisement start date.'),

        field('endsAt')
            .isISO8601({ strict: true })
            .withMessage('Invalid advertisement end date.'),

        body('status')
            .optional()
            .isIn(ALLOWED_STATUSES)
            .withMessage('Invalid advertisement status.'),
    ];
};

const validateCreateAdvertisement = [
    ...advertisementFields(false),

    body().custom((value) => {
        const start = new Date(value.startsAt);
        const end = new Date(value.endsAt);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            throw new Error(
                'Advertisement end date must be after its start date.'
            );
        }

        return true;
    }),

    validateRequest,
];

const validateUpdateAdvertisement = [
    ...advertisementFields(true),
    validateRequest,
];

module.exports = {
    parseAdvertisementFormData,
    validateAdvertisementId,
    validateCreateAdvertisement,
    validateUpdateAdvertisement,
    ALLOWED_PLACEMENTS,
    ALLOWED_STATUSES,
};