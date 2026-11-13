const https = require('https');
const crypto = require('crypto');

const AppError = require('../utils/AppError');

const PAYSTACK_HOST = 'api.paystack.co';

const getSecretKey = () => {
    const key = process.env.PAYSTACK_SECRET_KEY;

    if (!key) {
        throw new AppError(
            'Paystack payment service is not configured.',
            503
        );
    }

    return key;
};

const paystackRequest = (method, endpoint, payload) => {
    const secretKey = getSecretKey();

    return new Promise((resolve, reject) => {
        const body = payload
            ? JSON.stringify(payload)
            : null;

        const request = https.request(
            {
                hostname: PAYSTACK_HOST,
                path: endpoint,
                method,
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    'Content-Type': 'application/json',
                    ...(body
                        ? {
                            'Content-Length':
                                Buffer.byteLength(body),
                        }
                        : {}),
                },
                timeout: 15000,
            },
            (response) => {
                let responseBody = '';

                response.setEncoding('utf8');

                response.on('data', (chunk) => {
                    responseBody += chunk;
                });

                response.on('end', () => {
                    let result;

                    try {
                        result = JSON.parse(responseBody);
                    } catch {
                        return reject(
                            new AppError(
                                'Invalid response from payment provider.',
                                502
                            )
                        );
                    }

                    if (
                        response.statusCode < 200 ||
                        response.statusCode >= 300 ||
                        result.status !== true
                    ) {
                        return reject(
                            new AppError(
                                'Payment provider could not process the request.',
                                502
                            )
                        );
                    }

                    resolve(result.data);
                });
            }
        );

        request.on('timeout', () => {
            request.destroy(
                new Error('Payment provider request timed out.')
            );
        });

        request.on('error', () => {
            reject(
                new AppError(
                    'Payment provider is temporarily unavailable.',
                    502
                )
            );
        });

        if (body) {
            request.write(body);
        }

        request.end();
    });
};

const initializeTransaction = ({
    email,
    amount,
    reference,
    callbackUrl,
}) => {
    return paystackRequest(
        'POST',
        '/transaction/initialize',
        {
            email,
            amount,
            reference,
            currency: 'NGN',
            callback_url: callbackUrl,
        }
    );
};

const verifyTransaction = (reference) => {
    return paystackRequest(
        'GET',
        `/transaction/verify/${encodeURIComponent(reference)}`
    );
};

const verifyWebhookSignature = (rawBody, signature) => {
    if (
        !Buffer.isBuffer(rawBody) ||
        typeof signature !== 'string' ||
        !/^[a-f0-9]{128}$/i.test(signature)
    ) {
        return false;
    }

    const expected = crypto
        .createHmac('sha512', getSecretKey())
        .update(rawBody)
        .digest();

    const received = Buffer.from(signature, 'hex');

    return crypto.timingSafeEqual(
        expected,
        received
    );
};

module.exports = {
    initializeTransaction,
    verifyTransaction,
    verifyWebhookSignature,
};