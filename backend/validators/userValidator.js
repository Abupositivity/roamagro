const { body } = require('express-validator');

exports.updateProfileValidator = [
    body('name')
        .optional()
        .trim()
        .isLength({
            min: 2,
            max: 100,
        })
        .withMessage(
            'Name must be between 2 and 100 characters.'
        ),

    body('phone')
        .optional()
        .trim()
        .isLength({
            max: 30,
        })
        .withMessage(
            'Phone number is too long.'
        ),

    body('state')
        .optional()
        .trim()
        .isLength({
            max: 100,
        })
        .withMessage(
            'State is too long.'
        ),

    body('lga')
        .optional()
        .trim()
        .isLength({
            max: 100,
        })
        .withMessage(
            'LGA is too long.'
        ),

    body('location')
        .optional()
        .trim()
        .isLength({
            max: 150,
        })
        .withMessage(
            'Location is too long.'
        ),

    body('language')
        .optional()
        .isIn([
            'English',
            'Hausa',
        ])
        .withMessage(
            'Language must be English or Hausa.'
        ),

    body('profilePhoto')
        .optional({ values: 'null' })
        .custom((value) => {
            if (value === '') {
                return true;
            }

            if (
                typeof value !== 'string' ||
                value.length > 2048 ||
                !/^https:\/\/[^\s]+$/i.test(value)
            ) {
                throw new Error(
                    'Profile photo must be a valid HTTPS URL or empty to remove it.'
                );
            }

            return true;
        }),

    body('bio')
        .optional()
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            'Bio cannot exceed 500 characters.'
        ),
];

exports.reportUserValidator = [
    body('reason')
        .trim()
        .isIn([
            'Spam',
            'Harassment',
            'Scam',
            'Fake Account',
            'Inappropriate Content',
            'Other',
        ])
        .withMessage(
            'Please select a valid report reason.'
        ),

    body('details')
        .optional()
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            'Report details cannot exceed 500 characters.'
        ),
];

exports.suspensionValidator = [
    body('reason')
        .optional()
        .trim()
        .isLength({
            max: 500,
        })
        .withMessage(
            'Suspension reason cannot exceed 500 characters.'
        ),

    body('durationDays')
        .optional({
            nullable: true,
        })
        .isInt({
            min: 1,
            max: 3650,
        })
        .withMessage(
            'Suspension duration must be between 1 and 3650 days.'
        ),
];

exports.reportStatusValidator = [
    body('status')
        .trim()
        .isIn([
            'Pending',
            'Reviewed',
            'Dismissed',
            'Action Taken',
        ])
        .withMessage(
            'Invalid report status.'
        ),
];