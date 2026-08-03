import React from'react';

import{
Dialog,
DialogContent,
IconButton
}from'@mui/material';

import CloseIcon from'@mui/icons-material/Close';

const ImagePreviewDialog=({
open,
image,
onClose
})=>{
return(
<Dialog
open={open}
maxWidth="md"
fullWidth
onClose={onClose}
>
<IconButton
onClick={onClose}
sx={{
position:'absolute',
right:8,
top:8,
zIndex:2,
background:'white'
}}
>
<CloseIcon/>
</IconButton>
<DialogContent
sx={{
p:0
}}
>
<img
src={image}
alt="Preview"
style={{
width:'100%',
display:'block'
}}
/>
</DialogContent>
</Dialog>
);
};

export default ImagePreviewDialog;