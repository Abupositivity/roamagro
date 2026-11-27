const {
    body,
    param,
    query,
} = require('express-validator');

const MAX_IMAGES = 3;
const MAX_PAGE_LIMIT = 50;
const DEFAULT_PAGE_LIMIT = 20;
const MAX_SEARCH_LENGTH = 150;
const MAX_CATEGORY_LENGTH = 150;

const isPositiveSafeInteger = (value) => {
    if (
        typeof value !== 'string' ||
        !/^\d+$/.test(value)
    ) {
        return false;
    }

    const number = Number(value);

    return (
        Number.isSafeInteger(number) &&
        number >= 1
    );
};

const isValidQueryCoordinate = (
    value,
    min,
    max
) => {
    if (
        typeof value !== 'string' ||
        !value.trim() ||
        !/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?$/.test(
            value.trim()
        )
    ) {
        return false;
    }

    const number = Number(value);

    return (
        Number.isFinite(number) &&
        number >= min &&
        number <= max
    );
};

const parseImageArray = (value) => {
    if (Array.isArray(value)) {
        return value;
    }

    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (error) {
            return null;
        }
    }

    return null;
};

const isValidImageArray = (value) => {
    const images = parseImageArray(value);

    return (
        Array.isArray(images) &&
        images.length <= MAX_IMAGES &&
        images.every(
            (image) =>
                typeof image === 'string' &&
                image.trim().length > 0
        ) &&
        new Set(images).size === images.length
    );
};

const parseCoordinates = (value) => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (error) {
            return undefined;
        }
    }

    return value;
};

const isValidCoordinates = (value) => {
    if (value === null) {
        return true;
    }

    const coordinates = parseCoordinates(value);

    if (
        !coordinates ||
        typeof coordinates !== 'object' ||
        Array.isArray(coordinates)
    ) {
        return false;
    }

    const { latitude, longitude } = coordinates;

    if (
        latitude === undefined ||
        latitude === null ||
        latitude === '' ||
        longitude === undefined ||
        longitude === null ||
        longitude === ''
    ) {
        return false;
    }

    const lat = Number(latitude);
    const lon = Number(longitude);

    return (
        Number.isFinite(lat) &&
        Number.isFinite(lon) &&
        lat >= -90 &&
        lat <= 90 &&
        lon >= -180 &&
        lon <= 180
    );
};

const coordinatesValidation = [
    body('coordinates')
        .optional({ values: 'undefined' })
        .custom(isValidCoordinates)
        .withMessage(
            'Coordinates must contain valid latitude and longitude values.'
        ),
];

const imageCountValidation = [
    body()
        .custom((value, { req }) => {
            const files = req.files || [];

            if (files.length > MAX_IMAGES) {
                throw new Error(
                    'You can add up to 3 images.'
                );
            }

            const hasExistingImages =
                req.body.existingImages !== undefined;

            const imageValue = hasExistingImages
                ? req.body.existingImages
                : req.body.images;

            if (imageValue === undefined) {
                return true;
            }

            const images = parseImageArray(imageValue);

            if (!Array.isArray(images)) {
                return true;
            }

            if (
                images.length + files.length >
                MAX_IMAGES
            ) {
                throw new Error(
                    'A listing can contain up to 3 images.'
                );
            }

            return true;
        }),
];

const createImageValidation = [
    body('images')
        .optional({ values: 'undefined' })
        .custom(isValidImageArray)
        .withMessage(
            'Images must be a valid array containing up to 3 image URLs.'
        ),

    body('existingImages')
        .not()
        .exists()
        .withMessage(
            'Existing images cannot be supplied when creating a listing.'
        ),

    ...imageCountValidation,
];

const updateImageValidation = [
    body('images')
        .optional({ values: 'undefined' })
        .custom(isValidImageArray)
        .withMessage(
            'Images must be a valid array containing up to 3 image URLs.'
        ),

    body('existingImages')
        .optional({ values: 'undefined' })
        .custom(isValidImageArray)
        .withMessage(
            'Existing images must be a valid array containing up to 3 image URLs.'
        ),

    body()
        .custom((value, { req }) => {
            if (
                req.body.images !== undefined &&
                req.body.existingImages !== undefined
            ) {
                throw new Error(
                    'Provide either images or existingImages, not both.'
                );
            }

            return true;
        }),

    ...imageCountValidation,
];

/**
 * Validate Marketplace Listing Retrieval
 */
