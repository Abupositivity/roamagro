const PriceAlert = require('../models/PriceAlert');
const asyncHandler = require('../middleware/asyncHandler');

// Create Alert
exports.createPriceAlert = asyncHandler(async (req, res) => {

    const alert = await PriceAlert.create({
        ...req.body,
        user: req.user._id,
    });

    console.log(
        `🔔 Price Alert Created: ${alert.product}`
    );

    res.status(201).json({
        success: true,
        message: 'Price alert created successfully.',
        data: alert,
    });

});

// Get My Alerts
exports.getPriceAlerts = asyncHandler(async (req, res) => {

    const alerts = await PriceAlert.find({
        user: req.user._id,
    }).sort({
        createdAt: -1,
    });

    res.status(200).json({
        success: true,
        count: alerts.length,
        data: alerts,
    });

});

// Delete Alert
exports.deletePriceAlert = asyncHandler(async (req, res) => {

    const alert = await PriceAlert.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!alert) {

        return res.status(404).json({
            success: false,
            message: 'Price alert not found.',
        });

    }

    await alert.deleteOne();

    res.status(200).json({
        success: true,
        message: 'Price alert deleted.',
    });

});