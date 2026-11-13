const MarketplaceItem = require('../models/MarketplaceItem');
const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const {
    uploadImage,
    deleteImage,
} = require('../utils/cloudinaryStorage');

const {
    RESOURCES,
    getQuotaStatus,
    createWithinQuota,
    deleteWithinQuota,
} = require('../services/quotaService');

const sellerFields =
    'name phone location state profilePhoto role bio';

const populateSeller = (query) =>
    query.populate('user', sellerFields);

const MAX_LISTING_IMAGES = 3;

const isValidCoordinate = (value, min, max) =>
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
        Math.sin(latitudeDifference / 2) ** 2 +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(longitudeDifference / 2) ** 2;

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

const parseImages = (value) => {
    if (value === undefined) {
        return undefined;
    }

    let images = value;

    if (typeof images === 'string') {
        if (!images.trim()) {
            return [];
        }

        try {
            images = JSON.parse(images);
        } catch (error) {
            throw new AppError(
                'Listing images contain invalid data.',
                400
            );
        }
    }

    if (
        !Array.isArray(images) ||
        images.length > MAX_LISTING_IMAGES ||
        !images.every(
            (image) =>
                typeof image === 'string' &&
                image.trim().length > 0
        )
    ) {
        throw new AppError(
            'A listing can contain up to 3 valid images.',
            400
        );
    }

    if (new Set(images).size !== images.length) {
        throw new AppError(
            'Duplicate listing images are not allowed.',
            400
        );
    }

    return images;
};

const parseCoordinates = (value) => {
    if (value === undefined) {
        return undefined;
    }

    if (value === null || value === '') {
        return null;
    }

    let coordinates = value;

    if (typeof coordinates === 'string') {
        try {
            coordinates = JSON.parse(coordinates);
        } catch (error) {
            throw new AppError(
                'Listing coordinates contain invalid data.',
                400
            );
        }
    }

    if (coordinates === null) {
        return null;
    }

    if (
        !coordinates ||
        typeof coordinates !== 'object' ||
        Array.isArray(coordinates)
    ) {
        throw new AppError(
            'Listing coordinates are invalid.',
            400
        );
    }

    const latitude = Number(coordinates.latitude);
    const longitude = Number(coordinates.longitude);

    if (
        coordinates.latitude === undefined ||
        coordinates.latitude === null ||
        coordinates.latitude === '' ||
        coordinates.longitude === undefined ||
        coordinates.longitude === null ||
        coordinates.longitude === '' ||
        !isValidCoordinate(latitude, -90, 90) ||
        !isValidCoordinate(longitude, -180, 180)
    ) {
        throw new AppError(
            'Listing coordinates are invalid.',
            400
        );
    }

    return {
        latitude,
        longitude,
    };
};

const uploadListingImages = async (files = []) => {
    const uploadedImages = [];

    try {
        for (const file of files) {
            const uploaded = await uploadImage(
                file,
                'roamagro/marketplace'
            );

            uploadedImages.push(uploaded);
        }

        return uploadedImages;
    } catch (error) {
        await Promise.allSettled(
            uploadedImages.map(
                (image) => deleteImage(image.publicId)
            )
        );

        throw error;
    }
};

const deleteUnusedImages = async (publicIds = []) => {
    const uniqueIds = [
        ...new Set(publicIds.filter(Boolean)),
    ];

    await Promise.allSettled(
        uniqueIds.map(
            (publicId) => deleteImage(publicId)
        )
    );
};

const getRetainedImages = (
    requestedImages,
    currentImages
) => {
    if (requestedImages === undefined) {
        return [...currentImages];
    }

    const existingImageSet = new Set(currentImages);

    if (
        !requestedImages.every(
            (image) => existingImageSet.has(image)
        )
    ) {
        throw new AppError(
            'One or more retained images do not belong to this listing.',
            400
        );
    }

    return requestedImages;
};

const getRetainedPublicIds = (
    retainedImages,
    currentImages,
    currentPublicIds
) =>
    retainedImages.map((image) => {
        const index = currentImages.indexOf(image);

        return currentPublicIds[index] || '';
    });

const getRemovedPublicIds = (
    retainedImages,
    currentImages,
    currentPublicIds
) => {
    const retainedSet = new Set(retainedImages);

    return currentImages.reduce(
        (removed, image, index) => {
            if (
                !retainedSet.has(image) &&
                currentPublicIds[index]
            ) {
                removed.push(currentPublicIds[index]);
            }

            return removed;
        },
        []
    );
};

