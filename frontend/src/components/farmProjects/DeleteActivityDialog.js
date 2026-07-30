import React from 'react';
import {
Dialog,
DialogTitle,
DialogContent,
DialogContentText,
DialogActions,
Button
} from '@mui/material';
import {useTranslation} from 'react-i18next';

const DeleteActivityDialog=({
open,
loading=false,
activity=null,
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
{t('Delete Activity')}
</DialogTitle>
<DialogContent>
<DialogContentText>
{activity
?t('Are you sure you want to delete "{{title}}"?',{
title:activity.title
})
:t('Are you sure you want to delete this activity?')
}
</DialogContentText>
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
onClick={onConfirm}
disabled={loading}
>
{t('Delete')}
</Button>
</DialogActions>
</Dialog>
);
};

export default DeleteActivityDialog;