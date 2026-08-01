import React from'react';
import{
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
Typography
}from'@mui/material';
import {useTranslation}from'react-i18next';

const DeleteReminderDialog=({
open,
loading=false,
reminder=null,
onClose,
onConfirm
})=>{

const{t}=useTranslation();
return(
<Dialog
open={open}
onClose={loading?undefined:onClose}
fullWidth
maxWidth="xs"
>
<DialogTitle>
{t('Delete Reminder')}
</DialogTitle>
<DialogContent>
<Typography>
{t('Are you sure you want to delete this reminder?')}
</Typography>
{reminder&&(
<Typography
variant="body2"
color="text.secondary"
sx={{mt:2}}
>
<strong>{reminder.title}</strong>
</Typography>
)}
</DialogContent>
<DialogActions>
<Button
disabled={loading}
onClick={onClose}
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

export default DeleteReminderDialog;