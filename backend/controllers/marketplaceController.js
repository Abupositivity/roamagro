const MarketplaceItem = require('../models/MarketplaceItem');
const asyncHandler = require('../middleware/asyncHandler');

/*
|--------------------------------------------------------------------------
| Create Marketplace Listing
|--------------------------------------------------------------------------
*/
exports.createMarketplaceItem = asyncHandler(async (req, res) => {

    const item = await MarketplaceItem.create({
        ...req.body,
        user: req.user._id,
    });
    console.log(`✅ Marketplace Listing Created: ${item.title}`);
    res.status(201).json({
        success: true,
        message: 'Marketplace listing created successfully.',
        data: item,
    });
});

/*
|--------------------------------------------------------------------------
| Get Marketplace Listing
|--------------------------------------------------------------------------
*/
exports.getMarketplaceItems = asyncHandler(async (req, res) => {

    const items = await MarketplaceItem.find()
        .populate('user', 'name phone location profilePhoto')
        .sort({ createdAt: -1 });

    res.status(200).json({
        success: true,
        count: items.length,
        data: items,
    });
});

/*
|--------------------------------------------------------------------------
| Get Marketplace Item
|--------------------------------------------------------------------------
*/
exports.getMarketplaceItem=asyncHandler(async(req,res)=>{
const item=await MarketplaceItem
.findById(req.params.id)
.populate('user','name phone location profilePhoto');
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
});

/*
|--------------------------------------------------------------------------
| Update Marketplace Item
|--------------------------------------------------------------------------
*/
exports.updateMarketplaceItem=asyncHandler(async(req,res)=>{
const item=await MarketplaceItem.findById(req.params.id);
if(!item){
return res.status(404).json({
success:false,
message:'Marketplace listing not found.'
});
}
Object.assign(item,req.body);
await item.save();
res.status(200).json({
success:true,
message:'Marketplace listing updated successfully.',
data:item
});
});

/*
|--------------------------------------------------------------------------
| Delete Marketplace Item
|--------------------------------------------------------------------------
*/
exports.deleteMarketplaceItem=asyncHandler(async(req,res)=>{
const item=await MarketplaceItem.findById(req.params.id);
if(!item){
return res.status(404).json({
success:false,
message:'Marketplace listing not found.'
});
}
await item.deleteOne();
res.status(200).json({
success:true,
message:'Marketplace listing deleted successfully.'
});
});