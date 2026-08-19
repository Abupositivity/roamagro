const mongoose=require('mongoose');
const User=require('../models/User');
const Connection=require('../models/Connection');
const MarketplaceItem=require('../models/MarketplaceItem');
const CommunityPost=require('../models/CommunityPost');
const Notification=require('../models/Notification');
const asyncHandler=require('../middleware/asyncHandler');
const AppError=require('../utils/AppError');

const createNotificationSafely=async data=>{
    try{
        await Notification.create(data);
    }catch(error){
        console.error('Notification creation failed:',error.message);
    }
};

const getConnectionFilter=(userId,otherUserId)=>{
    return{
        $or:[
            {
                requester:userId,
                recipient:otherUserId
            },
            {
                requester:otherUserId,
                recipient:userId
            }
        ]
    };
};

const normalizeConnectionStatus=(connection,userId)=>{
    if(!connection){
        return{
            status:'none',
            connectionId:null
        };
    }

    if(connection.status==='accepted'){
        return{
            status:'connected',
            connectionId:connection._id
        };
    }

    if(
        connection.requester.toString()===
        userId.toString()
    ){
        return{
            status:'outgoing_pending',
            connectionId:connection._id
        };
    }

    return{
        status:'incoming_pending',
        connectionId:connection._id
    };
};

const escapeRegex=value=>
    value.replace(
        /[.*+?^${}()|[\]\\]/g,
        '\\$&'
    );

const getPagination=(query,defaultLimit=20)=>{
    const page=Math.max(
        parseInt(query.page,10)||1,
        1
    );

    const limit=Math.min(
        Math.max(
            parseInt(query.limit,10)||defaultLimit,
            1
        ),
        50
    );

    return{
        page,
        limit,
        skip:(page-1)*limit
    };
};

const getTotalPages=(total,limit)=>
    Math.ceil(total/limit);

