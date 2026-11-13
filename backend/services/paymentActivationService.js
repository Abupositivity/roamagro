const mongoose = require('mongoose');

const User = require('../models/User');
const Payment = require('../models/Payment');
const AppError = require('../utils/AppError');

const {
    BILLING_CYCLES,
} = require('./entitlementService');

const {
    verifyTransaction,
} = require('./paystackService');

const addBillingPeriod = (date, billingCycle) => {
    const result = new Date(date);

    const months = billingCycle === BILLING_CYCLES.MONTHLY
        ? 1
        : billingCycle === BILLING_CYCLES.ANNUAL
            ? 12
            : 0;

    if (!months) {
        throw new AppError('Invalid billing cycle.', 400);
    }

    const originalDay = result.getUTCDate();

    result.setUTCDate(1);
    result.setUTCMonth(result.getUTCMonth() + months);

    const lastDay = new Date(Date.UTC(
        result.getUTCFullYear(),
        result.getUTCMonth() + 1,
        0
    )).getUTCDate();

    result.setUTCDate(Math.min(originalDay, lastDay));

    return result;
};

const validateTransaction = (payment, transaction, email) => {
    const transactionId = transaction?.id;

    if (
        transaction?.reference !== payment.reference ||
        transaction?.currency !== payment.currency ||
        transaction?.amount !== payment.amount * 100 ||
        transaction?.customer?.email?.toLowerCase() !==
            email.toLowerCase() ||
        !(
            (typeof transactionId === 'number' &&
                Number.isSafeInteger(transactionId)) ||
            (typeof transactionId === 'string' &&
                /^\d+$/.test(transactionId))
        )
    ) {
        throw new AppError(
            'Payment verification details do not match.',
            409
        );
    }

    return String(transactionId);
};

const activateVerifiedPayment = async (
    reference,
    transaction
) => {
    let result;

    await mongoose.connection.transaction(async (session) => {
        const payment = await Payment.findOne({
            reference,
        }).session(session);

        if (!payment) {
            throw new AppError('Payment not found.', 404);
        }

        if (payment.status === 'success') {
            result = {
                status: 'success',
                alreadyProcessed: true,
                payment,
            };
            return;
        }

        const user = await User.findById(payment.user)
            .session(session);

        if (!user) {
            throw new AppError('User account not found.', 404);
        }

        if (user.accountStatus !== 'active') {
            throw new AppError(
                'User account is not active.',
                403
            );
        }

        const transactionId = validateTransaction(
            payment,
            transaction,
            user.email
        );

        if (transaction.status !== 'success') {
            const terminalStatuses = [
                'failed',
                'abandoned',
            ];

            if (terminalStatuses.includes(transaction.status)) {
                payment.status = transaction.status;
                await payment.save({ session });
            }

            result = {
                status: transaction.status,
                alreadyProcessed: false,
                payment,
            };
            return;
        }

        const now = new Date();

        const existingExpiry = user.subscription?.expiresAt
            ? new Date(user.subscription.expiresAt)
            : null;

        const activeExpiry = (
            user.subscription?.plan === 'premium' &&
            existingExpiry &&
            Number.isFinite(existingExpiry.getTime()) &&
            existingExpiry > now
        )
            ? existingExpiry
            : null;

        const startsAt = activeExpiry || now;

        const expiresAt = addBillingPeriod(
            startsAt,
            payment.billingCycle
        );

        user.set('subscription', {
            plan: 'premium',
            billingCycle: payment.billingCycle,
            startsAt: activeExpiry
                ? user.subscription.startsAt
                : now,
            expiresAt,
        });

        payment.status = 'success';
        payment.providerTransactionId = transactionId;
        payment.paidAt = transaction.paid_at
            ? new Date(transaction.paid_at)
            : now;
        payment.subscriptionStartsAt = startsAt;
        payment.subscriptionExpiresAt = expiresAt;

        await user.save({ session });
        await payment.save({ session });

        result = {
            status: 'success',
            alreadyProcessed: false,
            payment,
        };
    });

    return result;
};

const processPayment = async (reference) => {
    const payment = await Payment.findOne({ reference });

    if (!payment) {
        throw new AppError('Payment not found.', 404);
    }

    if (payment.status === 'success') {
        return {
            status: 'success',
            alreadyProcessed: true,
            payment,
        };
    }

    const transaction = await verifyTransaction(reference);

    return activateVerifiedPayment(
        reference,
        transaction
    );
};

module.exports = {
    addBillingPeriod,
    processPayment,
};