const Advertisement = require('../models/Advertisement');
const AgriTip = require('../models/AgriTip');
const CommunityPost = require('../models/CommunityPost');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const {
    uploadImage,
    deleteImage,
} = require('../utils/cloudinaryStorage');

const {
    getEntitlements,
} = require('../services/entitlementService');

const {
    ALLOWED_PLACEMENTS,
} = require('../validators/advertisementValidator');

const EDITABLE_FIELDS = [
    'title',
    'description',
    'advertiserName',
    'destinationUrl',
    'placement',
    'targetStates',
    'startsAt',
    'endsAt',
    'status',
];

const PUBLIC_FIELDS = [
    '_id',
    'title',
    'description',
    'advertiserName',
    'imageUrl',
    'destinationUrl',
    'placement',
];

const IMAGE_FOLDER = 'roamagro/advertisements';
const MAX_CAMPAIGNS = 100;
const TRACKING_WINDOW_MS = 60 * 60 * 1000;
const MAX_TRACKING_ENTRIES = 10000;

// Lightweight, process-local deduplication.
// Suitable for initial testing; not authoritative analytics.
const trackingCache = new Map();

const cleanTrackingCache = () => {
    const now = Date.now();

    for (const [key, expiry] of trackingCache) {
        if (expiry <= now) {
            trackingCache.delete(key);
        }
    }

    if (trackingCache.size > MAX_TRACKING_ENTRIES) {
        trackingCache.clear();
    }
};

const isSafeUrl = (value, image = false) => {
    try {
        const url = new URL(value);

        if (
            url.protocol !== 'https:' ||
            !url.hostname ||
            url.username ||
            url.password
        ) {
            return false;
        }

        if (image) {
            return url.hostname === 'res.cloudinary.com';
        }

        const host = url.hostname.toLowerCase();

        if (
            host === 'localhost' ||
            host.endsWith('.localhost') ||
            host.endsWith('.local') ||
            host.endsWith('.internal') ||
            host === '127.0.0.1' ||
            host === '0.0.0.0' ||
            host === '[::1]' ||
            host.includes(':')
        ) {
            return false;
        }

        if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) {
            return false;
        }

        return true;
    } catch {
        return false;
    }
};

const normalizeStates = (states = []) => {
    return [
        ...new Set(
            states
                .map((state) => state.trim().toLowerCase())
                .filter(Boolean)
        ),
    ];
};

const validateCampaign = (campaign) => {
    const startsAt = new Date(campaign.startsAt);
    const endsAt = new Date(campaign.endsAt);

    if (
        !Number.isFinite(startsAt.getTime()) ||
        !Number.isFinite(endsAt.getTime()) ||
        endsAt <= startsAt
    ) {
        throw new AppError(
            'Advertisement end date must be after its start date.',
            400
        );
    }

    if (!isSafeUrl(campaign.imageUrl, true)) {
        throw new AppError(
            'Advertisement image must use HTTPS Cloudinary storage.',
            400
        );
    }

    if (!isSafeUrl(campaign.destinationUrl)) {
        throw new AppError(
            'Advertisement destination must be a valid public HTTPS URL.',
            400
        );
    }

    if (
        !Array.isArray(campaign.targetStates) ||
        campaign.targetStates.length > 37
    ) {
        throw new AppError(
            'Invalid advertisement state targeting.',
            400
        );
    }
};

const pickEditableFields = (body = {}) => {
    const updates = {};

    for (const field of EDITABLE_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, field)) {
            updates[field] = body[field];
        }
    }

    if (updates.targetStates !== undefined) {
        updates.targetStates = normalizeStates(
            updates.targetStates
        );
    }

    return updates;
};

const rejectImageUrlChanges = (body, existingUrl = null) => {
    if (!Object.prototype.hasOwnProperty.call(body, 'imageUrl')) {
        return;
    }

    if (!existingUrl || body.imageUrl !== existingUrl) {
        throw new AppError(
            'Please upload an image file instead of providing an image URL.',
            400
        );
    }
};

