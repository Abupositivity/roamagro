import React,{useState}from'react';
import{
Box,
CardMedia
}from'@mui/material';

import ImagePreviewDialog from'./ImagePreviewDialog';

const PLACEHOLDER='https://via.placeholder.com/600x400?text=RoamAgro';

const MarketplaceImage=({
images=[]
})=>{

const[open,setOpen]=useState(false);
const image=
images.length
?images[0]
:PLACEHOLDER;
return(
<>
<Box
sx={{
cursor:'pointer'
}}
onClick={()=>setOpen(true)}
>
<CardMedia
component="img"
height="180"
image={image}
alt="Marketplace"
/>
</Box>
<ImagePreviewDialog
open={open}
image={image}
onClose={()=>setOpen(false)}
/>
</>
);
};

export default MarketplaceImage;