const MarketplaceItem=require('../models/MarketplaceItem');
const asyncHandler=require('../middleware/asyncHandler');

const sellerFields='name phone location state profilePhoto role bio';

const populateSeller=query=>
    query.populate('user',sellerFields);

exports.createMarketplaceItem=asyncHandler(
    async(req,res)=>{
        const item=await MarketplaceItem.create({
            ...req.body,
            user:req.user._id
        });

        console.log(`Marketplace Listing Created: ${item.title}`);

        const populatedItem=await populateSeller(
            MarketplaceItem.findById(item._id)
        );

        res.status(201).json({
            success:true,
            message:'Marketplace listing created successfully.',
            data:populatedItem
        });
    }
);

exports.getMarketplaceItems=asyncHandler(
    async(req,res)=>{
        const{
            page=1,
            limit=12,
            search='',
            category='All',
            mine='false',
            availability='All'
        }=req.query;

        const currentPage=Math.max(
            Number(page)||1,
            1
        );

        const pageLimit=Math.min(
            Math.max(
                Number(limit)||12,
                1
            ),
            50
        );

        const skip=(currentPage-1)*pageLimit;

        const filter={};

        if(search.trim()){
            const keyword=search.trim();

            filter.$or=[
                {
                    title:{
                        $regex:keyword,
                        $options:'i'
                    }
                },
                {
                    description:{
                        $regex:keyword,
                        $options:'i'
                    }
                },
                {
                    location:{
                        $regex:keyword,
                        $options:'i'
                    }
                },
                {
                    category:{
                        $regex:keyword,
                        $options:'i'
                    }
                },
                {
                    unit:{
                        $regex:keyword,
                        $options:'i'
                    }
                }
            ];
        }

        if(
            category&&
            category!=='All'
        ){
            filter.category=category;
        }

        if(
            availability===
            'Available'
        ){
            filter.available=true;
        }

        if(
            availability===
            'Sold'
        ){
            filter.available=false;
        }

        if(mine==='true'){
            filter.user=req.user._id;
        }

        const[
            items,
            total
        ]=await Promise.all([
            populateSeller(
                MarketplaceItem.find(filter)
                    .sort({
                        createdAt:-1
                    })
                    .skip(skip)
                    .limit(pageLimit)
            ),
            MarketplaceItem.countDocuments(filter)
        ]);

        const totalPages=Math.ceil(
            total/pageLimit
        );

        res.status(200).json({
            success:true,
            count:items.length,
            total,
            page:currentPage,
            limit:pageLimit,
            totalPages,
            hasMore:currentPage<totalPages,
            data:items
        });
    }
);

exports.getMarketplaceItem=asyncHandler(
    async(req,res)=>{
        const item=await populateSeller(
            MarketplaceItem.findById(
                req.params.id
            )
        );

        if(!item){
            return res.status(404).json({
                success:false,
                message:'Marketplace listing not found.'
            });
        }

        res.status(200).json({
            success:true,
            data:item
        });
    }
);

exports.updateMarketplaceItem=asyncHandler(
    async(req,res)=>{
        const item=await MarketplaceItem.findById(
            req.params.id
        );

        if(!item){
            return res.status(404).json({
                success:false,
                message:'Marketplace listing not found.'
            });
        }

        if(
            item.user.toString()!==
            req.user._id.toString()
        ){
            return res.status(403).json({
                success:false,
                message:'You can only update your own listing.'
            });
        }

        Object.assign(
            item,
            req.body
        );

        await item.save();

        const populatedItem=await populateSeller(
            MarketplaceItem.findById(item._id)
        );

        res.status(200).json({
            success:true,
            message:'Marketplace listing updated successfully.',
            data:populatedItem
        });
    }
);

exports.deleteMarketplaceItem=asyncHandler(
    async(req,res)=>{
        const item=await MarketplaceItem.findById(
            req.params.id
        );

        if(!item){
            return res.status(404).json({
                success:false,
                message:'Marketplace listing not found.'
            });
        }

        if(
            item.user.toString()!==
            req.user._id.toString()
        ){
            return res.status(403).json({
                success:false,
                message:'You can only delete your own listing.'
            });
        }

        await item.deleteOne();

        res.status(200).json({
            success:true,
            message:'Marketplace listing deleted successfully.'
        });
    }
);