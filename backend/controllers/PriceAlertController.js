const PriceAlert = require('../models/PriceAlert');
const asyncHandler = require('../middleware/asyncHandler');

exports.createPriceAlert = asyncHandler(async (req, res) => {
    const {
        product,
        location = '',
        targetPrice,
        alertType = 'Above',
    } = req.body;

    const normalizedProduct = product.trim();
    const normalizedLocation = location.trim();
    const normalizedTargetPrice = Number(targetPrice);

    const existingAlert = await PriceAlert.findOne({
        user: req.user._id,
        product: normalizedProduct,
        location: normalizedLocation,
        targetPrice: normalizedTargetPrice,
        alertType,
        active: true,
    });

    if (existingAlert) {
        return res.status(409).json({
            success: false,
            message: 'This price alert already exists.',
        });
    }

    const alert = await PriceAlert.create({
        product: normalizedProduct,
        location: normalizedLocation,
        targetPrice: normalizedTargetPrice,
        alertType,
        user: req.user._id,
        active: true,
    });

    console.log(
        `Price Alert Created: ${alert.product}`
    );

    res.status(201).json({
        success: true,
        message: 'Price alert created successfully.',
        data: alert,
    });
});

exports.getPriceAlerts = asyncHandler(async (req, res) => {
    const alerts = await PriceAlert.find({
        user: req.user._id,
    })
        .sort({
            createdAt: -1,
        })
        .lean();

    res.status(200).json({
        success: true,
        count: alerts.length,
        data: alerts,
    });
});

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