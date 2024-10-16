const MarketplaceItem = require('../models/MarketplaceItem');

// Create a new marketplace item
exports.createMarketplaceItem = async (req, res) => {
  const { title, description, category, price, location } = req.body;

  try {
    const newItem = new MarketplaceItem({
      title,
      description,
      category,
      price,
      location,
      user: req.userId,
    });

    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all marketplace items
exports.getMarketplaceItems = async (req, res) => {
  try {
    const items = await MarketplaceItem.find();
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};