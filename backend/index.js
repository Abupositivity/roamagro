const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const connectDB = require('./config/db');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

require('./config/passportConfig');

/* ===================================================
   Connect MongoDB
=================================================== */
connectDB();

const app = express();

/* ===================================================
   Express Settings
=================================================== */
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.set('json spaces', 2);

/* ===================================================
   Security
=================================================== */
app.use(
    helmet({
        crossOriginResourcePolicy: false,
        crossOriginResourcePolicy: false,
        crossOriginOpenerPolicy: {
            policy: "same-origin-allow-popups",
        },
    })
);
app.use(compression());

/* ===================================================
   Logging
=================================================== */
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

/* ===========================
   Global Middleware
=========================== */
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(',').map(origin => origin.trim())
    : ['http://localhost:3000'];

app.use(cors({
    origin(origin, callback) {
        // allow Postman/mobile apps/no-origin requests
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
         return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization' ]
}));

/* ===================================================
   Body Parsers
=================================================== */
app.use(express.json({
    limit: '10mb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '10mb'
}));

/* ===========================
   Session Configuration
=========================== */
app.use(session({
    name: 'roamagro.sid',
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    }),
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 // 24 Hours
    }
}));

/* ===========================
   Passport
=========================== */
app.use(passport.initialize());
app.use(passport.session());

/* ===========================
   Health Check Endpoint
=========================== */
app.get('/api/v1/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'RoamAgro API is running.',
        version: process.env.API_VERSION || '1.0.0',
        environment: process.env.NODE_ENV,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });
});

/* ===========================
   API Routes
=========================== */
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const farmProjectRoutes = require('./routes/farmProjectRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const priceIndexRoutes = require('./routes/priceIndexRoutes');
const communityRoutes = require('./routes/communityRoutes');
const agriFeedRoutes = require('./routes/agriFeedRoutes');
const financialRoutes=require('./routes/financialRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/farm-projects', farmProjectRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/price-index', priceIndexRoutes);
app.use('/api/v1/financial', financialRoutes);
app.use('/api/v1/community', communityRoutes);
app.use('/api/v1/feed', agriFeedRoutes);

/* ===================================================
   Root Endpoint
=================================================== */
app.get('/', (req, res) => {
    res.json({
        success: true,
        application: 'RoamAgro API',
        version: process.env.API_VERSION || '1.0.0',
        documentation: '/api/v1/health'
    });
});

/* ===========================
   Production Frontend
=========================== */
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get(/^\/(?!api).*/, (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
/* ===========================
   404 Handler
=========================== */
app.use(notFound);

/* ===========================
   Global Error Handler
=========================== */
app.use(errorHandler);

/* ===========================
   Start Server
=========================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`
============================================================
🌱 RoamAgro Backend Started Successfully
============================================================
🚀 Port            : ${PORT}
🌍 Environment     : ${process.env.NODE_ENV}
📦 API Version     : ${process.env.API_VERSION || '1.0.0'}
🔐 Authentication  : Enabled
🛡️ Passport        : Active
💾 MongoDB         : Connected
============================================================
Health Check:
http://localhost:${PORT}/api/v1/health
============================================================
`);

});