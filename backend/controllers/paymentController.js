const crypto = require('crypto');

const User = require('../models/User');
const Payment = require('../models/Payment');

const asyncHandler = require('../middleware/asyncHandler');
const AppError = require('../utils/AppError');

const {
    BILLING_CYCLES,
    PREMIUM_PRICES,
} = require('../services/entitlementService');

const {
    initializeTransaction,
    verifyWebhookSignature,
} = require('../services/paystackService');

const {
    processPayment,
} = require('../services/paymentActivationService');

const getCallbackUrl = () => {
    const frontendUrl = (
        process.env.FRONTEND_URL ||
        'http://localhost:3000'
    )
        .split(',')[0]
        .trim()
        .replace(/\/+$/, '');

    const parsed = new URL(frontendUrl);

    if (
        !['http:', 'https:'].includes(parsed.protocol) ||
        (
            process.env.NODE_ENV === 'production' &&
            parsed.protocol !== 'https:'
        )
    ) {
        throw new AppError(
            'Invalid frontend payment callback URL.',
            500
        );
    }

    return `${parsed.origin}/payment-result`;
};

exports.initializePayment = asyncHandler(
    async (req, res) => {
        const { billingCycle } = req.body || {};

        if (
            !Object.values(BILLING_CYCLES)
                .includes(billingCycle)
        ) {
            throw new AppError(
                'Select a valid Premium billing cycle.',
                400
            );
        }

        const user = await User.findById(req.user._id)
            .select('email accountStatus');

        if (!user || user.accountStatus !== 'active') {
            throw new AppError(
                'User account is not active.',
                403
            );
        }

        const amount = PREMIUM_PRICES[billingCycle];

        const reference = `roamagro_${crypto
            .randomBytes(18)
            .toString('hex')}`;

        const payment = await Payment.create({
            user: user._id,
            reference,
            billingCycle,
            amount,
            currency: 'NGN',
            status: 'pending',
        });

        try {
            const checkout = await initializeTransaction({
                email: user.email,
                amount: amount * 100,
                reference,
                callbackUrl: getCallbackUrl(),
            });

            if (
                !checkout ||
                checkout.reference !== reference ||
                typeof checkout.authorization_url !== 'string'
            ) {
                throw new AppError(
                    'Invalid payment checkout response.',
                    502
                );
            }

            const checkoutUrl = new URL(
                checkout.authorization_url
            );

            if (
                checkoutUrl.protocol !== 'https:' ||
                !(
                    checkoutUrl.hostname === 'paystack.com' ||
                    checkoutUrl.hostname.endsWith('.paystack.com')
                )
            ) {
                throw new AppError(
                    'Invalid payment checkout destination.',
                    502
                );
            }

            return res.status(201).json({
                success: true,
                data: {
                    reference,
                    authorizationUrl: checkout.authorization_url,
                    amount,
                    currency: 'NGN',
                    billingCycle,
                },
            });
        } catch (error) {
            // Keep the pending record for reconciliation.
            // A provider timeout does not prove that
            // initialization failed.
            throw error;
        }
    }
);

exports.verifyPayment = asyncHandler(
    async (req, res) => {
        const { reference } = req.body || {};

        if (
            typeof reference !== 'string' ||
            !/^roamagro_[a-f0-9]{36}$/.test(reference)
        ) {
            throw new AppError(
                'Invalid payment reference.',
                400
            );
        }

        const payment = await Payment.findOne({
            reference,
            user: req.user._id,
        });

        if (!payment) {
            throw new AppError('Payment not found.', 404);
        }

        const result = await processPayment(reference);

        res.status(200).json({
            success: true,
            data: {
                reference,
                status: result.status,
                alreadyProcessed: result.alreadyProcessed,
                subscriptionExpiresAt:
                    result.payment.subscriptionExpiresAt,
            },
        });
    }
);

exports.getPaymentHistory = asyncHandler(
    async (req, res) => {
        const payments = await Payment.find({
            user: req.user._id,
        })
            .sort({ createdAt: -1 })
            .limit(50)
            .select(
                'reference plan billingCycle amount currency ' +
                'status paidAt subscriptionStartsAt ' +
                'subscriptionExpiresAt createdAt'
            )
            .lean();

        res.status(200).json({
            success: true,
            data: payments,
        });
    }
);

exports.handlePaystackWebhook = async (req, res) => {
    try {
        const signature =
            req.headers['x-paystack-signature'];

        if (!verifyWebhookSignature(
            req.body,
            signature
        )) {
            return res.status(401).json({
                success: false,
                message: 'Invalid webhook signature.',
            });
        }

        let event;

        try {
            event = JSON.parse(req.body.toString('utf8'));
        } catch {
            return res.status(400).json({
                success: false,
                message: 'Invalid webhook payload.',
            });
        }

        if (event.event !== 'charge.success') {
            return res.sendStatus(200);
        }

        const reference = event.data?.reference;

        if (
            typeof reference !== 'string' ||
            !/^roamagro_[a-f0-9]{36}$/.test(reference)
        ) {
            // Not a RoamAgro Premium transaction.
            return res.sendStatus(200);
        }

        const payment = await Payment.exists({ reference });

        if (!payment) {
            // Do not activate unknown transactions.
            return res.sendStatus(200);
        }

        await processPayment(reference);

        return res.sendStatus(200);
    } catch (error) {
        console.error(
            'Paystack webhook processing failed:',
            error.message
        );

        // A non-2xx response allows provider retries.
        return res.sendStatus(500);
    }
};