const cleanupUploadedImage = async (publicId) => {
    if (!publicId) return;

    try {
        await deleteImage(publicId);
    } catch (error) {
        console.error(
            'Cloudinary upload rollback failed:',
            error.message
        );
    }
};

const deleteImageIfUnused = async (publicId) => {
    if (!publicId) return;

    try {
        const [
            advertisementReference,
            tipReference,
            communityReference,
        ] = await Promise.all([
            Advertisement.exists({ imagePublicId: publicId }),
            AgriTip.exists({ imagePublicId: publicId }),
            CommunityPost.exists({ imagePublicId: publicId }),
        ]);

        if (
            !advertisementReference &&
            !tipReference &&
            !communityReference
        ) {
            await deleteImage(publicId);
        }
    } catch (error) {
        console.error(
            'Advertisement image cleanup failed:',
            error.message
        );
    }
};

const getEligibilityQuery = (placement, user) => {
    const now = new Date();

    const userState = typeof user.state === 'string'
        ? user.state.trim().toLowerCase()
        : '';

    return {
        status: 'active',
        placement,
        startsAt: { $lte: now },
        endsAt: { $gt: now },
        $or: [
            { targetStates: { $size: 0 } },
            ...(userState
                ? [{ targetStates: userState }]
                : []),
        ],
    };
};

const canViewAds = (user) => {
    return getEntitlements(user).features.adsEnabled === true;
};

const getEligibleAdvertisement = async (id, user) => {
    const advertisement = await Advertisement.findOne({
        _id: id,
        status: 'active',
        startsAt: { $lte: new Date() },
        endsAt: { $gt: new Date() },
    });

    if (!advertisement) {
        return null;
    }

    const query = getEligibilityQuery(
        advertisement.placement,
        user
    );

    const matches = await Advertisement.exists({
        _id: advertisement._id,
        ...query,
    });

    return matches ? advertisement : null;
};

exports.createAdvertisement = asyncHandler(
    async (req, res) => {
        const data = pickEditableFields(req.body);

        rejectImageUrlChanges(req.body);

        if (!req.file) {
            throw new AppError(
                'Please select an advertisement image.',
                400
            );
        }

        // Validate all non-image campaign fields before uploading.
        validateCampaign({
            ...data,
            imageUrl: 'https://res.cloudinary.com/placeholder/image/upload/placeholder.jpg',
            targetStates: data.targetStates || [],
        });

        const uploadedImage = await uploadImage(
            req.file,
            IMAGE_FOLDER
        );

        data.imageUrl = uploadedImage.url;
        data.imagePublicId = uploadedImage.publicId;

        let advertisement;

        try {
            validateCampaign({
                ...data,
                targetStates: data.targetStates || [],
            });

            advertisement = await Advertisement.create({
                ...data,
                createdBy: req.user._id,
            });
        } catch (error) {
            await cleanupUploadedImage(uploadedImage.publicId);
            throw error;
        }

        return res.status(201).json({
            success: true,
            data: advertisement,
        });
    }
);

exports.getAdminAdvertisements = asyncHandler(
    async (req, res) => {
        const advertisements = await Advertisement.find()
            .select('+reportTokenHash')
            .sort({ createdAt: -1 })
            .limit(MAX_CAMPAIGNS)
            .lean();

        const data = advertisements.map((advertisement) => {
            const {
                reportTokenHash,
                ...publicAdvertisement
            } = advertisement;

            return {
                ...publicAdvertisement,
                hasReportLink: Boolean(reportTokenHash),
            };
        });

        return res.status(200).json({
            success: true,
            data,
        });
    }
);

exports.getAdminAdvertisement = asyncHandler(
    async (req, res) => {
        const advertisement = await Advertisement.findById(
            req.params.id
        )
            .select('+reportTokenHash')
            .lean();

        if (!advertisement) {
            throw new AppError(
                'Advertisement not found.',
                404
            );
        }

        const {
            reportTokenHash,
            ...publicAdvertisement
        } = advertisement;

        return res.status(200).json({
            success: true,
            data: {
                ...publicAdvertisement,
                hasReportLink: Boolean(reportTokenHash),
            },
        });
    }
);

