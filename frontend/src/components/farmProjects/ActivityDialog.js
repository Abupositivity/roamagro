import React,{useEffect,useState}from'react';
import{
Dialog,
DialogTitle,
DialogContent,
DialogActions,
Button,
TextField,
MenuItem,
Grid,
IconButton,
Stack
}from'@mui/material';
import CloseIcon from'@mui/icons-material/Close';
import{useTranslation}from'react-i18next';

const categories=[
'Land Preparation',
'Planting',
'Irrigation',
'Weeding',
'Fertilizer',
'Pesticide',
'Harvest',
'Feeding',
'Vaccination',
'Maintenance',
'Other'
];

const priorities=[
'Low',
'Medium',
'High'
];

const statuses=[
'Pending',
'In Progress',
'Completed'
];

const emptyActivity={
title:'',
description:'',
category:'Other',
priority:'Medium',
status:'Pending',
dueDate:'',
notes:''
};

const ActivityDialog=({
open,
loading=false,
activity=null,
onClose,
onSubmit
})=>{

const{t}=useTranslation();
const[form,setForm]=useState(emptyActivity);

useEffect(()=>{
if(activity){
setForm({
title:activity.title||'',
description:activity.description||'',
category:activity.category||'Other',
priority:activity.priority||'Medium',
status:activity.status||'Pending',
dueDate:activity.dueDate?activity.dueDate.slice(0,10):'',
notes:activity.notes||''
});
}else{
setForm(emptyActivity);
}
},[activity,open]);

const handleChange=e=>{
setForm(prev=>({
...prev,
[e.target.name]:e.target.value
}));
};
const handleSubmit=()=>{
if(!form.title.trim())return;
onSubmit?.(form);
};
return(
<Dialog
open={open}
onClose={loading?undefined:onClose}
fullWidth
maxWidth="md"
>
<DialogTitle
sx={{
display:'flex',
justifyContent:'space-between',
alignItems:'center'
}}
>
{activity
?t('Edit Activity')
:t('New Activity')
}
<IconButton
onClick={onClose}
disabled={loading}
>
<CloseIcon/>
</IconButton>
</DialogTitle>
<DialogContent dividers>
<Stack spacing={2} sx={{mt:1}}>
<TextField
label={t('Title')}
name="title"
value={form.title}
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
<Grid item xs={12} md={4}>
<TextField
select
label={t('Category')}
name="category"
value={form.category}
onChange={handleChange}
fullWidth
>
{categories.map(item=>(
<MenuItem
key={item}
value={item}
>
{t(item)}
</MenuItem>
))}
</TextField>
</Grid>
<Grid item xs={12} md={4}>
<TextField
select
label={t('Priority')}
name="priority"
value={form.priority}
onChange={handleChange}
fullWidth
>
{priorities.map(item=>(
<MenuItem
key={item}
value={item}
>
{t(item)}
</MenuItem>
))}
</TextField>
</Grid>
<Grid item xs={12} md={4}>
<TextField
select
label={t('Status')}
name="status"
value={form.status}
onChange={handleChange}
fullWidth
>
{statuses.map(item=>(
<MenuItem
key={item}
value={item}
>
{t(item)}
</MenuItem>
))}
</TextField>
</Grid>
</Grid>
<TextField
label={t('Due Date')}
name="dueDate"
type="date"
value={form.dueDate}
onChange={handleChange}
InputLabelProps={{
shrink:true
}}
fullWidth
/>
<TextField
label={t('Notes')}
name="notes"
value={form.notes}
onChange={handleChange}
multiline
rows={4}
fullWidth
/>
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
onClick={handleSubmit}
disabled={loading}
>
{activity
?t('Update Activity')
:t('Create Activity')
}
</Button>
</DialogActions>
</Dialog>
);
};

export default ActivityDialog;