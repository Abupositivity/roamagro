const PriceIndex = require('../models/PriceIndex');

const asyncHandler = require('../middleware/asyncHandler');

const AppError = require('../utils/AppError');

// Create Price Entry
exports.createPriceIndex = asyncHandler(
    async (req, res) => {
        const entry = await PriceIndex.create({
            ...req.body,
            user: req.user._id,
        });

        console.log(
            `✅ Price Submitted: ${entry.product} (${entry.location})`
        );

        res.status(201).json({
            success: true,
            message: 'Price submitted successfully.',
            data: entry,
        });
    }
);

// Get Price Index
exports.getPriceIndexes = asyncHandler(
    async (req, res) => {
        const {
            page = 1,
            limit = 12,
            search = '',
            category = '',
            location = '',
            mine = 'false',
        } = req.query;

        const currentPage = Math.max(
            Number(page) || 1,
            1
        );

        const pageLimit = Math.min(
            Math.max(Number(limit) || 12, 1),
            50
        );

        const skip =
            (currentPage - 1) * pageLimit;

        const query = {};

        // Search product, location or market
        if (search.trim()) {
            const searchRegex = new RegExp(
                search.trim(),
                'i'
            );

            query.$or = [
                { product: searchRegex },
                { location: searchRegex },
                { market: searchRegex },
            ];
        }

        // Category filter
        if (
            category &&
            category !== 'All'
        ) {
            query.category = category;
        }

        // Location filter
        if (
            location &&
            location !== 'All'
        ) {
            query.location = location;
        }

        // Current user's prices
        if (mine === 'true') {
            query.user = req.user._id;
        }

        const [
            prices,
            total,
        ] = await Promise.all([
            PriceIndex.find(query)
                .populate('user', 'name')
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(pageLimit),

            PriceIndex.countDocuments(query),
        ]);

        const totalPages = Math.ceil(
            total / pageLimit
        );

        res.status(200).json({
            success: true,
            count: prices.length,
            total,
            page: currentPage,
            limit: pageLimit,
            totalPages,
            hasMore:
                currentPage < totalPages,
            data: prices,
        });
    }
);

// Delete own Price Entry
exports.deletePriceIndex =
    asyncHandler(async (req, res) => {
        const entry =
            await PriceIndex.findById(
                req.params.id
            );

        if (!entry) {
            throw new AppError(
                'Price entry not found.',
                404
            );
        }

        if (
            !entry.user ||
            String(entry.user) !==
                String(req.user._id)
        ) {
            throw new AppError(
                'You can only delete prices you submitted.',
                403
            );
        }

        await entry.deleteOne();

        console.log(
            `🗑️ Price Deleted: ${entry.product} (${entry.location})`
        );

        res.status(200).json({
            success: true,
            message:
                'Price deleted successfully.',
        });
    });