exports.getMarketplaceItemsValidator = [
    query('page')
        .optional({ values: 'undefined' })
        .custom(isPositiveSafeInteger)
        .withMessage(
            'Page must be a positive integer.'
        ),

    query('limit')
        .optional({ values: 'undefined' })
        .custom((value) => {
            return (
                isPositiveSafeInteger(value) &&
                Number(value) <= MAX_PAGE_LIMIT
            );
        })
        .withMessage(
            'Limit must be an integer between 1 and 50.'
        ),

    query('search')
        .optional({ values: 'undefined' })
        .isString()
        .withMessage(
            'Search must be a valid string.'
        )
        .bail()
        .custom((value) => {
            return (
                value.trim().length <=
                MAX_SEARCH_LENGTH
            );
        })
        .withMessage(
            'Search cannot exceed 150 characters.'
        ),

    query('category')
        .optional({ values: 'undefined' })
        .isString()
        .withMessage(
            'Category must be a valid string.'
        )
        .bail()
        .custom((value) => {
            return (
                value.trim().length <=
                MAX_CATEGORY_LENGTH
            );
        })
        .withMessage(
            'Category cannot exceed 150 characters.'
        ),

    query('availability')
        .optional({ values: 'undefined' })
        .custom((value) => {
            return (
                typeof value === 'string' &&
                [
                    '',
                    'All',
                    'Available',
                    'Sold',
                ].includes(value)
            );
        })
        .withMessage(
            'Availability must be All, Available or Sold.'
        ),

    query('mine')
        .optional({ values: 'undefined' })
        .custom((value) => {
            return (
                value === 'true' ||
                value === 'false'
            );
        })
        .withMessage(
            'Mine must be true or false.'
        ),

    query('userLatitude')
        .optional({ values: 'undefined' })
        .custom((value) => {
            return isValidQueryCoordinate(
                value,
                -90,
                90
            );
        })
        .withMessage(
            'User latitude must be between -90 and 90.'
        ),

    query('userLongitude')
        .optional({ values: 'undefined' })
        .custom((value) => {
            return isValidQueryCoordinate(
                value,
                -180,
                180
            );
        })
        .withMessage(
            'User longitude must be between -180 and 180.'
        ),

    query()
        .custom((value, { req }) => {
            const hasLatitude =
                req.query.userLatitude !== undefined;

            const hasLongitude =
                req.query.userLongitude !== undefined;

            if (hasLatitude !== hasLongitude) {
                throw new Error(
                    'User latitude and longitude must be supplied together.'
                );
            }

            return true;
        }),

    query()
        .custom((value, { req }) => {
            const {
                page,
                limit,
            } = req.query;

            if (
                page !== undefined &&
                !isPositiveSafeInteger(page)
            ) {
                return true;
            }

            if (
                limit !== undefined &&
                (
                    !isPositiveSafeInteger(limit) ||
                    Number(limit) > MAX_PAGE_LIMIT
                )
            ) {
                return true;
            }

            const currentPage =
                page === undefined
                    ? 1
                    : Number(page);

            const pageLimit =
                limit === undefined
                    ? DEFAULT_PAGE_LIMIT
                    : Number(limit);

            const skip =
                (currentPage - 1) * pageLimit;

            if (!Number.isSafeInteger(skip)) {
                throw new Error(
                    'Requested page exceeds the supported pagination range.'
                );
            }

            return true;
        }),
];

exports.createMarketplaceValidator = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage(
            'Title is required.'
        )
        .bail()
        .isLength({ max: 150 })
        .withMessage(
            'Title is too long.'
        )
        .escape(),

    body('description')
        .trim()
        .notEmpty()
        .withMessage(
            'Description is required.'
        )
        .bail()
        .isLength({ min: 10 })
        .withMessage(
            'Description is too short.'
        ),

    body('category')
        .trim()
        .notEmpty()
        .withMessage(
            'Category is required.'
        )
        .escape(),

    body('price')
        .notEmpty()
        .withMessage(
            'Price is required.'
        )
        .bail()
        .isFloat({ min: 1 })
        .withMessage(
            'Price must be greater than zero.'
        ),

    body('quantity')
        .optional()
        .isFloat({ min: 1 })
        .withMessage(
            'Quantity must be at least 1.'
        ),

    body('unit')
        .optional()
        .trim()
        .escape(),

    body('location')
        .optional()
        .trim()
        .escape(),

    body('available')
        .optional()
        .isBoolean()
        .withMessage(
            'Availability must be true or false.'
        ),

    ...coordinatesValidation,
    ...createImageValidation,
];

exports.marketplaceIdValidator = [
    param('id')
        .isMongoId()
        .withMessage(
            'Invalid marketplace listing ID.'
        ),
];

exports.updateMarketplaceValidator = [
    param('id')
        .isMongoId()
        .withMessage(
            'Invalid marketplace listing ID.'
        ),

    body('title')
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            'Title cannot be empty.'
        )
        .bail()
        .isLength({ max: 150 })
        .withMessage(
            'Title is too long.'
        )
        .escape(),

    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 })
        .withMessage(
            'Description is too short.'
        ),

    body('category')
        .optional()
        .trim()
        .notEmpty()
        .withMessage(
            'Category cannot be empty.'
        )
        .escape(),

    body('price')
        .optional()
        .isFloat({ min: 1 })
        .withMessage(
            'Price must be greater than zero.'
        ),

    body('quantity')
        .optional()
        .isFloat({ min: 1 })
        .withMessage(
            'Quantity must be at least 1.'
        ),

    body('unit')
        .optional()
        .trim()
        .escape(),

    body('location')
        .optional()
        .trim()
        .escape(),

    body('available')
        .optional()
        .isBoolean()
        .withMessage(
            'Availability must be true or false.'
        ),

    ...coordinatesValidation,
    ...updateImageValidation,
];