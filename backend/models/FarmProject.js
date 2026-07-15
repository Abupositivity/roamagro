const mongoose = require('mongoose');

const FarmProjectSchema = new mongoose.Schema(
{
    name: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        required: true
    },

    crop: {
        type: String,
        default: ''
    },

    farmSize: {
        type: Number,
        default: 0
    },

    location: {
        type: String,
        default: ''
    },

    status: {
        type: String,
        enum: ['Planning', 'Active', 'Completed'],
        default: 'Planning'
    },

    activities: [{
        title: String,
        completed: {
            type: Boolean,
            default: false
        },
        dueDate: Date
    }],

    startDate: Date,

    endDate: Date,

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    financials: {

        income: {
            type: Number,
            default: 0
        },

        expenses: {
            type: Number,
            default: 0
        },

        profit: {
            type: Number,
            default: 0
        }

    }

},
{
    timestamps: true
});

module.exports = mongoose.model('FarmProject', FarmProjectSchema);