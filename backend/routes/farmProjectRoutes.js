const express = require('express');
const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');

const {
    createFarmProject,
    getFarmProjects,
} = require('../controllers/farmProjectController');

router.post('/', ensureAuthenticated, createFarmProject);

router.get('/', ensureAuthenticated, getFarmProjects);

module.exports = router;