const MarketplaceItem = require('../models/MarketplaceItem');
const asyncHandler = require('../middleware/asyncHandler');

/*
|--------------------------------------------------------------------------
| Create Marketplace Listing
|--------------------------------------------------------------------------
*/
exports.createMarketplaceItem = asyncHandler(
    async (req, res) => {
        const item =
            await MarketplaceItem.create({
                ...req.body,
                user: req.user._id,
            });

        console.log(
            `✅ Marketplace Listing Created: ${item.title}`
        );

        const populatedItem =
            await MarketplaceItem.findById(
                item._id
            ).populate(
                'user',
                'name phone location profilePhoto'
            );

        res.status(201).json({
            success: true,
            message:
                'Marketplace listing created successfully.',
            data: populatedItem,
        });
    }
);

/*
|--------------------------------------------------------------------------
| Get Marketplace Listings
| Server-side pagination + search + category
| + owner + availability
|--------------------------------------------------------------------------
*/
exports.getMarketplaceItems = asyncHandler(
    async (req, res) => {
        const {
            page = 1,
            limit = 12,
            search = '',
            category = 'All',
            mine = 'false',
            availability = 'All',
        } = req.query;

        const currentPage = Math.max(
            Number(page) || 1,
            1
        );

        const pageLimit = Math.min(
            Math.max(
                Number(limit) || 12,
                1
            ),
            50
        );

        const skip =
            (currentPage - 1) *
            pageLimit;

        const filter = {};

        /*
        |--------------------------------------------------------------------------
        | Search
        |--------------------------------------------------------------------------
        */
        if (search.trim()) {
            const keyword =
                search.trim();

            filter.$or = [
                {
                    title: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
                {
                    description: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
                {
                    location: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
                {
                    category: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
                {
                    unit: {
                        $regex: keyword,
                        $options: 'i',
                    },
                },
            ];
        }

        /*
        |--------------------------------------------------------------------------
        | Category
        |--------------------------------------------------------------------------
        */
        if (
            category &&
            category !== 'All'
        ) {
            filter.category = category;
        }

        /*
        |--------------------------------------------------------------------------
        | Availability
        |--------------------------------------------------------------------------
        */
        if (
            availability ===
            'Available'
        ) {
            filter.available = true;
        }

        if (
            availability === 'Sold'
        ) {
            filter.available = false;
        }

        /*
        |--------------------------------------------------------------------------
        | My Listings
        |--------------------------------------------------------------------------
        */
        if (mine === 'true') {
            filter.user =
                req.user._id;
        }

        const [
            items,
            total,
        ] = await Promise.all([
            MarketplaceItem.find(
                filter
            )
                .populate(
                    'user',
                    'name phone location profilePhoto'
                )
                .sort({
                    createdAt: -1,
                })
                .skip(skip)
                .limit(pageLimit),

            MarketplaceItem.countDocuments(
                filter
            ),
        ]);

        const totalPages =
            Math.ceil(
                total / pageLimit
            );

        res.status(200).json({
            success: true,
            count: items.length,
            total,
            page: currentPage,
            limit: pageLimit,
            totalPages,
            hasMore:
                currentPage <
                totalPages,
            data: items,
        });
    }
);

/*
|--------------------------------------------------------------------------
| Get Marketplace Item
|--------------------------------------------------------------------------
*/
exports.getMarketplaceItem =
    asyncHandler(
        async (req, res) => {
            const item =
                await MarketplaceItem.findById(
                    req.params.id
                ).populate(
                    'user',
                    'name phone location profilePhoto'
                );

            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            'Marketplace listing not found.',
                    });
            }

            res.status(200).json({
                success: true,
                data: item,
            });
        }
    );

/*
|--------------------------------------------------------------------------
| Update Marketplace Item
|--------------------------------------------------------------------------
*/
exports.updateMarketplaceItem =
    asyncHandler(
        async (req, res) => {
            const item =
                await MarketplaceItem.findById(
                    req.params.id
                );

            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            'Marketplace listing not found.',
                    });
            }

            if (
                item.user.toString() !==
                req.user._id.toString()
            ) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        message:
                            'You can only update your own listing.',
                    });
            }

            Object.assign(
                item,
                req.body
            );

            await item.save();

            const populatedItem =
                await MarketplaceItem.findById(
                    item._id
                ).populate(
                    'user',
                    'name phone location profilePhoto'
                );

            res.status(200).json({
                success: true,
                message:
                    'Marketplace listing updated successfully.',
                data: populatedItem,
            });
        }
    );

/*
|--------------------------------------------------------------------------
| Delete Marketplace Item
|--------------------------------------------------------------------------
*/
exports.deleteMarketplaceItem =
    asyncHandler(
        async (req, res) => {
            const item =
                await MarketplaceItem.findById(
                    req.params.id
                );

            if (!item) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            'Marketplace listing not found.',
                    });
            }

            if (
                item.user.toString() !==
                req.user._id.toString()
            ) {
                return res
                    .status(403)
                    .json({
                        success: false,
                        message:
                            'You can only delete your own listing.',
                    });
            }

            await item.deleteOne();

            res.status(200).json({
                success: true,
                message:
                    'Marketplace listing deleted successfully.',
            });
        }
    );