const mongoose=require('mongoose');
const Notification=require('../models/Notification');
const asyncHandler=require('../middleware/asyncHandler');
const AppError=require('../utils/AppError');

const NOTIFICATION_TYPES=[
    'connection_request',
    'connection_accepted',
    'connection_rejected',
    'like',
    'comment',
    'follow',
    'marketplace',
    'price_alert',
    'farm',
    'system'
];

exports.getNotifications=asyncHandler(async(req,res)=>{
    const notifications=await Notification.find({
        recipient:req.user._id,
        type:{$in:NOTIFICATION_TYPES}
    })
        .populate('sender','name profilePhoto')
        .sort({createdAt:-1})
        .limit(50);

    res.status(200).json({
        success:true,
        count:notifications.length,
        data:notifications
    });
});

exports.getUnreadCount=asyncHandler(async(req,res)=>{
    const count=await Notification.countDocuments({
        recipient:req.user._id,
        read:false,
        type:{$in:NOTIFICATION_TYPES}
    });

    res.status(200).json({
        success:true,
        count
    });
});

exports.markAsRead=asyncHandler(async(req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        throw new AppError('Invalid notification ID.',400);
    }

    const notification=await Notification.findOne({
        _id:req.params.id,
        recipient:req.user._id,
        type:{$in:NOTIFICATION_TYPES}
    });

    if(!notification){
        throw new AppError('Notification not found.',404);
    }

    if(!notification.read){
        notification.read=true;
        await notification.save();
    }

    await notification.populate('sender','name profilePhoto');

    res.status(200).json({
        success:true,
        message:'Notification marked as read.',
        data:notification
    });
});

exports.markAllAsRead=asyncHandler(async(req,res)=>{
    const result=await Notification.updateMany(
        {
            recipient:req.user._id,
            read:false,
            type:{$in:NOTIFICATION_TYPES}
        },
        {
            $set:{read:true}
        }
    );

    res.status(200).json({
        success:true,
        message:'All notifications marked as read.',
        modifiedCount:result.modifiedCount||0
    });
});

exports.deleteNotification=asyncHandler(async(req,res)=>{
    if(!mongoose.Types.ObjectId.isValid(req.params.id)){
        throw new AppError('Invalid notification ID.',400);
    }

    const notification=await Notification.findOne({
        _id:req.params.id,
        recipient:req.user._id,
        type:{$in:NOTIFICATION_TYPES}
    });

    if(!notification){
        throw new AppError('Notification not found.',404);
    }

    await notification.deleteOne();

    res.status(200).json({
        success:true,
        message:'Notification deleted successfully.'
    });
});