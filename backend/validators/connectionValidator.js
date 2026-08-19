const{param}=require('express-validator');

const userIdValidator=[
    param('userId')
        .isMongoId()
        .withMessage('Invalid user ID.')
];

module.exports={
    userIdValidator
};