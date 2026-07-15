const FarmProject = require('../models/FarmProject');

// Create a new farm project
exports.createFarmProject = async (req, res) => {
    try {
        const { name, description, startDate, endDate } = req.body;

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

        res.status(201).json({
            success: true,
            message: 'Farm project created successfully.',
            project,
        });

    } catch (error) {
        console.error('Create Farm Project Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while creating project.',
        });
    }
};

// Get all farm projects
exports.getFarmProjects = async (req, res) => {
    try {

        const projects = await FarmProject.find({
            user: req.user._id,
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: projects.length,
            projects,
        });

    } catch (error) {

        console.error('Fetch Farm Projects Error:', error);

        res.status(500).json({
            success: false,
            message: 'Server error while fetching projects.',
        });

    }
};