const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path'); // Import path to handle static files
const connectDB = require('./config/db');
const passport = require('passport');
const session = require('express-session');
require('./config/passportConfig');

// Routes
const authRoutes = require('./routes/authRoutes');
const farmProjectRoutes = require('./routes/farmProjectRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const priceIndexRoutes = require('./routes/priceIndexRoutes');
const communityRoutes = require('./routes/communityRoutes');

// Load environment variables
dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Configure session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Register app routes for APIs
app.use('/api/auth', authRoutes);
app.use('/api/farm-projects', farmProjectRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/price-index', priceIndexRoutes);
app.use('/api/community', communityRoutes);

// Serve static files from the React app (frontend build)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Serve the React frontend for all routes except those starting with /api
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Error handling
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));