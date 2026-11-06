const {
    body,
    param,
} = require('express-validator');

const MAX_IMAGES = 3;

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