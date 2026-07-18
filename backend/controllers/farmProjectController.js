const FarmProject = require('../models/FarmProject');

// Create Farm Project
exports.createFarmProject = async (req, res) => {
    try {

        const {
            name,
            description,
            startDate,
            endDate,
        } = req.body;

        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: 'Project name and description are required.',
            });
        }

        const project = await FarmProject.create({
            name,
            description,
            startDate,
            endDate,
            user: req.user._id,
        });

        console.log(`✅ Farm project created: ${project.name}`);

        return res.status(201).json({
            success: true,
            message: 'Farm project created successfully.',
            data: project,
        });

    } catch (error) {

        console.error('❌ Farm Project Create Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while creating farm project.',
        });
    }
};

// Get Farm Projects
exports.getFarmProjects = async (req, res) => {
    try {

        const projects = await FarmProject.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: projects.length,
            data: projects,
        });

    } catch (error) {

        console.error('❌ Farm Project Fetch Error:', error);

        return res.status(500).json({
            success: false,
            message: 'Server error while fetching farm projects.',
        });
    }
};