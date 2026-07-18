const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

require('./config/passportConfig');

// Connect Database
connectDB();

const app = express();

/* ===========================
   Global Middleware
=========================== */
app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

/* ===========================
   Session Configuration
=========================== */
app.use(session({
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
   API Routes
=========================== */
const authRoutes = require('./routes/authRoutes');
const farmProjectRoutes = require('./routes/farmProjectRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const priceIndexRoutes = require('./routes/priceIndexRoutes');
const communityRoutes = require('./routes/communityRoutes');

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/farm-projects', farmProjectRoutes);
app.use('/api/v1/marketplace', marketplaceRoutes);
app.use('/api/v1/price-index', priceIndexRoutes);
app.use('/api/v1/community', communityRoutes);

/* ===========================
   Production Frontend
=========================== */
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
    });
}
/* ===========================
   404 Handler
=========================== */
app.use((req, res, next) => {
    const error = new Error(`Route not found: ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
});
/* ===========================
   Global Error Handler
=========================== */
app.use(errorHandler);

/* ===========================
   Start Server
=========================== */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 RoamAgro API Server running on port ${PORT}`);
});