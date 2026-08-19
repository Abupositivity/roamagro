const User=require('../models/User');
const CommunityPost=require('../models/CommunityPost');
const MarketplaceItem=require('../models/MarketplaceItem');
const asyncHandler=require('../middleware/asyncHandler');
const AppError=require('../utils/AppError');

const COMMUNITY_USER_FIELDS='name profilePhoto role state lga location';
const MARKETPLACE_USER_FIELDS='name phone location state profilePhoto role bio';

exports.getProfile=asyncHandler(async(req,res)=>{
    const userId=req.user._id;

    const[
        user,
        communityCount,
        marketplaceCount,
        communityPosts,
        marketplaceListings
    ]=await Promise.all([
        User.findById(userId)
            .select('-password -googleId')
            .lean(),

        CommunityPost.countDocuments({
            user:userId,
            status:'Active'
        }),

        MarketplaceItem.countDocuments({
            user:userId,
            available:true
        }),

        CommunityPost.find({
            user:userId,
            status:'Active'
        })
            .populate(
                'user',
                COMMUNITY_USER_FIELDS
            )
            .sort({
                createdAt:-1
            })
            .limit(3)
            .lean(),

        MarketplaceItem.find({
            user:userId,
            available:true
        })
            .populate(
                'user',
                MARKETPLACE_USER_FIELDS
            )
            .sort({
                createdAt:-1
            })
            .limit(3)
            .lean()
    ]);

    if(!user){
        throw new AppError(
            'User profile not found.',
            404
        );
    }

    res.status(200).json({
        success:true,
        data:{
            ...user,
            communityPosts,
            marketplaceListings,
            stats:{
                communityPosts:communityCount,
                marketplaceListings:marketplaceCount
            }
        }
    });
});

exports.updateProfile=asyncHandler(async(req,res)=>{
    const allowedFields=[
        'name',
        'phone',
        'state',
        'lga',
        'location',
        'language',
        'profilePhoto',
        'bio'
    ];

    const updates={};

    allowedFields.forEach(field=>{
        if(
            Object.prototype.hasOwnProperty.call(
                req.body,
                field
            )
        ){
            updates[field]=req.body[field];
        }
    });

    if(Object.keys(updates).length===0){
        throw new AppError(
            'No profile information was provided.',
            400
        );
    }

    if(updates.name!==undefined){
        updates.name=String(updates.name).trim();
    }

    if(updates.phone!==undefined){
        updates.phone=String(updates.phone).trim();
    }

    if(updates.state!==undefined){
        updates.state=String(updates.state).trim();
    }

    if(updates.lga!==undefined){
        updates.lga=String(updates.lga).trim();
    }

    if(updates.location!==undefined){
        updates.location=String(updates.location).trim();
    }

    if(updates.profilePhoto!==undefined){
        updates.profilePhoto=String(
            updates.profilePhoto
        ).trim();
    }

    if(updates.bio!==undefined){
        updates.bio=String(updates.bio).trim();
    }

    if(updates.language!==undefined){
        updates.language=String(
            updates.language
        ).trim();
    }

    if(
        updates.name!==undefined &&
        !updates.name
    ){
        throw new AppError(
            'Name cannot be empty.',
            400
        );
    }

    const user=await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:updates
        },
        {
            new:true,
            runValidators:true
        }
    ).select('-password -googleId');

    if(!user){
        throw new AppError(
            'User profile not found.',
            404
        );
    }

    res.status(200).json({
        success:true,
        message:'Profile updated successfully.',
        data:user
    });
});

exports.searchUsers=asyncHandler(async(req,res)=>{
    const search=String(
        req.query.search||''
    ).trim();

    const page=Math.max(
        Number.parseInt(
            req.query.page,
            10
        )||1,
        1
    );

    const limit=Math.min(
        Math.max(
            Number.parseInt(
                req.query.limit,
                10
            )||20,
            1
        ),
        50
    );

    if(!search){
        return res.status(200).json({
            success:true,
            data:[],
            pagination:{
                page,
                limit,
                total:0,
                pages:0
            }
        });
    }

    const regex=new RegExp(
        search.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&'
        ),
        'i'
    );

    const query={
        _id:{
            $ne:req.user._id
        },
        $or:[
            {
                name:regex
            },
            {
                email:regex
            },
            {
                state:regex
            },
            {
                lga:regex
            },
            {
                location:regex
            }
        ]
    };

    const total=await User.countDocuments(
        query
    );

    const users=await User.find(query)
        .select(
            'name email profilePhoto bio phone state lga location language role isVerified'
        )
        .sort({
            name:1
        })
        .skip((page-1)*limit)
        .limit(limit)
        .lean();

    res.status(200).json({
        success:true,
        data:users,
        pagination:{
            page,
            limit,
            total,
            pages:Math.ceil(
                total/limit
            )
        }
    });
});

exports.getUserById=asyncHandler(async(req,res)=>{
    const user=await User.findById(
        req.params.userId
    )
        .select(
            'name email profilePhoto bio phone state lga location language role isVerified createdAt'
        )
        .lean();

    if(!user){
        throw new AppError(
            'User not found.',
            404
        );
    }

    res.status(200).json({
        success:true,
        data:{
            ...user,
            isSelf:
                String(user._id)===
                String(req.user._id)
        }
    });
});