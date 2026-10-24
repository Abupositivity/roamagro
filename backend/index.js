require('dotenv').config();

const connectDB = require('./config/db');
const createApp = require('./app');

const validateEnvironment = () => {
    const requiredVariables = [
        'MONGO_URI',
        'JWT_SECRET',
        'SESSION_SECRET'
    ];

    const missingVariables = requiredVariables.filter(
        name => !process.env[name]?.trim()
    );

    if (missingVariables.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVariables.join(', ')}`
        );
    }

    for (const name of ['JWT_SECRET', 'SESSION_SECRET']) {
        if (process.env[name].length < 32) {
            throw new Error(
                `${name} must contain at least 32 characters.`
            );
        }
    }

    if (
        process.env.NODE_ENV === 'production' &&
        !process.env.FRONTEND_URL?.trim()
    ) {
        throw new Error(
            'FRONTEND_URL must be configured in production.'
        );
    }

    const origins = (
        process.env.FRONTEND_URL || 'http://localhost:3000'
    )
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    return origins.map(origin => {
        let parsedOrigin;

        try {
            parsedOrigin = new URL(origin);
        } catch {
            throw new Error(
                `Invalid FRONTEND_URL origin: ${origin}`
            );
        }

        if (
            !['http:', 'https:'].includes(parsedOrigin.protocol) ||
            parsedOrigin.origin !== origin.replace(/\/+$/, '')
        ) {
            throw new Error(
                `FRONTEND_URL must contain valid origins without paths: ${origin}`
            );
        }

        if (
            process.env.NODE_ENV === 'production' &&
            parsedOrigin.protocol !== 'https:'
        ) {
            throw new Error(
                'Production frontend origins must use HTTPS.'
            );
        }

        return parsedOrigin.origin;
    });
};

const startServer = async () => {
    try {
        const validatedOrigins = validateEnvironment();

        await connectDB();

        const app = createApp();
        const PORT = process.env.PORT || 5000;

        const server = app.listen(PORT, () => {
            console.log(
                `RoamAgro API listening on port ${PORT} (${process.env.NODE_ENV || 'development'}).`
            );

            console.log(
                `Allowed frontend origins: ${validatedOrigins.join(', ')}`
            );
        });

        server.on('error', error => {
            console.error(
                'RoamAgro server failed to start:',
                error.message
            );

            process.exit(1);
        });

        return server;
    } catch (error) {
        console.error(
            'RoamAgro startup failed:',
            error.message
        );

        process.exit(1);
    }
};

if (require.main === module) {
    startServer();
}

module.exports = {
    startServer,
    validateEnvironment
};