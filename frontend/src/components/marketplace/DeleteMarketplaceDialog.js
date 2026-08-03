import React from 'react';
import {
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Typography,
Button
} from '@mui/material';
import {useTranslation} from 'react-i18next';

const DeleteMarketplaceDialog=({
open,
loading=false,
listing=null,
onClose,
onConfirm
})=>{

const{t}=useTranslation();
return(
<Dialog
open={open}
onClose={loading?undefined:onClose}
maxWidth="xs"
fullWidth
>
<DialogTitle>
{t('Delete Listing')}
</DialogTitle>
<DialogContent>
<Typography>
{t('Are you sure you want to delete this marketplace listing?')}
</Typography>
{listing&&(
<Typography
mt={2}
fontWeight={700}
>
{listing.title}
</Typography>
)}
</DialogContent>
<DialogActions>
<Button
onClick={onClose}
disabled={loading}
>
{t('Cancel')}
</Button>
<Button
variant="contained"
color="error"
disabled={loading}
onClick={onConfirm}
>
{t('Delete')}
</Button>
</DialogActions>
</Dialog>
);
};

export default DeleteMarketplaceDialog;