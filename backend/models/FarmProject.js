const mongoose = require('mongoose');

const FarmProjectSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    activities: { type: Array, default: [] },
    startDate: { type: Date },
    endDate: { type: Date },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    financials: {
        income: { type: Number, default: 0 },
        expenses: {type: Number, default: 0 },
        profit: { type: Number, default: 0 }
    },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FarmProject', FarmProjectSchema);