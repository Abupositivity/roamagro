const mongoose = require('mongoose');

const PriceAlertSchema = new mongoose.Schema(
{
    product:{
        type:String,
        required:true,
        trim:true,
    },

    location:{
        type:String,
        default:'',
    },

    targetPrice:{
        type:Number,
        required:true,
    },

    alertType:{
        type:String,
        enum:[
            'Above',
            'Below',
        ],
        default:'Above',
    },

    active:{
        type:Boolean,
        default:true,
    },

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    }

},
{
    timestamps:true,
});

module.exports=mongoose.model(
    'PriceAlert',
    PriceAlertSchema
);