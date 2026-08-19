const{body,param}=require('express-validator');

const updateProfileValidator=[
    body('name')
        .optional()
        .trim()
        .isLength({
            min:2,
            max:100
        })
        .withMessage('Name must be between 2 and 100 characters.'),
    body('phone')
        .optional()
        .trim()
        .isLength({max:30})
        .withMessage('Phone number must not exceed 30 characters.'),
    body('state')
        .optional()
        .trim()
        .isLength({max:100})
        .withMessage('State must not exceed 100 characters.'),
    body('location')
        .optional()
        .trim()
        .isLength({max:150})
        .withMessage('Location must not exceed 150 characters.'),
    body('lga')
        .optional()
        .trim()
        .isLength({max:100})
        .withMessage('LGA must not exceed 100 characters.'),
    body('language')
        .optional()
        .isIn([
            'English',
            'Hausa'
        ])
        .withMessage('Language must be either English or Hausa.'),
    body('profilePhoto')
        .optional()
        .trim()
        .isLength({max:500})
        .withMessage('Profile photo URL must not exceed 500 characters.'),
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must not exceed 500 characters.')
];

const userIdValidator=[
    param('userId')
        .isMongoId()
        .withMessage('Invalid user ID.')
];

const searchUsersValidator=[
    body('search')
        .optional()
        .trim()
];

module.exports={
    updateProfileValidator,
    userIdValidator,
    searchUsersValidator
};