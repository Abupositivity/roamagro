const FarmProject = require("../models/FarmProject");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../utils/AppError");

const {
  RESOURCES,
  createWithinQuota,
  deleteWithinQuota,
} = require("../services/quotaService");

const ALLOWED_PROJECT_FIELDS = [
  "name",
  "description",
  "crop",
  "farmType",
  "category",
  "season",
  "farmSize",
  "measurementUnit",
  "location",
  "budget",
  "status",
  "priority",
  "startDate",
  "endDate",
  "weatherNotes",
  "projectImage",
  "tags",
  "activities",
  "tasks",
  "expenses",
  "harvests",
  "reminders",
];

const getProjectData = (body = {}) => {
  const data = {};

  ALLOWED_PROJECT_FIELDS.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });

  return data;
};

/**
 * Financial calculations
 */
const calculateFinancials = (project) => {
  const income = (project.harvests || []).reduce(
    (sum, harvest) =>
      sum + (Number(harvest.totalValue) || 0),
    0,
  );

  const expenses = (project.expenses || []).reduce(
    (sum, expense) =>
      sum + (Number(expense.amount) || 0),
    0,
  );

  return {
    income,
    expenses,
    profit: income - expenses,
  };
};

/**
 * Project progress calculations
 */
const calculateProgress = (project) => {
  const activities = project.activities || [];
  const tasks = project.tasks || [];

  const totalItems =
    activities.length + tasks.length;

  if (!totalItems) {
    return 0;
  }

  const completedActivities = activities.filter(
    (activity) =>
      activity.status === "Completed",
  ).length;

  const completedTasks = tasks.filter(
    (task) =>
      task.status === "Completed",
  ).length;

  return Math.round(
    (
      (completedActivities + completedTasks) /
      totalItems
    ) * 100,
  );
};

/**
 * Format project response
 */
const formatProject = (project) => {
  const financials = calculateFinancials(project);
  const progress = calculateProgress(project);

  return {
    ...project.toObject(),
    financials,
    progress,
  };
};

/**
 * Find a project owned by the authenticated user
 */
const findProject = async (req) => {
  return FarmProject.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
};

/**
 * Standard not-found response
 */
const notFound = (
  res,
  message = "Farm project not found.",
) => {
  return res.status(404).json({
    success: false,
    message,
  });
};

/**
 * Synchronize calculated fields before saving
 */
const synchronizeProject = (project) => {
  project.financials = calculateFinancials(project);
  project.progress = calculateProgress(project);

  return project;
};

/**
 * Create Farm Project
 *
 * Free: maximum 3 existing projects
 * Premium: unlimited projects
 *
 * Quota enforcement happens transactionally.
 */
exports.createFarmProject = asyncHandler(
  async (req, res) => {
    const projectData = getProjectData(req.body);

    const project = await createWithinQuota({
      userId: req.user._id,
      resource: RESOURCES.FARM_PROJECTS,
      data: projectData,
    });

    return res.status(201).json({
      success: true,
      message: "Farm project created successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Get all projects owned by the user
 */
exports.getFarmProjects = asyncHandler(
  async (req, res) => {
    const projects = await FarmProject.find({
      user: req.user._id,
    }).sort({
      createdAt: -1,
    });

    const formattedProjects =
      projects.map(formatProject);

    return res.status(200).json({
      success: true,
      count: formattedProjects.length,
      data: formattedProjects,
    });
  },
);

/**
 * Get a single project
 */
exports.getFarmProject = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    return res.status(200).json({
      success: true,
      data: formatProject(project),
    });
  },
);

/**
 * Update Farm Project
 *
 * Updating an existing project does not
 * consume another quota slot.
 */
exports.updateFarmProject = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const projectData = getProjectData(req.body);

    Object.assign(project, projectData);

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Farm project updated successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Delete Farm Project
 *
 * Deletion automatically frees a quota slot.
 */
exports.deleteFarmProject = asyncHandler(
  async (req, res) => {
    const deletedProject = await deleteWithinQuota({
      userId: req.user._id,
      resource: RESOURCES.FARM_PROJECTS,
      resourceId: req.params.id,
    });

    if (!deletedProject) {
      return notFound(res);
    }

    return res.status(200).json({
      success: true,
      message: "Farm project deleted successfully.",
    });
  },
);

/**
 * Farm Dashboard Summary
 */
exports.getFarmDashboardSummary = asyncHandler(
  async (req, res) => {
    const projects = await FarmProject.find({
      user: req.user._id,
    });

    let totalIncome = 0;
    let totalExpenses = 0;

    let planning = 0;
    let active = 0;
    let completed = 0;

    let upcomingActivities = 0;
    let overdueActivities = 0;

    let pendingTasks = 0;
    let completedTasks = 0;

    let averageProgress = 0;

    const today = new Date();

    projects.forEach((project) => {
      const financials =
        calculateFinancials(project);

      totalIncome += financials.income;
      totalExpenses += financials.expenses;

      switch (project.status) {
        case "Planning":
          planning++;
          break;

        case "Active":
          active++;
          break;

        case "Completed":
          completed++;
          break;

        default:
          break;
      }

      (project.activities || []).forEach(
        (activity) => {
          if (
            activity.status !== "Completed" &&
            activity.dueDate
          ) {
            if (
              new Date(activity.dueDate) < today
            ) {
              overdueActivities++;
            } else {
              upcomingActivities++;
            }
          }
        },
      );

      (project.tasks || []).forEach(
        (task) => {
          if (task.status === "Pending") {
            pendingTasks++;
          }

          if (task.status === "Completed") {
            completedTasks++;
          }
        },
      );

      averageProgress +=
        calculateProgress(project);
    });

    return res.status(200).json({
      success: true,
      data: {
        totalProjects: projects.length,
        planning,
        active,
        completed,
        totalIncome,
        totalExpenses,
        totalProfit:
          totalIncome - totalExpenses,
        upcomingActivities,
        overdueActivities,
        pendingTasks,
        completedTasks,
        averageProgress: projects.length
          ? Math.round(
              averageProgress /
                projects.length,
            )
          : 0,
      },
    });
  },
);

/**
 * Create Activity
 */
exports.createActivity = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    project.activities.push({
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      priority: req.body.priority,
      status: req.body.status || "Pending",
      dueDate: req.body.dueDate,
      notes: req.body.notes,
    });

    synchronizeProject(project);

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Activity created successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Update Activity
 */
exports.updateActivity = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const activity = project.activities.id(
      req.params.activityId,
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    Object.assign(activity, req.body);

    if (activity.status === "Completed") {
      activity.completed = true;
      activity.completedAt = new Date();
    } else {
      activity.completed = false;
      activity.completedAt = null;
    }

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Activity updated successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Update Activity Status
 */
exports.updateActivityStatus = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const activity = project.activities.id(
      req.params.activityId,
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    activity.status = req.body.status;

    activity.completed =
      req.body.status === "Completed";

    activity.completedAt =
      activity.completed
        ? new Date()
        : null;

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Activity status updated.",
      data: formatProject(project),
    });
  },
);

