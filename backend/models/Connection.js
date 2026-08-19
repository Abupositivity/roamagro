const mongoose=require('mongoose');

const ConnectionSchema=new mongoose.Schema(
{
    requester:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    recipient:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
    },
    status:{
        type:String,
        enum:['pending','accepted'],
        default:'pending',
        index:true
    }
},
{
    timestamps:true
}
);

ConnectionSchema.index(
    {
        requester:1,
        recipient:1
    },
    {
        unique:true
    }
);

ConnectionSchema.index({
    recipient:1,
    status:1,
    createdAt:-1
});

ConnectionSchema.index({
    requester:1,
    status:1,
    createdAt:-1
});

module.exports=mongoose.model(
    'Connection',
    ConnectionSchema
);