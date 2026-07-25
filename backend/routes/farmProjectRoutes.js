const express = require('express');

const router = express.Router();

const ensureAuthenticated = require('../middleware/ensureAuthenticated');
const validateRequest = require('../middleware/validateRequest');

const {

    createFarmProject,
    getFarmProjects,
    getFarmProjectById,
    updateFarmProject,
    deleteFarmProject,

} = require('../controllers/farmProjectController');

const {

    createFarmProjectValidator,
    updateFarmProjectValidator,
    projectIdValidator,

} = require('../validators/farmProjectValidator');


/**
 * -----------------------------------------------------
 * Farm Projects
 * -----------------------------------------------------
 */

/**
 * Create Project
 */
router.post(
    '/',
    ensureAuthenticated,
    createFarmProjectValidator,
    validateRequest,
    createFarmProject
);

/**
 * Get All Projects
 */
router.get(
    '/',
    ensureAuthenticated,
    getFarmProjects
);

/**
 * Get Single Project
 */
router.get(
    '/:id',
    ensureAuthenticated,
    projectIdValidator,
    validateRequest,
    getFarmProjectById
);

/**
 * Update Project
 */
router.put(
    '/:id',
    ensureAuthenticated,
    updateFarmProjectValidator,
    validateRequest,
    updateFarmProject
);

/**
 * Delete Project
 */
router.delete(
    '/:id',
    ensureAuthenticated,
    projectIdValidator,
    validateRequest,
    deleteFarmProject
);

/**
 * -----------------------------------------------------
 * Future Commit 6.1.2
 * -----------------------------------------------------
 *
 * Activities
 * Tasks
 * Expenses
 * Harvests
 *
 * These routes will be added in the next milestone.
 *
 * POST   /:id/activities
 * PUT    /:id/activities/:activityId
 * DELETE /:id/activities/:activityId
 *
 * POST   /:id/tasks
 * PUT    /:id/tasks/:taskId
 * DELETE /:id/tasks/:taskId
 *
 * POST   /:id/expenses
 * PUT    /:id/expenses/:expenseId
 * DELETE /:id/expenses/:expenseId
 *
 * POST   /:id/harvests
 * PUT    /:id/harvests/:harvestId
 * DELETE /:id/harvests/:harvestId
 */
module.exports = router;