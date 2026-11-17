const mongoose = require('mongoose');

const AdvertisementSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        advertiserName: {
            type: String,
            required: true,
            trim: true,
            maxlength: 150,
        },
        imageUrl: {
            type: String,
            required: true,
            trim: true,
        },
        imagePublicId: {
            type: String,
            default: null,
            trim: true,
        },
        destinationUrl: {
            type: String,
            required: true,
            trim: true,
        },
        placement: {
            type: String,
            enum: [
                'dashboard',
                'extension-dashboard',
            ],
            required: true,
        },
        targetStates: {
            type: [String],
            default: [],
        },
        startsAt: {
            type: Date,
            required: true,
        },
        endsAt: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ['draft', 'active', 'paused'],
            default: 'draft',
        },
        impressions: {
            type: Number,
            default: 0,
            min: 0,
        },
        clicks: {
            type: Number,
            default: 0,
            min: 0,
        },

        packageName: {
            type: String,
            enum: ['starter', 'growth', 'regional', 'custom'],
            default: 'custom',
        },
        amountPaid: {
            type: Number,
            default: 0,
            min: 0,
        },
        paymentStatus: {
            type: String,
            enum: ['unpaid', 'paid'],
            default: 'unpaid',
        },
        paidAt: {
            type: Date,
            default: null,
        },

        reportTokenHash: {
            type: String,
            default: null,
            select: false,
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

AdvertisementSchema.index({
    status: 1,
    placement: 1,
    startsAt: 1,
    endsAt: 1,
});

AdvertisementSchema.index({
    createdAt: -1,
});

AdvertisementSchema.index(
    { reportTokenHash: 1 },
    {
        unique: true,
        partialFilterExpression: {
            reportTokenHash: { $type: 'string' },
        },
    }
);

AdvertisementSchema.pre('validate', function (next) {
    if (
        this.startsAt &&
        this.endsAt &&
        this.endsAt <= this.startsAt
    ) {
        this.invalidate(
            'endsAt',
            'Advertisement end date must be after its start date.'
        );
    }

    next();
});

module.exports = mongoose.model(
    'Advertisement',
    AdvertisementSchema
);