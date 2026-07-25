const FarmProject = require('../models/FarmProject');
const asyncHandler = require('../middleware/asyncHandler');

/*
|--------------------------------------------------------------------------
| Helper Functions
|--------------------------------------------------------------------------
*/

const calculateFinancials = (project) => {
    const income = (project.harvests || []).reduce(
        (sum, harvest) => sum + (harvest.totalValue || 0),
        0
    );

    const expenses = (project.expenses || []).reduce(
        (sum, expense) => sum + (expense.amount || 0),
        0
    );
    return {
        income,
        expenses,
        profit: income - expenses,
    };
};

const calculateProgress = (project) => {
    const totalActivities = project.activities?.length || 0;

    if (!totalActivities) return 0;
    const completedActivities = project.activities.filter(
        activity => activity.status === 'Completed'
    ).length;
    return Math.round((completedActivities / totalActivities) * 100);
};

/*
|--------------------------------------------------------------------------
| Create Project
|--------------------------------------------------------------------------
*/
exports.createFarmProject = asyncHandler(async (req, res) => {
    const project = await FarmProject.create({
        ...req.body,
        user: req.user._id,
    });
    res.status(201).json({
        success: true,
        message: 'Farm project created successfully.',
        data: project,
    });
});

/*
|--------------------------------------------------------------------------
| Get All Projects
|--------------------------------------------------------------------------
*/
exports.getFarmProjects = asyncHandler(async (req, res) => {
    const projects = await FarmProject.find({
        user: req.user._id,
    }).sort({
        createdAt: -1,
    });

    const formattedProjects = projects.map(project => {
        const financials = calculateFinancials(project);
        return {
            ...project.toObject(),
            financials,
            progress: calculateProgress(project),
        };
    });
    res.status(200).json({
        success: true,
        count: formattedProjects.length,
        data: formattedProjects,
    });
});

/*
|--------------------------------------------------------------------------
| Get Single Project
|--------------------------------------------------------------------------
*/
exports.getFarmProject = asyncHandler(async (req, res) => {
    const project = await FarmProject.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!project) {
        return res.status(404).json({
            success: false,
            message: 'Farm project not found.',
        });
    }
    const financials = calculateFinancials(project);
    res.status(200).json({
        success: true,
        data: {
            ...project.toObject(),
            financials,
            progress: calculateProgress(project),
        },
    });
});

/*
|--------------------------------------------------------------------------
| Update Project
|--------------------------------------------------------------------------
*/
exports.updateFarmProject = asyncHandler(async (req, res) => {
    const project = await FarmProject.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!project) {
        return res.status(404).json({
            success: false,
            message: 'Farm project not found.',
        });
    }
    Object.assign(project, req.body);
    await project.save();
    const financials = calculateFinancials(project);
    res.status(200).json({
        success: true,
        message: 'Farm project updated successfully.',
        data: {
            ...project.toObject(),
            financials,
            progress: calculateProgress(project),
        },
    });
});

/*
|--------------------------------------------------------------------------
| Delete Project
|--------------------------------------------------------------------------
*/
exports.deleteFarmProject = asyncHandler(async (req, res) => {
    const project = await FarmProject.findOne({
        _id: req.params.id,
        user: req.user._id,
    });
    if (!project) {
        return res.status(404).json({
            success: false,
            message: 'Farm project not found.',
        });
    }
    await project.deleteOne();
    res.status(200).json({
        success: true,
        message: 'Farm project deleted successfully.',
    });
});

/*
|--------------------------------------------------------------------------
| Dashboard Summary
|--------------------------------------------------------------------------
*/
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

    const today = new Date();

    projects.forEach(project => {
        const financials = calculateFinancials(project);
        totalIncome += financials.income;
        totalExpenses += financials.expenses;

        switch (project.status) {
            case 'Planning':
                planning++;
                break;
            case 'Active':
                active++;
                break;
            case 'Completed':
                completed++;
                break;

            default:
                break;
        }
        (project.activities || []).forEach(activity => {
            if (
                activity.status !== 'Completed' &&
                activity.dueDate
            ) {
                if (new Date(activity.dueDate) < today) {
                    overdueActivities++;
                } else {
                    upcomingActivities++;
                }
            }
        });
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
        },
    });
});