exports.updateAdvertisement = asyncHandler(
    async (req, res) => {
        const advertisement = await Advertisement.findById(
            req.params.id
        );

        if (!advertisement) {
            throw new AppError(
                'Advertisement not found.',
                404
            );
        }

        rejectImageUrlChanges(
            req.body,
            advertisement.imageUrl
        );

        const updates = pickEditableFields(req.body);
        const oldImagePublicId = advertisement.imagePublicId;

        // Validate proposed changes before uploading.
        validateCampaign({
            ...advertisement.toObject(),
            ...updates,
        });

        let newImagePublicId = '';

        if (req.file) {
            const uploadedImage = await uploadImage(
                req.file,
                IMAGE_FOLDER
            );

            updates.imageUrl = uploadedImage.url;
            updates.imagePublicId = uploadedImage.publicId;
            newImagePublicId = uploadedImage.publicId;
        }

        Object.assign(advertisement, updates);

        try {
            validateCampaign(advertisement);
            await advertisement.save();
        } catch (error) {
            await cleanupUploadedImage(newImagePublicId);
            throw error;
        }

        if (
            oldImagePublicId &&
            oldImagePublicId !== advertisement.imagePublicId
        ) {
            await deleteImageIfUnused(oldImagePublicId);
        }

        return res.status(200).json({
            success: true,
            data: advertisement,
        });
    }
);

exports.deleteAdvertisement = asyncHandler(
    async (req, res) => {
        const advertisement = await Advertisement.findByIdAndDelete(
            req.params.id
        );

        if (!advertisement) {
            throw new AppError(
                'Advertisement not found.',
                404
            );
        }

        await deleteImageIfUnused(
            advertisement.imagePublicId
        );

        return res.status(200).json({
            success: true,
            message: 'Advertisement deleted successfully.',
        });
    }
);

exports.getPlacementAdvertisement = asyncHandler(
    async (req, res) => {
        const { placement } = req.params;

        if (!ALLOWED_PLACEMENTS.includes(placement)) {
            throw new AppError(
                'Invalid advertisement placement.',
                400
            );
        }

        if (!canViewAds(req.user)) {
            return res.status(200).json({
                success: true,
                data: null,
            });
        }

        const query = getEligibilityQuery(
            placement,
            req.user
        );

        const advertisements = await Advertisement.aggregate([
            { $match: query },
            { $sample: { size: 1 } },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    advertiserName: 1,
                    imageUrl: 1,
                    destinationUrl: 1,
                    placement: 1,
                },
            },
        ]);

        return res.status(200).json({
            success: true,
            data: advertisements[0] || null,
        });
    }
);

const recordEngagement = (field) => asyncHandler(
    async (req, res) => {
        if (!canViewAds(req.user)) {
            throw new AppError(
                'Advertisement tracking is not available.',
                403
            );
        }

        const advertisement = await getEligibleAdvertisement(
            req.params.id,
            req.user
        );

        if (!advertisement) {
            throw new AppError(
                'Advertisement not found or inactive.',
                404
            );
        }

        cleanTrackingCache();

        const key = [
            req.user._id.toString(),
            advertisement._id.toString(),
            field,
        ].join(':');

        const now = Date.now();

        if ((trackingCache.get(key) || 0) > now) {
            return res.status(200).json({
                success: true,
                counted: false,
            });
        }

        const updated = await Advertisement.updateOne(
            {
                _id: advertisement._id,
                status: 'active',
                startsAt: { $lte: new Date() },
                endsAt: { $gt: new Date() },
            },
            { $inc: { [field]: 1 } }
        );

        if (updated.modifiedCount !== 1) {
            throw new AppError(
                'Advertisement is no longer active.',
                409
            );
        }

        trackingCache.set(
            key,
            now + TRACKING_WINDOW_MS
        );

        return res.status(200).json({
            success: true,
            counted: true,
        });
    }
);

exports.recordImpression = recordEngagement('impressions');
exports.recordClick = recordEngagement('clicks');