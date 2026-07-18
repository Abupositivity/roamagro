const express = require('express');
const router = express.Router();
const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {
    createFarmProject,
    getFarmProjects,
} = require('../controllers/farmProjectController');

const {
    createFarmProjectValidator,
} = require('../validators');

router.post(
    '/',
    ensureAuthenticated,
    createFarmProjectValidator,
    validateRequest,
    createFarmProject
);

router.get(
    '/',
    ensureAuthenticated,
    getFarmProjects
);

module.exports = router;