const getListingData = (body) => {
    const allowedFields = [
        'title',
        'description',
        'category',
        'price',
        'quantity',
        'unit',
        'location',
        'available',
    ];

    const data = {};

    allowedFields.forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    if (body.coordinates !== undefined) {
        data.coordinates = parseCoordinates(
            body.coordinates
        );
    }

    return data;
};

/**
 * Create Marketplace Listing
 */
exports.createMarketplaceItem = asyncHandler(
    async (req, res) => {
        const images = parseImages(req.body.images) || [];
        const uploadedFiles = req.files || [];

        if (
            images.length + uploadedFiles.length >
            MAX_LISTING_IMAGES
        ) {
            throw new AppError(
                'A marketplace listing can have a maximum of 3 images.',
                400
            );
        }

        const listingData = getListingData(req.body);

        const quota = await getQuotaStatus(
            req.user._id,
            RESOURCES.MARKETPLACE_LISTINGS
        );

        if (!quota.canCreate) {
            throw new AppError(
                'Free plan allows a maximum of 3 marketplace listings. Delete an existing listing or upgrade to Premium.',
                403
            );
        }

        const uploadedImages = await uploadListingImages(
            uploadedFiles
        );

        const finalImages = [
            ...images,
            ...uploadedImages.map(
                (image) => image.url
            ),
        ];

        const imagePublicIds = [
            ...images.map(() => ''),
            ...uploadedImages.map(
                (image) => image.publicId
            ),
        ];

        let item;

        try {
            item = await createWithinQuota({
                userId: req.user._id,
                resource: RESOURCES.MARKETPLACE_LISTINGS,
                data: {
                    ...listingData,
                    images: finalImages,
                    imagePublicIds,
                },
            });
        } catch (error) {
            /**
             * If database creation fails, remove
             * images uploaded for this request.
             */
            await deleteUnusedImages(
                uploadedImages.map(
                    (image) => image.publicId
                )
            );

            throw error;
        }

        const populatedItem = await populateSeller(
            MarketplaceItem.findById(item._id)
        );

        return res.status(201).json({
            success: true,
            message:
                'Marketplace listing created successfully.',
            data: populatedItem,
        });
    }
);

/**
 * Get Marketplace Listings
 */
exports.getMarketplaceItems = asyncHandler(
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
            Math.max(Number(limit) || 20, 1),
            50
        );

        const latitude = Number(userLatitude);
        const longitude = Number(userLongitude);

        const hasUserLocation =
            userLatitude !== undefined &&
            userLongitude !== undefined &&
            userLatitude !== '' &&
            userLongitude !== '' &&
            isValidCoordinate(latitude, -90, 90) &&
            isValidCoordinate(longitude, -180, 180);

        const filter = {};

        if (search.trim()) {
            const keyword = search.trim();

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

        if (category && category !== 'All') {
            filter.category = category;
        }

        if (availability === 'Available') {
            filter.available = true;
        } else if (availability === 'Sold') {
            filter.available = false;
        }

        if (mine === 'true') {
            if (!req.user?._id) {
                throw new AppError(
                    'Please log in to view your listings.',
                    401
                );
            }

            filter.user = req.user._id;
        }

        let items;
        let total;

        if (hasUserLocation) {
            const matchingItems = await populateSeller(
                MarketplaceItem.find(filter)
            );

            const rankedItems = matchingItems.map(
                (item) => {
                    const plainItem = item.toObject();

                    if (hasListingCoordinates(item)) {
                        plainItem.distanceKm = getDistanceKm(
                            latitude,
                            longitude,
                            item.coordinates.latitude,
                            item.coordinates.longitude
                        );
                    } else {
                        plainItem.distanceKm = null;
                    }

                    return plainItem;
                }
            );

            rankedItems.sort((a, b) => {
                if (
                    a.distanceKm === null &&
                    b.distanceKm !== null
                ) {
                    return 1;
                }

                if (
                    a.distanceKm !== null &&
                    b.distanceKm === null
                ) {
                    return -1;
                }

                if (
                    a.distanceKm !== null &&
                    b.distanceKm !== null &&
                    a.distanceKm !== b.distanceKm
                ) {
                    return a.distanceKm - b.distanceKm;
                }

                const dateDifference =
                    new Date(b.createdAt) -
                    new Date(a.createdAt);

                if (dateDifference !== 0) {
                    return dateDifference;
                }

                return String(b._id).localeCompare(
                    String(a._id)
                );
            });

            total = rankedItems.length;

            const skip =
                (currentPage - 1) * pageLimit;

            items = rankedItems.slice(
                skip,
                skip + pageLimit
            );
        } else {
            const skip =
                (currentPage - 1) * pageLimit;

            [items, total] = await Promise.all([
                populateSeller(
                    MarketplaceItem.find(filter)
                        .sort({
                            createdAt: -1,
                            _id: -1,
                        })
                        .skip(skip)
                        .limit(pageLimit)
                ),
                MarketplaceItem.countDocuments(filter),
            ]);
        }

        const totalPages = Math.ceil(
            total / pageLimit
        );

        return res.status(200).json({
            success: true,
            count: items.length,
            total,
            page: currentPage,
            limit: pageLimit,
            totalPages,
            hasMore: currentPage < totalPages,
            sortedByDistance: hasUserLocation,
            data: items,
        });
    }
);

