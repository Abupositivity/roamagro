const MarketplaceItem = require('../models/MarketplaceItem');
const asyncHandler = require('../middleware/asyncHandler');

const sellerFields =
    'name phone location state profilePhoto role bio';

const populateSeller = (query) =>
    query.populate('user', sellerFields);

const isValidCoordinate = (
    value,
    min,
    max
) =>
    Number.isFinite(value) &&
    value >= min &&
    value <= max;

const getDistanceKm = (
    lat1,
    lon1,
    lat2,
    lon2
) => {
    const toRadians = (degrees) =>
        degrees * (Math.PI / 180);

    const earthRadiusKm = 6371;

    const latitudeDifference =
        toRadians(lat2 - lat1);

    const longitudeDifference =
        toRadians(lon2 - lon1);

    const a =
        Math.sin(
            latitudeDifference / 2
        ) ** 2 +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(
                longitudeDifference / 2
            ) ** 2;

    const boundedA = Math.min(
        1,
        Math.max(0, a)
    );

    return (
        2 *
        earthRadiusKm *
        Math.atan2(
            Math.sqrt(boundedA),
            Math.sqrt(1 - boundedA)
        )
    );
};

const hasListingCoordinates = (item) =>
    item.coordinates &&
    isValidCoordinate(
        item.coordinates.latitude,
        -90,
        90
    ) &&
    isValidCoordinate(
        item.coordinates.longitude,
        -180,
        180
    );

exports.createMarketplaceItem =
    asyncHandler(
        async (req, res) => {
            const item =
                await MarketplaceItem.create({
                    ...req.body,
                    user: req.user._id,
                });

            const populatedItem =
                await populateSeller(
                    MarketplaceItem.findById(
                        item._id
                    )
                );

            res.status(201).json({
                success: true,
                message:
                    'Marketplace listing created successfully.',
                data: populatedItem,
            });
        }
    );

exports.getMarketplaceItems =
    asyncHandler(
        async (req, res) => {
            const {
                page = 1,
                limit = 20,
                search = '',
                category = 'All',
                mine = 'false',
                availability = 'All',
                userLatitude,
                userLongitude,
            } = req.query;

            const currentPage = Math.max(
                Number(page) || 1,
                1
            );

            const pageLimit = Math.min(
                Math.max(
                    Number(limit) || 20,
                    1
                ),
                50
            );

            const latitude =
                Number(userLatitude);

            const longitude =
                Number(userLongitude);

            const hasUserLocation =
                userLatitude !==
                    undefined &&
                userLongitude !==
                    undefined &&
                userLatitude !== '' &&
                userLongitude !== '' &&
                isValidCoordinate(
                    latitude,
                    -90,
                    90
                ) &&
                isValidCoordinate(
                    longitude,
                    -180,
                    180
                );

            const filter = {};

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

            if (
                category &&
                category !== 'All'
            ) {
                filter.category =
                    category;
            }

            if (
                availability ===
                'Available'
            ) {
                filter.available = true;
            } else if (
                availability === 'Sold'
            ) {
                filter.available = false;
            }

            if (mine === 'true') {
                filter.user =
                    req.user._id;
            }

            let items;
            let total;

            if (hasUserLocation) {
                const matchingItems =
                    await populateSeller(
                        MarketplaceItem.find(
                            filter
                        )
                    );

                const rankedItems =
                    matchingItems.map(
                        (item) => {
                            const plainItem =
                                item.toObject();

                            if (
                                hasListingCoordinates(
                                    item
                                )
                            ) {
                                plainItem.distanceKm =
                                    getDistanceKm(
                                        latitude,
                                        longitude,
                                        item.coordinates
                                            .latitude,
                                        item.coordinates
                                            .longitude
                                    );
                            } else {
                                plainItem.distanceKm =
                                    null;
                            }

                            return plainItem;
                        }
                    );

                rankedItems.sort(
                    (a, b) => {
                        if (
                            a.distanceKm ===
                                null &&
                            b.distanceKm !==
                                null
                        ) {
                            return 1;
                        }

                        if (
                            a.distanceKm !==
                                null &&
                            b.distanceKm ===
                                null
                        ) {
                            return -1;
                        }

                        if (
                            a.distanceKm !==
                                null &&
                            b.distanceKm !==
                                null &&
                            a.distanceKm !==
                                b.distanceKm
                        ) {
                            return (
                                a.distanceKm -
                                b.distanceKm
                            );
                        }

                        const dateDifference =
                            new Date(
                                b.createdAt
                            ) -
                            new Date(
                                a.createdAt
                            );

                        if (
                            dateDifference !==
                            0
                        ) {
                            return dateDifference;
                        }

                        return String(
                            b._id
                        ).localeCompare(
                            String(a._id)
                        );
                    }
                );

                total =
                    rankedItems.length;

                const skip =
                    (currentPage - 1) *
                    pageLimit;

                items =
                    rankedItems.slice(
                        skip,
                        skip + pageLimit
                    );
            } else {
                const skip =
                    (currentPage - 1) *
                    pageLimit;

                [
                    items,
                    total,
                ] = await Promise.all([
                    populateSeller(
                        MarketplaceItem.find(
                            filter
                        )
                            .sort({
                                createdAt: -1,
                                _id: -1,
                            })
                            .skip(skip)
                            .limit(
                                pageLimit
                            )
                    ),
                    MarketplaceItem.countDocuments(
                        filter
                    ),
                ]);
            }

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
                sortedByDistance:
                    hasUserLocation,
                data: items,
            });
        }
    );

exports.getMarketplaceItem =
    asyncHandler(
        async (req, res) => {
            const item =
                await populateSeller(
                    MarketplaceItem.findById(
                        req.params.id
                    )
                );

            if (!item) {
                return res.status(404).json({
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

exports.updateMarketplaceItem =
    asyncHandler(
        async (req, res) => {
            const item =
                await MarketplaceItem.findById(
                    req.params.id
                );

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Marketplace listing not found.',
                });
            }

            if (
                item.user.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
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
                await populateSeller(
                    MarketplaceItem.findById(
                        item._id
                    )
                );

            res.status(200).json({
                success: true,
                message:
                    'Marketplace listing updated successfully.',
                data: populatedItem,
            });
        }
    );

exports.deleteMarketplaceItem =
    asyncHandler(
        async (req, res) => {
            const item =
                await MarketplaceItem.findById(
                    req.params.id
                );

            if (!item) {
                return res.status(404).json({
                    success: false,
                    message:
                        'Marketplace listing not found.',
                });
            }

            if (
                item.user.toString() !==
                req.user._id.toString()
            ) {
                return res.status(403).json({
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