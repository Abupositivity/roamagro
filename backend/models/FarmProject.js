const mongoose = require('mongoose');

/**
 * Activity Schema
 */
const ActivitySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            default: '',
        },
        category: {
            type: String,
            enum: [
                'Land Preparation',
                'Planting',
                'Irrigation',
                'Weeding',
                'Fertilizer',
                'Pesticide',
                'Harvest',
                'Feeding',
                'Vaccination',
                'Maintenance',
                'Other',
            ],
            default: 'Other',
        },
        status: {
            type: String,
            enum: ['Pending', 'In Progress', 'Completed'],
            default: 'Pending',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        dueDate: Date,
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: Date,
        notes: {
            type: String,
            default: '',
        },
    },
    {
        _id: true,
    }
);

/**
 * Task Schema
 */
const TaskSchema=new mongoose.Schema(
{
    title:{
        type:String, required:true, trim:true
    },
    description:{ type:String, default:''
    },
    priority:{ type:String, enum:[ 'Low', 'Medium', 'High' ], default:'Medium'
    },
    status:{ type:String, enum:[ 'Pending', 'In Progress', 'Completed' ], default:'Pending'
    },
    completed:{ type:Boolean, default:false
    },
    assignedTo:{ type:String, default:''
    },
    dueDate:{ type:Date
    },
    completedAt:{ type:Date
    },
    notes:{ type:String, default:''
    }
},
{
    timestamps:true,
    _id:true
}
);

/**
 * Expense Schema
 */
const ExpenseSchema = new mongoose.Schema(
    {
        category: {
            type: String,
            default: '',
        },
        description: {
            type: String,
            default: '',
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        date: {
            type: Date,
            default: Date.now,
        },
    },
    {
        _id: true,
    }
);

/**
 * Harvest Schema
 */
const HarvestSchema = new mongoose.Schema(
{
    crop: {
        type: String,
        required: true,
        trim: true,
    },
    quantity: {
        type: Number,
        default: 0,
        min: 0,
    },
    unit: {
        type: String,
        enum: [
            'kg',
            'g',
            'tonnes',
            'bags',
            'crates',
            'pieces',
            'litres',
            'other',
        ],
        default: 'kg',
    },
    pricePerUnit: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalValue: {
        type: Number,
        default: 0,
        min: 0,
    },
    harvestDate: {
        type: Date,
        default: Date.now,
    },
},
{
    _id: true,
}
);

HarvestSchema.pre('validate', function(next) {
    const quantity = Number(this.quantity) || 0;
    const price = Number(this.pricePerUnit) || 0;
    this.totalValue = quantity * price;
    next();
});

/**
 * Reminder Schema
 */
const ReminderSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        reminderDate: {
            type: Date,
            required: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
    },
    {
        _id: true,
    }
);

/**
 * Main Farm Project Schema
 */
const FarmProjectSchema = new mongoose.Schema(
    {
        /**
         * Basic Information
         */
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: '',
            trim: true,
        },
        crop: {
            type: String,
            default: '',
        },
        farmType: {
            type: String,
            enum: [
                'Crop Farming',
                'Livestock',
                'Poultry',
                'Fishery',
                'Mixed Farming',
                'Other',
            ],
            default: 'Crop Farming',
        },
        category: {
            type: String,
            default: '',
        },
        season: {
            type: String,
            enum: [
                'Dry Season',
                'Rainy Season',
                'All Season',
            ],
            default: 'Rainy Season',
        },

        /**
         * Farm Information
         */
        farmSize: {
            type: Number,
            default: 0,
        },
        measurementUnit: {
            type: String,
            enum: ['Acres', 'Hectares'],
            default: 'Hectares',
        },
        location: {
            type: String,
            default: '',
        },

        /**
         * Financial
         */
        budget: {
            type: Number,
            default: 0,
        },
        financials: {
            income: {
                type: Number,
                default: 0,
            },
            expenses: {
                type: Number,
                default: 0,
            },
            profit: {
                type: Number,
                default: 0,
            },
        },

        /**
         * Progress
         */
        status: {
            type: String,
            enum: [
                'Planning',
                'Active',
                'Paused',
                'Completed',
            ],
            default: 'Planning',
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High'],
            default: 'Medium',
        },
        progress: {
            type: Number,
            default: 0,
            min: 0,
            max: 100,
        },

        /**
         * Dates
         */
        startDate: Date,
        endDate: Date,

        /**
         * Additional Information
         */
        weatherNotes: {
            type: String,
            default: '',
        },
        projectImage: {
            type: String,
            default: '',
        },
        tags: [
            {
                type: String,
            },
        ],

        /**
         * Embedded Resources
         */
        activities: [ActivitySchema],
        tasks: [TaskSchema],
        expenses: [ExpenseSchema],
        harvests: [HarvestSchema],
        reminders: [ReminderSchema],

        /**
         * Owner
         */
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
        toJSON: {
            virtuals: true,
        },
        toObject: {
            virtuals: true,
        },
    }
);

/**
 * Virtual Profit
 */
FarmProjectSchema.virtual('calculatedProfit').get(function () {
    return (
        (this.financials?.income || 0) -
        (this.financials?.expenses || 0)
    );
});

/**
 * Activity Counts
 */
FarmProjectSchema.virtual('completedActivities').get(function () {
    return this.activities.filter(a => a.completed).length;
});
FarmProjectSchema.virtual('pendingActivities').get(function () {
    return this.activities.filter(a => !a.completed).length;
});
FarmProjectSchema.virtual('completedTasks').get(function(){
return(this.tasks||[]).filter(task=>task.completed).length;
});

FarmProjectSchema.virtual('pendingTasks').get(function(){
return(this.tasks||[]).filter(task=>!task.completed).length;
});

module.exports = mongoose.model('FarmProject', FarmProjectSchema);