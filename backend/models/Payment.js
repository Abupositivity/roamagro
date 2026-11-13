const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },

        reference: {
            type: String,
            required: true,
            unique: true,
            immutable: true,
        },

        provider: {
            type: String,
            enum: ['paystack'],
            default: 'paystack',
            immutable: true,
        },

        plan: {
            type: String,
            enum: ['premium'],
            default: 'premium',
            required: true,
            immutable: true,
        },

        billingCycle: {
            type: String,
            enum: ['monthly', 'annual'],
            required: true,
            immutable: true,
        },

        amount: {
            type: Number,
            required: true,
            min: 1,
            immutable: true,
        },

        currency: {
            type: String,
            enum: ['NGN'],
            default: 'NGN',
            immutable: true,
        },

        status: {
            type: String,
            enum: [
                'pending',
                'success',
                'failed',
                'abandoned',
            ],
            default: 'pending',
            index: true,
        },

        providerTransactionId: {
            type: String,
            default: null,
        },

        paidAt: {
            type: Date,
            default: null,
        },

        subscriptionStartsAt: {
            type: Date,
            default: null,
        },

        subscriptionExpiresAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

PaymentSchema.index({
    user: 1,
    createdAt: -1,
});

PaymentSchema.index(
    {
        provider: 1,
        providerTransactionId: 1,
    },
    {
        unique: true,
        partialFilterExpression: {
            providerTransactionId: {
                $type: 'string',
            },
        },
    }
);

module.exports = mongoose.model(
    'Payment',
    PaymentSchema
);