/**
 * Get Single Marketplace Listing
 */
exports.getMarketplaceItem = asyncHandler(
    async (req, res) => {
        const item = await populateSeller(
            MarketplaceItem.findById(req.params.id)
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message:
                    'Marketplace listing not found.',
            });
        }

        return res.status(200).json({
            success: true,
            data: item,
        });
    }
);

/**
 * Update Marketplace Listing
 */
exports.updateMarketplaceItem = asyncHandler(
    async (req, res) => {
        const item = await MarketplaceItem.findById(
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

        const currentImages = Array.isArray(item.images)
            ? [...item.images]
            : [];

        const currentPublicIds = Array.isArray(
            item.imagePublicIds
        )
            ? [...item.imagePublicIds]
            : [];

        const requestedImages =
            req.body.existingImages !== undefined
                ? parseImages(req.body.existingImages)
                : parseImages(req.body.images);

        const retainedImages = getRetainedImages(
            requestedImages,
            currentImages
        );

        const uploadedFiles = req.files || [];

        if (
            retainedImages.length +
                uploadedFiles.length >
            MAX_LISTING_IMAGES
        ) {
            throw new AppError(
                'A marketplace listing can have a maximum of 3 images.',
                400
            );
        }

        const listingData = getListingData(req.body);

        const retainedPublicIds = getRetainedPublicIds(
            retainedImages,
            currentImages,
            currentPublicIds
        );

        const removedPublicIds = getRemovedPublicIds(
            retainedImages,
            currentImages,
            currentPublicIds
        );

        const uploadedImages = await uploadListingImages(
            uploadedFiles
        );

        const finalImages = [
            ...retainedImages,
            ...uploadedImages.map(
                (image) => image.url
            ),
        ];

        const finalPublicIds = [
            ...retainedPublicIds,
            ...uploadedImages.map(
                (image) => image.publicId
            ),
        ];

        try {
            Object.assign(item, listingData);

            item.images = finalImages;
            item.imagePublicIds = finalPublicIds;

            await item.save();
        } catch (error) {
            await deleteUnusedImages(
                uploadedImages.map(
                    (image) => image.publicId
                )
            );

            throw error;
        }

        await deleteUnusedImages(removedPublicIds);

        const populatedItem = await populateSeller(
            MarketplaceItem.findById(item._id)
        );

        return res.status(200).json({
            success: true,
            message:
                'Marketplace listing updated successfully.',
            data: populatedItem,
        });
    }
);

/**
 * Delete Marketplace Listing
 */
exports.deleteMarketplaceItem = asyncHandler(
    async (req, res) => {
        const deletedItem = await deleteWithinQuota({
            userId: req.user._id,
            resource: RESOURCES.MARKETPLACE_LISTINGS,
            resourceId: req.params.id,
        });

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message:
                    'Marketplace listing not found.',
            });
        }

        const publicIds =
            deletedItem.imagePublicIds || [];

        await deleteUnusedImages(publicIds);

        return res.status(200).json({
            success: true,
            message:
                'Marketplace listing deleted successfully.',
        });
    }
);