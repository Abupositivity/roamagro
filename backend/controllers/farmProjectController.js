const FarmProject = require('../models/FarmProject');

// Create a new farm project
exports.createFarmProject = async (req, res) => {
    const { name, description, startDate, endDate } = req.body;

    try {
        const newProject = new FarmProject({
          name,
          description,
          startDate,
          endDate,
          user: req.userId,  
        });

        await newProject.save();
        res.status(201).json(newProject);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

// Get all farm projects for a user
exports.getFarmProjects = async (req, res) => {
    try {
        const projects = await FarmProject.find({ user: req.userId });
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};