const CommunityPost=require('../models/CommunityPost');
const Notification=require('../models/Notification');
const asyncHandler=require('../middleware/asyncHandler');

const PUBLIC_USER_FIELDS='name profilePhoto role state lga location';

const createNotificationSafely=async data=>{
    try{
        await Notification.create(data);
    }catch(error){
        console.error(
            'Notification creation failed:',
            error.message
        );
    }
};

exports.createCommunityPost=asyncHandler(async(req,res)=>{
    const post=await CommunityPost.create({
        title:req.body.title,
        content:req.body.content,
        category:req.body.category,
        image:req.body.image||'',
        user:req.user._id,
    });

    await post.populate(
        'user',
        PUBLIC_USER_FIELDS
    );

    res.status(201).json({
        success:true,
        message:'Community post created successfully.',
        data:post,
    });
});

exports.getCommunityPosts=asyncHandler(async(req,res)=>{
    const page=Math.max(
        parseInt(req.query.page,10)||1,
        1
    );

    const limit=Math.min(
        Math.max(
            parseInt(req.query.limit,10)||10,
            1
        ),
        50
    );

    const skip=(page-1)*limit;
    const search=req.query.search?.trim()||'';
    const category=req.query.category?.trim()||'';
    const mine=
        req.query.mine==='true'||
        req.query.mine==='1';

    const filter={
        status:'Active',
    };

    if(mine){
        filter.user=req.user._id;
    }

    if(
        category&&
        category.toLowerCase()!=='all'
    ){
        filter.category=category;
    }

    if(search){
        filter.$or=[
            {
                title:{
                    $regex:search,
                    $options:'i',
                },
            },
            {
                content:{
                    $regex:search,
                    $options:'i',
                },
            },
        ];
    }

    const total=
        await CommunityPost.countDocuments(
            filter
        );

    const posts=
        await CommunityPost.find(filter)
            .populate(
                'user',
                PUBLIC_USER_FIELDS
            )
            .populate(
                'comments.user',
                PUBLIC_USER_FIELDS
            )
            .sort({
                featured:-1,
                createdAt:-1,
            })
            .skip(skip)
            .limit(limit);

    const totalPages=Math.ceil(
        total/limit
    );

    res.status(200).json({
        success:true,
        count:posts.length,
        total,
        page,
        limit,
        totalPages,
        hasMore:page<totalPages,
        search,
        category,
        mine,
        data:posts,
    });
});

exports.getFeaturedPosts=asyncHandler(async(req,res)=>{
    const posts=
        await CommunityPost.find({
            featured:true,
            status:'Active',
        })
            .populate(
                'user',
                PUBLIC_USER_FIELDS
            )
            .populate(
                'comments.user',
                PUBLIC_USER_FIELDS
            )
            .sort({
                createdAt:-1,
            })
            .limit(5);

    res.status(200).json({
        success:true,
        data:posts,
    });
});

exports.updateCommunityPost=asyncHandler(async(req,res)=>{
    const post=
        await CommunityPost.findById(
            req.params.id
        );

    if(!post){
        return res.status(404).json({
            success:false,
            message:'Community post not found.',
        });
    }

    if(
        post.user.toString()!==
        req.user._id.toString()
    ){
        return res.status(403).json({
            success:false,
            message:
                'You can only edit your own posts.',
        });
    }

    if(post.status!=='Active'){
        return res.status(400).json({
            success:false,
            message:
                'Archived posts cannot be edited.',
        });
    }

    post.title=
        req.body.title?.trim()||
        post.title;

    post.content=
        req.body.content?.trim()||
        post.content;

    post.category=
        req.body.category?.trim()||
        post.category;

    if(
        Object.prototype.hasOwnProperty.call(
            req.body,
            'image'
        )
    ){
        post.image=req.body.image||'';
    }

    await post.save();

    await post.populate(
        'user',
        PUBLIC_USER_FIELDS
    );

    await post.populate(
        'comments.user',
        PUBLIC_USER_FIELDS
    );

    res.status(200).json({
        success:true,
        message:
            'Community post updated successfully.',
        data:post,
    });
});

