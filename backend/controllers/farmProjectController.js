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
const calculateProgress=project=>{
    const activities=project.activities||[];
    const tasks=project.tasks||[];
    const totalItems=activities.length+tasks.length;
    if(!totalItems)return 0;
    const completedActivities=activities.filter(
        activity=>activity.status==='Completed'
    ).length;
    const completedTasks=tasks.filter(
        task=>task.status==='Completed'
    ).length;
    return Math.round(
        ((completedActivities+completedTasks)/totalItems)*100
    );
};
const recalculateProject=(project)=>{
    const financials=calculateFinancials(project);
    project.financials=financials;
    project.progress=calculateProgress(project);
    return{
        ...project.toObject(),
        financials,
        progress:project.progress
    };
};
const findProject=async(req)=>
    FarmProject.findOne({
        _id:req.params.id,
        user:req.user._id
    });
const notFound=(res,message)=>
    res.status(404).json({
        success:false,
        message
    });

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
    let pendingTasks=0;
    let completedTasks=0;
    let averageProgress=0;

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
        (project.tasks||[]).forEach(task=>{
            switch(task.status){
                case'Pending':
                pendingTasks++;
                break;
                case'Completed':
                completedTasks++;
                break;
                default:
                    break;
                }
            });
            averageProgress+=calculateProgress(project);
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
            averageProgress: projects.length ? Math.round(averageProgress / projects.length) : 0
        },
    });
});

/*
|--------------------------------------------------------------------------
| Get Project Activities
|--------------------------------------------------------------------------
*/
exports.getProjectActivities=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}
res.status(200).json({
success:true,
count:project.activities.length,
data:project.activities
});
});

/*
|--------------------------------------------------------------------------
| Create Activity
|--------------------------------------------------------------------------
*/
exports.createActivity=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}

project.activities.push({
title:req.body.title,
description:req.body.description,
category:req.body.category,
priority:req.body.priority,
status:req.body.status||'Pending',
dueDate:req.body.dueDate,
notes:req.body.notes
});

project.progress=calculateProgress(project);

await project.save();

res.status(201).json({
success:true,
message:'Activity created successfully.',
data:project.activities[project.activities.length-1]
});
});

/*
|--------------------------------------------------------------------------
| Update Activity
|--------------------------------------------------------------------------
*/
exports.updateActivity=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}

const activity=project.activities.id(req.params.activityId);
if(!activity){
return res.status(404).json({
success:false,
message:'Activity not found.'
});
}
Object.assign(activity,req.body);
if(activity.status==='Completed'){
activity.completed=true;
activity.completedAt=new Date();
}else{
activity.completed=false;
activity.completedAt=null;
}

project.progress=calculateProgress(project);
await project.save();
res.status(200).json({
success:true,
message:'Activity updated successfully.',
data:activity
});
});

/*
|--------------------------------------------------------------------------
| Update Activity Status
|--------------------------------------------------------------------------
*/
exports.updateActivityStatus=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}

const activity=project.activities.id(req.params.activityId);
if(!activity){
return res.status(404).json({
success:false,
message:'Activity not found.'
});
}

activity.status=req.body.status;
activity.completed=req.body.status==='Completed';
activity.completedAt=activity.completed?new Date():null;
project.progress=calculateProgress(project);
await project.save();
res.status(200).json({
success:true,
message:'Activity status updated.',
data:activity
});
});

/*
|--------------------------------------------------------------------------
| Delete Activity
|--------------------------------------------------------------------------
*/
exports.deleteActivity=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}

const activity=project.activities.id(req.params.activityId);
if(!activity){
return res.status(404).json({
success:false,
message:'Activity not found.'
});
}
activity.deleteOne();
project.progress=calculateProgress(project);
await project.save();
res.status(200).json({
success:true,
message:'Activity deleted successfully.'
});
});

/*
|--------------------------------------------------------------------------
| Get Project Tasks
|--------------------------------------------------------------------------
*/
exports.getTasks=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}
res.status(200).json({
success:true,
count:project.tasks.length,
data:project.tasks
});
});

/*
|--------------------------------------------------------------------------
| Create Task
|--------------------------------------------------------------------------
*/
exports.createTask=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}
project.tasks.push(req.body);
await project.save();
res.status(201).json({
success:true,
message:'Task created successfully.',
data:project.tasks[project.tasks.length-1]
});
});

/*
|--------------------------------------------------------------------------
| Update Task
|--------------------------------------------------------------------------
*/
exports.updateTask=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}

const task=project.tasks.id(req.params.taskId);
if(!task){
return res.status(404).json({
success:false,
message:'Task not found.'
});
}
Object.assign(task,req.body);
await project.save();
res.status(200).json({
success:true,
message:'Task updated successfully.',
data:task
});
});

/*
|--------------------------------------------------------------------------
| Update Task Status
|--------------------------------------------------------------------------
*/
exports.updateTaskStatus=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}

const task=project.tasks.id(req.params.taskId);
if(!task){
return res.status(404).json({
success:false,
message:'Task not found.'
});
}
task.status=req.body.status;
task.completed=req.body.status==='Completed';
task.completedAt=
task.completed
?new Date()
:null;
await project.save();
res.status(200).json({
success:true,
message:'Task status updated.',
data:task
});
});

/*
|--------------------------------------------------------------------------
| Delete Task
|--------------------------------------------------------------------------
*/
exports.deleteTask=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}

const task=project.tasks.id(req.params.taskId);
if(!task){
return res.status(404).json({
success:false,
message:'Task not found.'
});
}
task.deleteOne();
await project.save();
res.status(200).json({
success:true,
message:'Task deleted successfully.'
});
});

/*
|--------------------------------------------------------------------------
| Create Expense
|--------------------------------------------------------------------------
*/
exports.createExpense=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}
project.expenses.push({
category:req.body.category,
description:req.body.description,
amount:req.body.amount,
date:req.body.date||Date.now()
});
await project.save();
res.status(201).json({
success:true,
message:'Expense added successfully.',
data:recalculateProject(project)
});
});

/*
|--------------------------------------------------------------------------
| Update Expense
|--------------------------------------------------------------------------
*/
exports.updateExpense=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}
const expense=project.expenses.id(req.params.expenseId);
if(!expense){
return res.status(404).json({
success:false,
message:'Expense not found.'
});
}
Object.assign(expense,req.body);
await project.save();
res.status(200).json({
success:true,
message:'Expense updated successfully.',
data:recalculateProject(project)
});
});

/*
|--------------------------------------------------------------------------
| Delete Expense
|--------------------------------------------------------------------------
*/
exports.deleteExpense=asyncHandler(async(req,res)=>{
const project=await FarmProject.findOne({
_id:req.params.id,
user:req.user._id
});
if(!project){
return res.status(404).json({
success:false,
message:'Farm project not found.'
});
}
const expense=project.expenses.id(req.params.expenseId);
if(!expense){
return res.status(404).json({
success:false,
message:'Expense not found.'
});
}
expense.deleteOne();
await project.save();
res.status(200).json({
success:true,
message:'Expense deleted successfully.',
data:recalculateProject(project)
});
});