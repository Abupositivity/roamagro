const FarmProject = require("../models/FarmProject");
const asyncHandler = require("../middleware/asyncHandler");

const calculateFinancials = (project) => {
  const income = (project.harvests || []).reduce(
    (sum, harvest) => sum + (Number(harvest.totalValue) || 0),
    0,
  );
  const expenses = (project.expenses || []).reduce(
    (sum, expense) => sum + (Number(expense.amount) || 0),
    0,
  );
  return {
    income,
    expenses,
    profit: income - expenses,
  };
};

const calculateProgress = (project) => {
  const activities = project.activities || [];
  const tasks = project.tasks || [];
  const totalItems = activities.length + tasks.length;
  if (!totalItems) return 0;
  const completedActivities = activities.filter(
    (activity) => activity.status === "Completed",
  ).length;
  const completedTasks = tasks.filter(
    (task) => task.status === "Completed",
  ).length;
  return Math.round(
    ((completedActivities + completedTasks) / totalItems) * 100,
  );
};

const formatProject = (project) => {
  const financials = calculateFinancials(project);
  const progress = calculateProgress(project);
  return {
    ...project.toObject(),
    financials,
    progress,
  };
};

const findProject = async (req) => {
  return FarmProject.findOne({
    _id: req.params.id,
    user: req.user._id,
  });
};

const saveProject = async (project) => {
  try {
    await project.save();
    return project;
  } catch (error) {
    if (error.name !== "VersionError") throw error;
    const freshProject = await FarmProject.findById(project._id);
    if (!freshProject) throw error;
    throw error;
  }
};

const notFound = (res, message = "Farm project not found.") => {
  return res.status(404).json({
    success: false,
    message,
  });
};

exports.createFarmProject = asyncHandler(async (req, res) => {
  const project = await FarmProject.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json({
    success: true,
    message: "Farm project created successfully.",
    data: formatProject(project),
  });
});

exports.getFarmProjects = asyncHandler(async (req, res) => {
  const projects = await FarmProject.find({
    user: req.user._id,
  }).sort({
    createdAt: -1,
  });
  const formattedProjects = projects.map(formatProject);
  res.status(200).json({
    success: true,
    count: formattedProjects.length,
    data: formattedProjects,
  });
});

exports.getFarmProject = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);
  res.status(200).json({
    success: true,
    data: formatProject(project),
  });
});

exports.updateFarmProject = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);
  Object.assign(project, req.body);
  project.financials = calculateFinancials(project);
  project.progress = calculateProgress(project);
  await project.save();
  res.status(200).json({
    success: true,
    message: "Farm project updated successfully.",
    data: formatProject(project),
  });
});

exports.deleteFarmProject = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);
  await project.deleteOne();
  res.status(200).json({
    success: true,
    message: "Farm project deleted successfully.",
  });
});

exports.getFarmDashboardSummary = asyncHandler(async (req, res) => {
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
    const financials = calculateFinancials(project);
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

    (project.activities || []).forEach((activity) => {
      if (activity.status !== "Completed" && activity.dueDate) {
        if (new Date(activity.dueDate) < today) {
          overdueActivities++;
        } else {
          upcomingActivities++;
        }
      }
    });

    (project.tasks || []).forEach((task) => {
      if (task.status === "Pending") {
        pendingTasks++;
      }
      if (task.status === "Completed") {
        completedTasks++;
      }
    });

    averageProgress += calculateProgress(project);
  });

  res.status(200).json({
    success: true,
    data: {
      totalProjects: projects.length,
      planning,
      active,
      completed,
      totalIncome,
      totalExpenses,
      totalProfit: totalIncome - totalExpenses,
      upcomingActivities,
      overdueActivities,
      pendingTasks,
      completedTasks,
      averageProgress: projects.length
        ? Math.round(averageProgress / projects.length)
        : 0,
    },
  });
});

exports.createActivity = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  project.activities.push({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    priority: req.body.priority,
    status: req.body.status || "Pending",
    dueDate: req.body.dueDate,
    notes: req.body.notes,
  });

  project.progress = calculateProgress(project);
  await project.save();

  res.status(201).json({
    success: true,
    message: "Activity created successfully.",
    data: formatProject(project),
  });
});

exports.updateActivity = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const activity = project.activities.id(req.params.activityId);
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

  project.progress = calculateProgress(project);
  await project.save();

  res.status(200).json({
    success: true,
    message: "Activity updated successfully.",
    data: formatProject(project),
  });
});

exports.updateActivityStatus = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const activity = project.activities.id(req.params.activityId);
  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found.",
    });
  }

  activity.status = req.body.status;
  activity.completed = req.body.status === "Completed";
  activity.completedAt = activity.completed ? new Date() : null;
  project.progress = calculateProgress(project);

  await project.save();

  res.status(200).json({
    success: true,
    message: "Activity status updated.",
    data: formatProject(project),
  });
});

exports.deleteActivity = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const activity = project.activities.id(req.params.activityId);
  if (!activity) {
    return res.status(404).json({
      success: false,
      message: "Activity not found.",
    });
  }

  activity.deleteOne();
  project.progress = calculateProgress(project);
  await project.save();

  res.status(200).json({
    success: true,
    message: "Activity deleted successfully.",
    data: formatProject(project),
  });
});

exports.createTask = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  project.tasks.push(req.body);
  project.progress = calculateProgress(project);
  await project.save();

  res.status(201).json({
    success: true,
    message: "Task created successfully.",
    data: formatProject(project),
  });
});

