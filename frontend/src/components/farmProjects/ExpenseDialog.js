import React,{useEffect,useState}from'react';
import{
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
Grid,
IconButton,
Stack,
TextField
}from'@mui/material';
import CloseIcon from'@mui/icons-material/Close';
import {useTranslation}from'react-i18next';

const ExpenseDialog=({
open,
loading=false,
expense=null,
onClose,
onSubmit
})=>{

const{t}=useTranslation();

const[form,setForm]=useState({
category:'',
description:'',
amount:'',
date:''
});
useEffect(()=>{
if(expense){
setForm({
category:expense.category||'',
description:expense.description||'',
amount:expense.amount??'',
date:expense.date
?new Date(expense.date).toISOString().split('T')[0]
:''
});
}else{
setForm({
category:'',
description:'',
amount:'',
date:''
});
}
},[expense,open]);
const handleChange=e=>{
setForm(prev=>({
...prev,
[e.target.name]:e.target.value
}));
};
const handleSubmit=()=>{
if(
!form.category.trim()||
form.amount===''
){
return;
}
onSubmit?.({
...form,
amount:Number(form.amount)
});
};
return(
<Dialog
open={open}
onClose={loading?undefined:onClose}
fullWidth
maxWidth="sm"
>
<DialogTitle
sx={{
display:'flex',
justifyContent:'space-between',
alignItems:'center'
}}
>
{expense
?t('Edit Expense')
:t('Add Expense')
}
<IconButton
size="small"
disabled={loading}
onClick={onClose}
>
<CloseIcon/>
</IconButton>
</DialogTitle>
<DialogContent dividers>
<Stack spacing={2} sx={{mt:1}}>
<TextField
label={t('Category')}
name="category"
value={form.category}
onChange={handleChange}
fullWidth
required
/>
<TextField
label={t('Description')}
name="description"
value={form.description}
onChange={handleChange}
multiline
rows={3}
fullWidth
/>
<Grid container spacing={2}>
<Grid item xs={12} sm={6}>
<TextField
label={t('Amount')}
name="amount"
type="number"
value={form.amount}
onChange={handleChange}
fullWidth
required
inputProps={{
min:0,
step:'0.01'
}}
/>
</Grid>
<Grid item xs={12} sm={6}>
<TextField
label={t('Date')}
name="date"
type="date"
value={form.date}
onChange={handleChange}
InputLabelProps={{
shrink:true
}}
fullWidth
/>
</Grid>
</Grid>
</Stack>
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
disabled={loading}
onClick={handleSubmit}
>
{expense
?t('Update Expense')
:t('Add Expense')
}
</Button>
</DialogActions>
</Dialog>
);
};

export default ExpenseDialog;