exports.searchUsers=asyncHandler(async(req,res)=>{
    const search=String(
        req.query.search||''
    ).trim();

    const{
        page,
        limit,
        skip
    }=getPagination(req.query,12);

    if(search.length<2){
        return res.status(200).json({
            success:true,
            count:0,
            total:0,
            page,
            limit,
            totalPages:0,
            hasMore:false,
            data:[]
        });
    }

    const searchRegex=new RegExp(
        escapeRegex(search),
        'i'
    );

    const filter={
        _id:{
            $ne:req.user._id
        },
        $or:[
            {
                name:searchRegex
            },
            {
                email:searchRegex
            },
            {
                state:searchRegex
            },
            {
                lga:searchRegex
            },
            {
                location:searchRegex
            }
        ]
    };

    const[
        total,
        users
    ]=await Promise.all([
        User.countDocuments(filter),
        User.find(filter)
            .select(
                'name email profilePhoto bio phone state lga location language role'
            )
            .sort({
                name:1
            })
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

    if(!users.length){
        const totalPages=
            getTotalPages(total,limit);

        return res.status(200).json({
            success:true,
            count:0,
            total,
            page,
            limit,
            totalPages,
            hasMore:page<totalPages,
            data:[]
        });
    }

    const userIds=users.map(
        user=>user._id
    );

    const connections=await Connection.find({
        $or:[
            {
                requester:req.user._id,
                recipient:{
                    $in:userIds
                }
            },
            {
                recipient:req.user._id,
                requester:{
                    $in:userIds
                }
            }
        ]
    })
        .select(
            '_id requester recipient status'
        )
        .lean();

    const connectionMap=new Map();

    connections.forEach(connection=>{
        const otherUserId=
            connection.requester.toString()===
            req.user._id.toString()
                ?connection.recipient.toString()
                :connection.requester.toString();

        connectionMap.set(
            otherUserId,
            connection
        );
    });

    const data=users.map(user=>{
        const connection=
            connectionMap.get(
                user._id.toString()
            );

        const normalized=
            normalizeConnectionStatus(
                connection,
                req.user._id
            );

        return{
            ...user,
            connectionStatus:
                normalized.status,
            connectionId:
                normalized.connectionId
        };
    });

    const totalPages=
        getTotalPages(total,limit);

    res.status(200).json({
        success:true,
        count:data.length,
        total,
        page,
        limit,
        totalPages,
        hasMore:page<totalPages,
        data
    });
});

exports.discoverUsers=asyncHandler(async(req,res)=>{
    const limit=Math.min(
        Math.max(
            parseInt(req.query.limit,10)||6,
            1
        ),
        20
    );

    const candidates=await User.find({
        _id:{
            $ne:req.user._id
        }
    })
        .select(
            'name profilePhoto bio state lga location language role'
        )
        .sort({
            createdAt:-1
        })
        .limit(50)
        .lean();

    if(!candidates.length){
        return res.status(200).json({
            success:true,
            count:0,
            data:[]
        });
    }

    const userIds=candidates.map(
        user=>user._id
    );

    const connections=await Connection.find({
        $or:[
            {
                requester:req.user._id,
                recipient:{
                    $in:userIds
                }
            },
            {
                recipient:req.user._id,
                requester:{
                    $in:userIds
                }
            }
        ]
    })
        .select(
            '_id requester recipient status'
        )
        .lean();

    const connectedIds=new Set();

    connections.forEach(connection=>{
        connectedIds.add(
            connection.requester.toString()===
            req.user._id.toString()
                ?connection.recipient.toString()
                :connection.requester.toString()
        );
    });

    const scored=candidates
        .filter(
            candidate=>
                !connectedIds.has(
                    candidate._id.toString()
                )
        )
        .map(candidate=>{
            let score=0;

            if(
                candidate.state&&
                req.user.state&&
                candidate.state===
                req.user.state
            ){
                score+=3;
            }

            if(
                candidate.lga&&
                req.user.lga&&
                candidate.lga===
                req.user.lga
            ){
                score+=2;
            }

            if(
                candidate.role&&
                req.user.role&&
                candidate.role===
                req.user.role
            ){
                score+=1;
            }

            return{
                candidate,
                score
            };
        })
        .sort(
            (a,b)=>
                b.score-a.score||
                a.candidate.name.localeCompare(
                    b.candidate.name
                )
        )
        .slice(0,limit)
        .map(item=>({
            ...item.candidate,
            connectionStatus:'none',
            connectionId:null
        }));

    return res.status(200).json({
        success:true,
        count:scored.length,
        data:scored
    });
});

exports.getPublicProfile=asyncHandler(async(req,res)=>{
    const userId=req.params.userId;

    if(
        !mongoose.Types.ObjectId.isValid(
            userId
        )
    ){
        throw new AppError(
            'Invalid user ID.',
            400
        );
    }

    const user=await User.findById(userId)
        .select(
            'name profilePhoto bio state lga location language role createdAt'
        )
        .lean();

    if(!user){
        throw new AppError(
            'User profile not found.',
            404
        );
    }

    if(
        user._id.toString()===
        req.user._id.toString()
    ){
        return res.status(200).json({
            success:true,
            data:{
                user,
                connectionStatus:'self',
                connectionId:null
            }
        });
    }

    const[
        connectionCount,
        marketplaceListings,
        communityPosts
    ]=await Promise.all([
        Connection.countDocuments({
            $or:[
                {
                    requester:user._id,
                    status:'accepted'
                },
                {
                    recipient:user._id,
                    status:'accepted'
                }
            ]
        }),
        MarketplaceItem.find({
            user:user._id
        })
            .select(
                'title description category price quantity unit location images available createdAt'
            )
            .sort({
                createdAt:-1
            })
            .limit(6)
            .lean(),
        CommunityPost.find({
            user:user._id,
            status:'Active'
        })
            .select(
                'title content category image featured shares likes comments createdAt'
            )
            .sort({
                featured:-1,
                createdAt:-1
            })
            .limit(6)
            .lean()
    ]);

    const connection=await Connection.findOne(
        getConnectionFilter(
            req.user._id,
            user._id
        )
    )
        .select(
            '_id requester recipient status'
        )
        .lean();

    const normalized=
        normalizeConnectionStatus(
            connection,
            req.user._id
        );

    res.status(200).json({
        success:true,
        data:{
            user,
            connectionStatus:
                normalized.status,
            connectionId:
                normalized.connectionId,
            stats:{
                connections:
                    connectionCount,
                marketplaceListings:
                    marketplaceListings.length,
                communityPosts:
                    communityPosts.length
            },
            marketplaceListings,
            communityPosts
        }
    });
});

exports.getConnectionStatus=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const otherUserId=req.params.userId;

    if(
        !mongoose.Types.ObjectId.isValid(
            otherUserId
        )
    ){
        throw new AppError(
            'Invalid user ID.',
            400
        );
    }

    if(
        userId.toString()===
        otherUserId.toString()
    ){
        return res.status(200).json({
            success:true,
            data:{
                userId:otherUserId,
                status:'self',
                connectionId:null
            }
        });
    }

    const connection=await Connection.findOne(
        getConnectionFilter(
            userId,
            otherUserId
        )
    )
        .select(
            '_id requester recipient status'
        )
        .lean();

    const normalized=
        normalizeConnectionStatus(
            connection,
            userId
        );

    res.status(200).json({
        success:true,
        data:{
            userId:otherUserId,
            status:normalized.status,
            connectionId:
                normalized.connectionId
        }
    });
});

