import React from 'react';
import{
Dialog,
DialogTitle,
DialogContent,
IconButton
}from'@mui/material';
import CloseIcon from'@mui/icons-material/Close';
import {useTranslation}from'react-i18next';

import MarketplaceForm from'./MarketplaceForm';

const MarketplaceDialog=({
open,
loading=false,
listing=null,
onClose,
onSubmit
})=>{

const{t}=useTranslation();

return(
<Dialog
open={open}
fullWidth
maxWidth="md"
onClose={loading?undefined:onClose}
>
<DialogTitle
sx={{
display:'flex',
justifyContent:'space-between',
alignItems:'center'
}}
>
{listing
?t('Edit Listing')
:t('Create Listing')}
<IconButton
size="small"
disabled={loading}
onClick={onClose}
>
<CloseIcon/>
</IconButton>
</DialogTitle>
<DialogContent dividers>
<MarketplaceForm
loading={loading}
initialValues={listing}
submitLabel={
listing
?'Update Listing'
:'Create Listing'
}
onSubmit={onSubmit}
/>
</DialogContent>
</Dialog>
);
};

export default MarketplaceDialog;