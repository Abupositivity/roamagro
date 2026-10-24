require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

require('./config/passportConfig');

const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const farmProjectRoutes = require('./routes/farmProjectRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const priceIndexRoutes = require('./routes/priceIndexRoutes');
const communityRoutes = require('./routes/communityRoutes');
const agriFeedRoutes = require('./routes/agriFeedRoutes');
const financialRoutes = require('./routes/financialRoutes');
const priceAlertRoutes = require('./routes/priceAlertRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const userRoutes = require('./routes/userRoutes');
const connectionRoutes = require('./routes/connectionRoutes');

const getAllowedOrigins = () => {
    const configuredOrigins = (
        process.env.FRONTEND_URL || 'http://localhost:3000'
    )
        .split(',')
        .map(origin => origin.trim())
        .filter(Boolean);

    return configuredOrigins.map(origin => {
        let parsedOrigin;

        try {
            parsedOrigin = new URL(origin);
        } catch {
            throw new Error(`Invalid FRONTEND_URL origin: ${origin}`);
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

const createApp = ({ sessionStore } = {}) => {
    const app = express();
    const allowedOrigins = getAllowedOrigins();

    app.disable('x-powered-by');
    app.set('json spaces', 2);

    if (process.env.NODE_ENV === 'production') {
        // Match this value to the actual trusted proxy configuration.
        app.set('trust proxy', 1);
    }

    app.use(helmet({
        crossOriginResourcePolicy: {
            policy: 'cross-origin'
        },
        crossOriginOpenerPolicy: {
            policy: 'same-origin-allow-popups'
        }
    }));

    app.use(compression());

    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    } else {
        // Do not log query strings, which may contain sensitive data.
        app.use(morgan(
            ':method :status :res[content-length] - :response-time ms'
        ));
    }

    app.use(cors({
        origin(origin, callback) {
            // Allow non-browser requests without an Origin header.
            if (!origin || allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            const error = new Error('Origin not allowed by CORS.');
            error.statusCode = 403;

            return callback(error);
        },
        credentials: true,
        methods: [
            'GET',
            'POST',
            'PUT',
            'PATCH',
            'DELETE',
            'OPTIONS'
        ],
        allowedHeaders: [
            'Content-Type',
            'Authorization'
        ]
    }));

    app.use(express.json({
        limit: '10mb'
    }));

    app.use(express.urlencoded({
        extended: true,
        limit: '10mb'
    }));

    const store = sessionStore || MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 60 * 60 * 24
    });

    app.use(session({
        name: 'roamagro.sid',
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        store,
        cookie: {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24
        }
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.get('/api/v1/health', (req, res) => {
        res.status(200).json({
            success: true,
            message: 'RoamAgro API is running.',
            version: process.env.API_VERSION || '1.0.0',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        });
    });

    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/dashboard', dashboardRoutes);
    app.use('/api/v1/farm-projects', farmProjectRoutes);
    app.use('/api/v1/marketplace', marketplaceRoutes);
    app.use('/api/v1/price-index', priceIndexRoutes);
    app.use('/api/v1/financial', financialRoutes);
    app.use('/api/v1/price-alerts', priceAlertRoutes);
    app.use('/api/v1/community', communityRoutes);
    app.use('/api/v1/feed', agriFeedRoutes);
    app.use('/api/v1/notifications', notificationRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/connections', connectionRoutes);

    app.get('/', (req, res) => {
        res.json({
            success: true,
            application: 'RoamAgro API',
            version: process.env.API_VERSION || '1.0.0',
            documentation: '/api/v1/health'
        });
    });

    if (process.env.NODE_ENV === 'production') {
        // Verify that this matches your actual frontend build directory.
        const frontendBuildPath = path.join(
            __dirname,
            '../frontend/build'
        );

        app.use(express.static(frontendBuildPath));

        // Serve the frontend for non-API paths only.
        app.get(/^\/(?!api(?:\/|$)).*/, (req, res, next) => {
            res.sendFile(
                path.join(frontendBuildPath, 'index.html'),
                error => {
                    if (error) {
                        next(error);
                    }
                }
            );
        });
    }

    app.use(notFound);
    app.use(errorHandler);

    return app;
};

module.exports = createApp;