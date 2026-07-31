const { body, param } = require('express-validator');

/**
 * Create Farm Project
 */
exports.createFarmProjectValidator = [
    body('name')
        .trim()
        .notEmpty()
        .withMessage('Project name is required.')
        .bail()
        .isLength({ max: 150 })
        .withMessage('Project name cannot exceed 150 characters.'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required.')
        .bail()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters.'),
    body('crop')
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage('Crop name is too long.'),
    body('farmType')
        .optional()
        .isIn([
            'Crop Farming',
            'Livestock',
            'Poultry',
            'Fishery',
            'Mixed Farming',
            'Other',
        ])
        .withMessage('Invalid farm type.'),
    body('farmSize')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Farm size must be a positive number.'),
    body('measurementUnit')
        .optional()
        .isIn([
            'Acres',
            'Hectares',
        ])
        .withMessage('Invalid measurement unit.'),
    body('location')
        .optional()
        .trim()
        .isLength({ max: 200 })
        .withMessage('Location is too long.'),
    body('season')
        .optional()
        .isIn([
            'Dry Season',
            'Rainy Season',
            'All Season',
        ])
        .withMessage('Invalid farming season.'),
    body('priority')
        .optional()
        .isIn([
            'Low',
            'Medium',
            'High',
        ])
        .withMessage('Invalid priority.'),
    body('status')
        .optional()
        .isIn([
            'Planning',
            'Active',
            'Paused',
            'Completed',
        ])
        .withMessage('Invalid status.'),
    body('progress')
        .optional()
        .isInt({
            min: 0,
            max: 100,
        })
        .withMessage('Progress must be between 0 and 100.'),
    body('startDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid start date.'),
    body('endDate')
        .optional()
        .isISO8601()
        .withMessage('Invalid end date.'),
    body('weatherNotes')
        .optional()
        .trim()
        .isLength({ max: 1000 })
        .withMessage('Weather notes are too long.'),
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array.')
];

/**
 * Update Project
 */
exports.updateFarmProjectValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid project ID.'),
    body('name')
        .optional()
        .trim()
        .isLength({ max: 150 }),
    body('description')
        .optional()
        .trim()
        .isLength({ min: 10 }),
    body('farmSize')
        .optional()
        .isFloat({ min: 0 }),
    body('progress')
        .optional()
        .isInt({
            min: 0,
            max: 100,
        }),
    body('status')
        .optional()
        .isIn([
            'Planning',
            'Active',
            'Paused',
            'Completed',
        ])
];

/**
 * Validate Mongo ID
 */
exports.projectIdValidator = [
    param('id')
        .isMongoId()
        .withMessage('Invalid project ID.')
];

/**
 * Validate Expense ID
 */
exports.createExpenseValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
body('category')
.trim()
.notEmpty()
.withMessage('Expense category is required.')
.isLength({max:100})
.withMessage('Category cannot exceed 100 characters.'),
body('description')
.optional()
.trim()
.isLength({max:500})
.withMessage('Description cannot exceed 500 characters.'),
body('amount')
.notEmpty()
.withMessage('Amount is required.')
.isFloat({min:0})
.withMessage('Amount must be a positive number.'),
body('date')
.optional()
.isISO8601()
.withMessage('Invalid expense date.')
];

/**
 * Update Expense
 */
exports.updateExpenseValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
param('expenseId')
.isMongoId()
.withMessage('Invalid expense ID.'),
body('category')
.optional()
.trim()
.isLength({max:100})
.withMessage('Category cannot exceed 100 characters.'),
body('description')
.optional()
.trim()
.isLength({max:500})
.withMessage('Description cannot exceed 500 characters.'),
body('amount')
.optional()
.isFloat({min:0})
.withMessage('Amount must be a positive number.'),
body('date')
.optional()
.isISO8601()
.withMessage('Invalid expense date.')
];

/**
 * Validate Expense ID
 */
exports.expenseIdValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
param('expenseId')
.isMongoId()
.withMessage('Invalid expense ID.')
];

/**
 * Validate Activity ID
 */
exports.activityIdValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
param('activityId')
.isMongoId()
.withMessage('Invalid activity ID.')
];

/**
 * Create Activity
 */
exports.createActivityValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),

body('title')
.trim()
.notEmpty()
.withMessage('Activity title is required.')
.isLength({max:150})
.withMessage('Activity title cannot exceed 150 characters.'),

body('description')
.optional()
.trim()
.isLength({max:1000})
.withMessage('Description is too long.'),