/**
 * Delete Activity
 */
exports.deleteActivity = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const activity = project.activities.id(
      req.params.activityId,
    );

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found.",
      });
    }

    activity.deleteOne();

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Activity deleted successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Create Task
 */
exports.createTask = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    project.tasks.push(req.body);

    synchronizeProject(project);

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Update Task
 */
exports.updateTask = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const task = project.tasks.id(
      req.params.taskId,
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    Object.assign(task, req.body);

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Update Task Status
 */
exports.updateTaskStatus = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const task = project.tasks.id(
      req.params.taskId,
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    task.status = req.body.status;

    task.completed =
      req.body.status === "Completed";

    task.completedAt =
      task.completed
        ? new Date()
        : null;

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Task status updated.",
      data: formatProject(project),
    });
  },
);

/**
 * Delete Task
 */
exports.deleteTask = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const task = project.tasks.id(
      req.params.taskId,
    );

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    task.deleteOne();

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Create Expense
 */
exports.createExpense = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    project.expenses.push({
      category: req.body.category,
      description: req.body.description,
      amount: Number(req.body.amount) || 0,
      date: req.body.date || Date.now(),
    });

    synchronizeProject(project);

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Expense added successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Update Expense
 */
exports.updateExpense = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const expense = project.expenses.id(
      req.params.expenseId,
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    Object.assign(expense, req.body);

    expense.amount =
      Number(expense.amount) || 0;

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Delete Expense
 */
exports.deleteExpense = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const expense = project.expenses.id(
      req.params.expenseId,
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    expense.deleteOne();

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Create Harvest
 */
exports.createHarvest = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const quantity =
      Number(req.body.quantity) || 0;

    const pricePerUnit =
      Number(req.body.pricePerUnit) || 0;

    project.harvests.push({
      crop: req.body.crop,
      quantity,
      unit: req.body.unit || "kg",
      pricePerUnit,
      harvestDate:
        req.body.harvestDate || null,
      totalValue:
        quantity * pricePerUnit,
    });

    synchronizeProject(project);

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Harvest added successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Update Harvest
 */
exports.updateHarvest = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const harvest = project.harvests.id(
      req.params.harvestId,
    );

    if (!harvest) {
      return res.status(404).json({
        success: false,
        message: "Harvest not found.",
      });
    }

    Object.assign(harvest, req.body);

    harvest.quantity =
      Number(harvest.quantity) || 0;

    harvest.pricePerUnit =
      Number(harvest.pricePerUnit) || 0;

    harvest.totalValue =
      harvest.quantity *
      harvest.pricePerUnit;

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Harvest updated successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Delete Harvest
 */
exports.deleteHarvest = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const harvest = project.harvests.id(
      req.params.harvestId,
    );

    if (!harvest) {
      return res.status(404).json({
        success: false,
        message: "Harvest not found.",
      });
    }

    harvest.deleteOne();

    synchronizeProject(project);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Harvest deleted successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Create Reminder
 */
exports.createReminder = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    project.reminders.push({
      title: req.body.title,
      reminderDate:
        req.body.reminderDate,
      completed: false,
    });

    await project.save();

    return res.status(201).json({
      success: true,
      message: "Reminder created successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Update Reminder
 */
exports.updateReminder = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const reminder = project.reminders.id(
      req.params.reminderId,
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found.",
      });
    }

    Object.assign(reminder, req.body);

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Reminder updated successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Delete Reminder
 */
exports.deleteReminder = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const reminder = project.reminders.id(
      req.params.reminderId,
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found.",
      });
    }

    reminder.deleteOne();

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Reminder deleted successfully.",
      data: formatProject(project),
    });
  },
);

/**
 * Toggle Reminder Completion
 */
exports.toggleReminderCompletion = asyncHandler(
  async (req, res) => {
    const project = await findProject(req);

    if (!project) {
      return notFound(res);
    }

    const reminder = project.reminders.id(
      req.params.reminderId,
    );

    if (!reminder) {
      return res.status(404).json({
        success: false,
        message: "Reminder not found.",
      });
    }

    reminder.completed =
      !reminder.completed;

    await project.save();

    return res.status(200).json({
      success: true,
      message: "Reminder updated successfully.",
      data: formatProject(project),
    });
  },
);