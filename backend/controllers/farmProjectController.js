const FarmProject = require('../models/FarmProject');
const asyncHandler = require('../middleware/asyncHandler');

exports.createFarmProject = asyncHandler(async (req, res) => {

    const project = await FarmProject.create({
        ...req.body,
        user: req.user._id,
    });

    console.log(`✅ Farm Project: ${project.name}`);

    res.status(201).json({
        success: true,
        message: 'Farm project created successfully.',
        data: project,
    });

});

exports.getFarmProjects = asyncHandler(async (req, res) => {

    const projects = await FarmProject.find({
        user: req.user._id,
    }).sort({
        createdAt: -1,
    });

    res.json({
        success: true,
        count: projects.length,
        data: projects,
    });

});