exports.archiveCommunityPost=asyncHandler(
    async(req,res)=>{
        const post=
            await CommunityPost.findById(
                req.params.id
            );

        if(!post){
            return res.status(404).json({
                success:false,
                message:
                    'Community post not found.',
            });
        }

        if(
            post.user.toString()!==
            req.user._id.toString()
        ){
            return res.status(403).json({
                success:false,
                message:
                    'You can only delete your own posts.',
            });
        }

        post.status='Archived';

        await post.save();

        res.status(200).json({
            success:true,
            message:
                'Community post deleted successfully.',
            data:{
                _id:post._id,
            },
        });
    }
);

exports.shareCommunityPost=asyncHandler(
    async(req,res)=>{
        const post=
            await CommunityPost.findOneAndUpdate(
                {
                    _id:req.params.id,
                    status:'Active',
                },
                {
                    $inc:{
                        shares:1,
                    },
                },
                {
                    new:true,
                }
            );

        if(!post){
            return res.status(404).json({
                success:false,
                message:
                    'Community post not found.',
            });
        }

        res.status(200).json({
            success:true,
            message:
                'Community post share recorded.',
            data:post,
        });
    }
);

exports.addComment=asyncHandler(async(req,res)=>{
    const post=
        await CommunityPost.findById(
            req.params.id
        );

    if(!post){
        return res.status(404).json({
            success:false,
            message:'Community post not found.',
        });
    }

    if(post.status!=='Active'){
        return res.status(400).json({
            success:false,
            message:
                'Comments cannot be added to this post.',
        });
    }

    post.comments.push({
        user:req.user._id,
        content:req.body.content,
    });

    await post.save();

    if(
        post.user&&
        post.user.toString()!==
        req.user._id.toString()
    ){
        await createNotificationSafely({
            recipient:post.user,
            sender:req.user._id,
            type:'comment',
            title:'New Comment',
            message:
                `${req.user.name||'Someone'} commented on your community post.`,
            link:`/community/${post._id}`,
        });
    }

    await post.populate(
        'comments.user',
        PUBLIC_USER_FIELDS
    );

    await post.populate(
        'user',
        PUBLIC_USER_FIELDS
    );

    res.status(200).json({
        success:true,
        message:'Comment added successfully.',
        data:post,
    });
});

exports.deleteComment=asyncHandler(
    async(req,res)=>{
        const post=
            await CommunityPost.findById(
                req.params.postId
            );

        if(!post){
            return res.status(404).json({
                success:false,
                message:
                    'Community post not found.',
            });
        }

        const comment=
            post.comments.id(
                req.params.commentId
            );

        if(!comment){
            return res.status(404).json({
                success:false,
                message:'Comment not found.',
            });
        }

        if(
            comment.user.toString()!==
            req.user._id.toString()
        ){
            return res.status(403).json({
                success:false,
                message:
                    'You can only delete your own comments.',
            });
        }

        comment.deleteOne();

        await post.save();

        await post.populate(
            'comments.user',
            PUBLIC_USER_FIELDS
        );

        await post.populate(
            'user',
            PUBLIC_USER_FIELDS
        );

        res.status(200).json({
            success:true,
            message:'Comment deleted.',
            data:post,
        });
    }
);

exports.toggleLike=asyncHandler(async(req,res)=>{
    const post=
        await CommunityPost.findById(
            req.params.id
        );

    if(!post){
        return res.status(404).json({
            success:false,
            message:'Post not found.',
        });
    }

    if(post.status!=='Active'){
        return res.status(400).json({
            success:false,
            message:
                'This post is no longer active.',
        });
    }

    const alreadyLiked=
        post.likes.some(
            id=>
                id.toString()===
                req.user._id.toString()
        );

    if(alreadyLiked){
        post.likes=
            post.likes.filter(
                id=>
                    id.toString()!==
                    req.user._id.toString()
            );
    }else{
        post.likes.push(
            req.user._id
        );

        if(
            post.user&&
            post.user.toString()!==
            req.user._id.toString()
        ){
            await createNotificationSafely({
                recipient:post.user,
                sender:req.user._id,
                type:'like',
                title:'New Like',
                message:
                    `${req.user.name||'Someone'} liked your community post.`,
                link:`/community/${post._id}`,
            });
        }
    }

    await post.save();

    await post.populate(
        'user',
        PUBLIC_USER_FIELDS
    );

    await post.populate(
        'comments.user',
        PUBLIC_USER_FIELDS
    );

    res.json({
        success:true,
        data:post,
    });
});