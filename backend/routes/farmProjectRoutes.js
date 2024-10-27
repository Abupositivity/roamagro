const express = require('express');
const { createFarmProject, getFarmProjects } = require('../controllers/farmProjectController');
const router = express.Router();

// Routes for Farm Project
router.post('/', createFarmProject);
router.get('/', getFarmProjects);

module.exports = router;