exports.updateTask = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const task = project.tasks.id(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  Object.assign(task, req.body);
  project.progress = calculateProgress(project);
  await project.save();

  res.status(200).json({
    success: true,
    message: "Task updated successfully.",
    data: formatProject(project),
  });
});

exports.updateTaskStatus = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const task = project.tasks.id(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  task.status = req.body.status;
  task.completed = req.body.status === "Completed";
  task.completedAt = task.completed ? new Date() : null;
  project.progress = calculateProgress(project);

  await project.save();

  res.status(200).json({
    success: true,
    message: "Task status updated.",
    data: formatProject(project),
  });
});

exports.deleteTask = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const task = project.tasks.id(req.params.taskId);
  if (!task) {
    return res.status(404).json({
      success: false,
      message: "Task not found.",
    });
  }

  task.deleteOne();
  project.progress = calculateProgress(project);
  await project.save();

  res.status(200).json({
    success: true,
    message: "Task deleted successfully.",
    data: formatProject(project),
  });
});

exports.createExpense = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  project.expenses.push({
    category: req.body.category,
    description: req.body.description,
    amount: Number(req.body.amount) || 0,
    date: req.body.date || Date.now(),
  });

  project.financials = calculateFinancials(project);
  await project.save();

  res.status(201).json({
    success: true,
    message: "Expense added successfully.",
    data: formatProject(project),
  });
});

exports.updateExpense = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const expense = project.expenses.id(req.params.expenseId);
  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found.",
    });
  }

  Object.assign(expense, req.body);
  expense.amount = Number(expense.amount) || 0;
  project.financials = calculateFinancials(project);

  await project.save();

  res.status(200).json({
    success: true,
    message: "Expense updated successfully.",
    data: formatProject(project),
  });
});

exports.deleteExpense = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const expense = project.expenses.id(req.params.expenseId);
  if (!expense) {
    return res.status(404).json({
      success: false,
      message: "Expense not found.",
    });
  }

  expense.deleteOne();
  project.financials = calculateFinancials(project);

  await project.save();

  res.status(200).json({
    success: true,
    message: "Expense deleted successfully.",
    data: formatProject(project),
  });
});

exports.createHarvest = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const quantity = Number(req.body.quantity) || 0;
  const pricePerUnit = Number(req.body.pricePerUnit) || 0;

  project.harvests.push({
    crop: req.body.crop,
    quantity,
    unit: req.body.unit || "kg",
    pricePerUnit,
    harvestDate: req.body.harvestDate || null,
    totalValue: quantity * pricePerUnit,
  });

  project.financials = calculateFinancials(project);
  await project.save();

  res.status(201).json({
    success: true,
    message: "Harvest added successfully.",
    data: formatProject(project),
  });
});

exports.updateHarvest = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const harvest = project.harvests.id(req.params.harvestId);
  if (!harvest) {
    return res.status(404).json({
      success: false,
      message: "Harvest not found.",
    });
  }

  Object.assign(harvest, req.body);

  harvest.quantity = Number(harvest.quantity) || 0;
  harvest.pricePerUnit = Number(harvest.pricePerUnit) || 0;
  harvest.totalValue = harvest.quantity * harvest.pricePerUnit;

  project.financials = calculateFinancials(project);

  await project.save();

  res.status(200).json({
    success: true,
    message: "Harvest updated successfully.",
    data: formatProject(project),
  });
});

exports.deleteHarvest = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const harvest = project.harvests.id(req.params.harvestId);
  if (!harvest) {
    return res.status(404).json({
      success: false,
      message: "Harvest not found.",
    });
  }

  harvest.deleteOne();
  project.financials = calculateFinancials(project);

  await project.save();

  res.status(200).json({
    success: true,
    message: "Harvest deleted successfully.",
    data: formatProject(project),
  });
});

exports.createReminder = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  project.reminders.push({
    title: req.body.title,
    reminderDate: req.body.reminderDate,
    completed: false,
  });

  await project.save();

  res.status(201).json({
    success: true,
    message: "Reminder created successfully.",
    data: formatProject(project),
  });
});

exports.updateReminder = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const reminder = project.reminders.id(req.params.reminderId);
  if (!reminder) {
    return res.status(404).json({
      success: false,
      message: "Reminder not found.",
    });
  }

  Object.assign(reminder, req.body);
  await project.save();

  res.status(200).json({
    success: true,
    message: "Reminder updated successfully.",
    data: formatProject(project),
  });
});

exports.deleteReminder = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const reminder = project.reminders.id(req.params.reminderId);
  if (!reminder) {
    return res.status(404).json({
      success: false,
      message: "Reminder not found.",
    });
  }

  reminder.deleteOne();
  await project.save();

  res.status(200).json({
    success: true,
    message: "Reminder deleted successfully.",
    data: formatProject(project),
  });
});

exports.toggleReminderCompletion = asyncHandler(async (req, res) => {
  const project = await findProject(req);
  if (!project) return notFound(res);

  const reminder = project.reminders.id(req.params.reminderId);
  if (!reminder) {
    return res.status(404).json({
      success: false,
      message: "Reminder not found.",
    });
  }

  reminder.completed = !reminder.completed;
  await project.save();

  res.status(200).json({
    success: true,
    message: "Reminder updated successfully.",
    data: formatProject(project),
  });
});