exports.sendConnectionRequest=asyncHandler(async(req,res)=>{
    const requesterId=req.user._id;
    const recipientId=req.params.userId;

    if(
        requesterId.toString()===
        recipientId.toString()
    ){
        throw new AppError(
            'You cannot connect with yourself.',
            400
        );
    }

    if(
        !mongoose.Types.ObjectId.isValid(
            recipientId
        )
    ){
        throw new AppError(
            'Invalid user ID.',
            400
        );
    }

    const recipient=await User.findById(
        recipientId
    );

    if(!recipient){
        throw new AppError(
            'User not found.',
            404
        );
    }

    const existing=await Connection.findOne(
        getConnectionFilter(
            requesterId,
            recipientId
        )
    );

    if(existing){
        if(
            existing.status==='accepted'
        ){
            throw new AppError(
                'You are already connected with this user.',
                400
            );
        }

        if(
            existing.requester.toString()===
            requesterId.toString()
        ){
            throw new AppError(
                'Connection request already sent.',
                400
            );
        }

        throw new AppError(
            'This user has already sent you a connection request. Review the request in your Connections.',
            400
        );
    }

    const connection=await Connection.create({
        requester:requesterId,
        recipient:recipientId,
        status:'pending'
    });

    await connection.populate(
        'recipient',
        'name profilePhoto bio role state lga location'
    );

    await createNotificationSafely({
        recipient:recipientId,
        sender:requesterId,
        type:'connection_request',
        title:'New Connection Request',
        message:`${req.user.name||'Someone'} sent you a connection request.`,
        link:`/profile/${requesterId}`
    });

    res.status(201).json({
        success:true,
        message:
            'Connection request sent successfully.',
        data:{
            ...connection.toObject(),
            connectionStatus:
                'outgoing_pending',
            connectionId:connection._id
        }
    });
});

exports.acceptConnectionRequest=asyncHandler(async(req,res)=>{
    const recipientId=req.user._id;
    const requesterId=req.params.userId;

    if(
        !mongoose.Types.ObjectId.isValid(
            requesterId
        )
    ){
        throw new AppError(
            'Invalid user ID.',
            400
        );
    }

    const connection=await Connection.findOne({
        requester:requesterId,
        recipient:recipientId,
        status:'pending'
    });

    if(!connection){
        throw new AppError(
            'Connection request not found.',
            404
        );
    }

    connection.status='accepted';

    await connection.save();

    await connection.populate(
        'requester',
        'name profilePhoto bio role state lga location'
    );

    await createNotificationSafely({
        recipient:requesterId,
        sender:recipientId,
        type:'connection_accepted',
        title:'Connection Request Accepted',
        message:`${req.user.name||'Someone'} accepted your connection request.`,
        link:`/profile/${recipientId}`
    });

    res.status(200).json({
        success:true,
        message:
            'Connection request accepted.',
        data:{
            ...connection.toObject(),
            connectionStatus:'connected',
            connectionId:connection._id
        }
    });
});

exports.declineConnectionRequest=asyncHandler(async(req,res)=>{
    const recipientId=req.user._id;
    const requesterId=req.params.userId;

    if(
        !mongoose.Types.ObjectId.isValid(
            requesterId
        )
    ){
        throw new AppError(
            'Invalid user ID.',
            400
        );
    }

    const connection=await Connection.findOne({
        requester:requesterId,
        recipient:recipientId,
        status:'pending'
    });

    if(!connection){
        throw new AppError(
            'Connection request not found.',
            404
        );
    }

    await connection.deleteOne();

    await createNotificationSafely({
        recipient:requesterId,
        sender:recipientId,
        type:'connection_rejected',
        title:'Connection Request Declined',
        message:`${req.user.name||'Someone'} declined your connection request.`,
        link:`/profile/${recipientId}`
    });

    res.status(200).json({
        success:true,
        message:
            'Connection request declined.',
        data:{
            userId:requesterId,
            connectionStatus:'none',
            connectionId:null
        }
    });
});

