const mongoose=require('mongoose');

const UserReportSchema=new mongoose.Schema(
{
    reporter:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    reportedUser:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    reason:{
        type:String,
        enum:[
            'Spam',
            'Harassment',
            'Scam',
            'Fake Account',
            'Inappropriate Content',
            'Other'
        ],
        required:true
    },
    details:{
        type:String,
        trim:true,
        maxlength:500,
        default:''
    },
    status:{
        type:String,
        enum:['Pending','Reviewed','Dismissed','Action Taken'],
        default:'Pending',
        index:true
    },
    reviewedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        default:null
    },
    reviewedAt:{
        type:Date,
        default:null
    }
},
{
    timestamps:true
});

UserReportSchema.index(
    {
        reporter:1,
        reportedUser:1
    },
    {
        unique:true
    }
);

module.exports=mongoose.model('UserReport',UserReportSchema);