const express = require('express');
const { createFarmProject, getFarmProjects } = require('../controllers/farmProjectController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(authMiddleware);

// Routes for Farm Project
router.post('/', createFarmProject);
router.get('/', getFarmProjects);

module.exports = router;