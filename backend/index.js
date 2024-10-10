const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const farmProjectRoutes = require('./routes/farmProjectRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const priceIndexRoutes = require('./routes/priceIndexRoutes');
const communityRoutes = require('./routes/communityRoutes');

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Register app routes
app.use('/api/auth', authRoutes);
app.use('/api/farm-projects', farmProjectRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/price-index', priceIndexRoutes);
app.use('/api/community', communityRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server running on port ${PORT}'));