exports.cancelConnectionRequest=asyncHandler(async(req,res)=>{
    const requesterId=req.user._id;
    const recipientId=req.params.userId;

    if(
        !mongoose.Types.ObjectId.isValid(
            recipientId
        )
    ){
        throw new AppError(
            'Invalid user ID.',
            400
        );
    }

    const connection=await Connection.findOne({
        requester:requesterId,
        recipient:recipientId,
        status:'pending'
    });

    if(!connection){
        throw new AppError(
            'Connection request not found.',
            404
        );
    }

    await connection.deleteOne();

    res.status(200).json({
        success:true,
        message:
            'Connection request cancelled.',
        data:{
            userId:recipientId,
            connectionStatus:'none',
            connectionId:null
        }
    });
});

exports.removeConnection=asyncHandler(async(req,res)=>{
    const userId=req.user._id;
    const otherUserId=req.params.userId;

    if(
        !mongoose.Types.ObjectId.isValid(
            otherUserId
        )
    ){
        throw new AppError(
            'Invalid user ID.',
            400
        );
    }

    const connection=await Connection.findOne({
        $or:[
            {
                requester:userId,
                recipient:otherUserId,
                status:'accepted'
            },
            {
                requester:otherUserId,
                recipient:userId,
                status:'accepted'
            }
        ]
    });

    if(!connection){
        throw new AppError(
            'Connection not found.',
            404
        );
    }

    await connection.deleteOne();

    res.status(200).json({
        success:true,
        message:
            'Connection removed successfully.',
        data:{
            userId:otherUserId,
            connectionStatus:'none',
            connectionId:null
        }
    });
});

exports.getConnections=asyncHandler(async(req,res)=>{
    const{
        page,
        limit,
        skip
    }=getPagination(req.query,20);

    const filter={
        $or:[
            {
                requester:req.user._id,
                status:'accepted'
            },
            {
                recipient:req.user._id,
                status:'accepted'
            }
        ]
    };

    const[
        total,
        connections
    ]=await Promise.all([
        Connection.countDocuments(filter),
        Connection.find(filter)
            .populate(
                'requester',
                'name profilePhoto bio state lga location role'
            )
            .populate(
                'recipient',
                'name profilePhoto bio state lga location role'
            )
            .sort({
                updatedAt:-1
            })
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

    const users=connections.map(
        connection=>{
            const requesterId=
                connection.requester._id.toString();

            const user=
                requesterId===
                req.user._id.toString()
                    ?connection.recipient
                    :connection.requester;

            return{
                ...user,
                connectionStatus:
                    'connected',
                connectionId:
                    connection._id
            };
        }
    );

    const totalPages=
        getTotalPages(total,limit);

    res.status(200).json({
        success:true,
        count:users.length,
        total,
        page,
        limit,
        totalPages,
        hasMore:
            page<totalPages,
        data:users
    });
});

exports.getIncomingRequests=asyncHandler(async(req,res)=>{
    const{
        page,
        limit,
        skip
    }=getPagination(req.query,20);

    const filter={
        recipient:req.user._id,
        status:'pending'
    };

    const[
        total,
        requests
    ]=await Promise.all([
        Connection.countDocuments(filter),
        Connection.find(filter)
            .populate(
                'requester',
                'name profilePhoto bio state lga location role'
            )
            .sort({
                createdAt:-1
            })
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

    const data=requests.map(
        request=>({
            ...request,
            user:request.requester,
            connectionStatus:
                'incoming_pending',
            connectionId:
                request._id
        })
    );

    const totalPages=
        getTotalPages(total,limit);

    res.status(200).json({
        success:true,
        count:data.length,
        total,
        page,
        limit,
        totalPages,
        hasMore:
            page<totalPages,
        data
    });
});

exports.getOutgoingRequests=asyncHandler(async(req,res)=>{
    const{
        page,
        limit,
        skip
    }=getPagination(req.query,20);

    const filter={
        requester:req.user._id,
        status:'pending'
    };

    const[
        total,
        requests
    ]=await Promise.all([
        Connection.countDocuments(filter),
        Connection.find(filter)
            .populate(
                'recipient',
                'name profilePhoto bio state lga location role'
            )
            .sort({
                createdAt:-1
            })
            .skip(skip)
            .limit(limit)
            .lean()
    ]);

    const data=requests.map(
        request=>({
            ...request,
            user:request.recipient,
            connectionStatus:
                'outgoing_pending',
            connectionId:
                request._id
        })
    );

    const totalPages=
        getTotalPages(total,limit);

    res.status(200).json({
        success:true,
        count:data.length,
        total,
        page,
        limit,
        totalPages,
        hasMore:
            page<totalPages,
        data
    });
});