body('category')
.optional()
.isIn([
'Land Preparation',
'Planting',
'Irrigation',
'Weeding',
'Fertilizer',
'Pesticide',
'Harvest',
'Feeding',
'Vaccination',
'Maintenance',
'Other'
])
.withMessage('Invalid activity category.'),

body('priority')
.optional()
.isIn([
'Low',
'Medium',
'High'
])
.withMessage('Invalid priority.'),

body('status')
.optional()
.isIn([
'Pending',
'In Progress',
'Completed'
])
.withMessage('Invalid activity status.'),

body('dueDate')
.optional()
.isISO8601()
.withMessage('Invalid due date.'),

body('notes')
.optional()
.trim()
.isLength({max:1000})
.withMessage('Notes cannot exceed 1000 characters.')
];

/**
 * Update Activity
 */
exports.updateActivityValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),

param('activityId')
.isMongoId()
.withMessage('Invalid activity ID.'),

body('title')
.optional()
.trim()
.isLength({max:150})
.withMessage('Activity title cannot exceed 150 characters.'),

body('description')
.optional()
.trim()
.isLength({max:1000})
.withMessage('Description is too long.'),

body('category')
.optional()
.isIn([
'Land Preparation',
'Planting',
'Irrigation',
'Weeding',
'Fertilizer',
'Pesticide',
'Harvest',
'Feeding',
'Vaccination',
'Maintenance',
'Other'
]),

body('priority')
.optional()
.isIn([
'Low',
'Medium',
'High'
]),

body('status')
.optional()
.isIn([
'Pending',
'In Progress',
'Completed'
]),

body('dueDate')
.optional()
.isISO8601(),

body('notes')
.optional()
.trim()
.isLength({max:1000})
];

/**
 * Update Activity Status
 */
exports.updateActivityStatusValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),

param('activityId')
.isMongoId()
.withMessage('Invalid activity ID.'),

body('status')
.notEmpty()
.withMessage('Status is required.')
.isIn([
'Pending',
'In Progress',
'Completed'
])
.withMessage('Invalid activity status.')
];

/**
 * Create Task
 */
exports.createTaskValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
body('title')
.trim()
.notEmpty()
.withMessage('Task title is required.')
.bail()
.isLength({max:150})
.withMessage('Task title cannot exceed 150 characters.'),
body('description')
.optional()
.trim()
.isLength({max:1000})
.withMessage('Description cannot exceed 1000 characters.'),
body('priority')
.optional()
.isIn([
'Low',
'Medium',
'High'
])
.withMessage('Invalid priority.'),
body('status')
.optional()
.isIn([
'Pending',
'In Progress',
'Completed'
])
.withMessage('Invalid status.'),
body('assignedTo')
.optional()
.trim()
.isLength({max:100})
.withMessage('Assigned user is too long.'),
body('dueDate')
.optional()
.isISO8601()
.withMessage('Invalid due date.'),
body('notes')
.optional()
.trim()
.isLength({max:2000})
.withMessage('Notes cannot exceed 2000 characters.')
];

/**
 * Update Task
 */
exports.updateTaskValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
param('taskId')
.isMongoId()
.withMessage('Invalid task ID.'),
body('title')
.optional()
.trim()
.isLength({max:150})
.withMessage('Task title cannot exceed 150 characters.'),
body('description')
.optional()
.trim()
.isLength({max:1000})
.withMessage('Description cannot exceed 1000 characters.'),
body('priority')
.optional()
.isIn([
'Low',
'Medium',
'High'
])
.withMessage('Invalid priority.'),
body('status')
.optional()
.isIn([
'Pending',
'In Progress',
'Completed'
])
.withMessage('Invalid status.'),
body('assignedTo')
.optional()
.trim()
.isLength({max:100})
.withMessage('Assigned user is too long.'),
body('dueDate')
.optional()
.isISO8601()
.withMessage('Invalid due date.'),
body('notes')
.optional()
.trim()
.isLength({max:2000})
.withMessage('Notes cannot exceed 2000 characters.')
];

/**
 * update task status
 */
exports.updateTaskStatusValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
param('taskId')
.isMongoId()
.withMessage('Invalid task ID.'),
body('status')
.notEmpty()
.withMessage('Status is required.')
.isIn([
'Pending',
'In Progress',
'Completed'
])
.withMessage('Invalid task status.')
];

/**
 * Validate task ID
 */
exports.taskIdValidator=[
param('id')
.isMongoId()
.withMessage('Invalid project ID.'),
param('taskId')
.isMongoId()
.withMessage('Invalid task ID.')
];