const crypto = require('crypto');

const Advertisement = require('../models/Advertisement');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middleware/asyncHandler');

const PACKAGES = [
    'starter',
    'growth',
    'regional',
    'custom',
];

const hashToken = (token) =>
    crypto.createHash('sha256')
        .update(token)
        .digest('hex');

const getCampaignStatus = (advertisement) => {
    if (advertisement.status !== 'active') {
        return advertisement.status;
    }

    const now = Date.now();

    if (new Date(advertisement.startsAt).getTime() > now) {
        return 'scheduled';
    }

    if (new Date(advertisement.endsAt).getTime() <= now) {
        return 'expired';
    }

    return 'active';
};

const buildReport = (advertisement) => {
    const impressions = Number(advertisement.impressions || 0);
    const clicks = Number(advertisement.clicks || 0);
    const amountPaid = Number(advertisement.amountPaid || 0);

    return {
        title: advertisement.title,
        description: advertisement.description,
        advertiserName: advertisement.advertiserName,
        imageUrl: advertisement.imageUrl,
        placement: advertisement.placement,
        targetStates: advertisement.targetStates || [],
        startsAt: advertisement.startsAt,
        endsAt: advertisement.endsAt,
        status: getCampaignStatus(advertisement),

        packageName: advertisement.packageName || 'custom',
        amountPaid,
        paymentStatus: advertisement.paymentStatus || 'unpaid',

        impressions,
        clicks,

        ctr: impressions > 0
            ? (clicks / impressions) * 100
            : 0,

        effectiveCpc: clicks > 0 && amountPaid > 0
            ? amountPaid / clicks
            : null,

        updatedAt: advertisement.updatedAt,
        generatedAt: new Date(),

        metricDefinitions: {
            impressions:
                'An impression is recorded when an eligible advertisement is at least 50% visible, subject to a one-hour per-user deduplication window.',

            clicks:
                'A click is a recorded interaction with the advertisement, subject to a separate one-hour per-user deduplication window.',

            ctr:
                'Click-through rate (CTR) is recorded clicks divided by recorded impressions, multiplied by 100.',

            effectiveCpc:
                'Effective cost per click is the campaign amount divided by recorded clicks. It is a reporting estimate, not the billing method.',

            limitations:
                'Metrics are approximate. Deduplication currently uses server memory and may reset after a server restart. Clicks do not represent confirmed purchases or sales.',
        },
    };
};

exports.updateCampaignBilling = asyncHandler(
    async (req, res) => {
        const {
            packageName,
            amountPaid,
            paymentStatus,
        } = req.body || {};

        if (
            !PACKAGES.includes(packageName) ||
            typeof amountPaid !== 'number' ||
            !Number.isFinite(amountPaid) ||
            amountPaid < 0 ||
            amountPaid > 100000000 ||
            !['unpaid', 'paid'].includes(paymentStatus)
        ) {
            throw new AppError(
                'Invalid advertisement billing information.',
                400
            );
        }

        const advertisement = await Advertisement.findById(
            req.params.id
        );

        if (!advertisement) {
            throw new AppError(
                'Advertisement not found.',
                404
            );
        }

        advertisement.packageName = packageName;
        advertisement.amountPaid = amountPaid;
        advertisement.paymentStatus = paymentStatus;

        if (paymentStatus === 'paid') {
            advertisement.paidAt =
                advertisement.paidAt || new Date();
        } else {
            advertisement.paidAt = null;
        }

        await advertisement.save();

        return res.status(200).json({
            success: true,
            data: {
                _id: advertisement._id,
                packageName: advertisement.packageName,
                amountPaid: advertisement.amountPaid,
                paymentStatus: advertisement.paymentStatus,
                paidAt: advertisement.paidAt,
            },
        });
    }
);

exports.generateReportLink = asyncHandler(
    async (req, res) => {
        const advertisement = await Advertisement.findById(
            req.params.id
        ).select('+reportTokenHash');

        if (!advertisement) {
            throw new AppError(
                'Advertisement not found.',
                404
            );
        }

        const token = crypto.randomBytes(32)
            .toString('hex');

        advertisement.reportTokenHash = hashToken(token);

        await advertisement.save();

        // The raw token is returned only once.
        // Generating a new link revokes the old link.
        return res.status(200).json({
            success: true,
            token,
        });
    }
);

exports.revokeReportLink = asyncHandler(
    async (req, res) => {
        const advertisement = await Advertisement.findById(
            req.params.id
        ).select('+reportTokenHash');

        if (!advertisement) {
            throw new AppError(
                'Advertisement not found.',
                404
            );
        }

        advertisement.reportTokenHash = null;

        await advertisement.save();

        return res.status(200).json({
            success: true,
            message: 'Report link revoked successfully.',
        });
    }
);

exports.getAdvertiserReport = asyncHandler(
    async (req, res) => {
        // The response must not be cached or indexed.
        res.set('Cache-Control', 'no-store, private');
        res.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
        res.set('Referrer-Policy', 'no-referrer');

        const { token } = req.params;

        if (!/^[a-f0-9]{64}$/.test(token)) {
            throw new AppError(
                'Report not found or link invalid.',
                404
            );
        }

        const advertisement = await Advertisement.findOne({
            reportTokenHash: hashToken(token),
        }).lean();

        if (!advertisement) {
            throw new AppError(
                'Report not found or link invalid.',
                404
            );
        }

        return res.status(200).json({
            success: true,
            data: buildReport(advertisement),
        });
    }
);