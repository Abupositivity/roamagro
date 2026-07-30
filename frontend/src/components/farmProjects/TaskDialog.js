import React,{useEffect,useState}from'react';
import{
Button,
Dialog,
DialogActions,
DialogContent,
DialogTitle,
Grid,
IconButton,
MenuItem,
Stack,
TextField
}from'@mui/material';
import CloseIcon from'@mui/icons-material/Close';
import {useTranslation}from'react-i18next';

const defaultTask={
title:'',
description:'',
priority:'Medium',
status:'Pending',
dueDate:'',
notes:''
};
const TaskDialog=({
open,
loading=false,
task=null,
onClose,
onSubmit
})=>{
const{t}=useTranslation();
const[form,setForm]=useState(defaultTask);

useEffect(()=>{
if(task){
setForm({
title:task.title||'',
description:task.description||'',
priority:task.priority||'Medium',
status:task.status||'Pending',
dueDate:task.dueDate
?new Date(task.dueDate).toISOString().split('T')[0]
:'',
notes:task.notes||''
});
}else{
setForm(defaultTask);
}
},[task,open]);
const handleChange=e=>{
setForm(prev=>({
...prev,
[e.target.name]:e.target.value
}));
};
const handleSubmit=e=>{
e.preventDefault();
onSubmit?.(form);
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
{task
?t('Edit Task')
:t('Add Task')
}
<IconButton
onClick={onClose}
disabled={loading}
size="small"
>
<CloseIcon/>
</IconButton>
</DialogTitle>
<form onSubmit={handleSubmit}>
<DialogContent dividers>
<Stack spacing={2}>
<TextField
label={t('Title')}
name="title"
value={form.title}
onChange={handleChange}
required
fullWidth
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
<Grid
container
spacing={2}
>
<Grid item xs={12} sm={6}>
<TextField
select
fullWidth
label={t('Priority')}
name="priority"
value={form.priority}
onChange={handleChange}
>
<MenuItem value="Low">
{t('Low')}
</MenuItem>
<MenuItem value="Medium">
{t('Medium')}
</MenuItem>
<MenuItem value="High">
{t('High')}
</MenuItem>
</TextField>
</Grid>
<Grid item xs={12} sm={6}>
<TextField
select
fullWidth
label={t('Status')}
name="status"
value={form.status}
onChange={handleChange}
>
<MenuItem value="Pending">
{t('Pending')}
</MenuItem>
<MenuItem value="In Progress">
{t('In Progress')}
</MenuItem>
<MenuItem value="Completed">
{t('Completed')}
</MenuItem>
</TextField>
</Grid>
<Grid item xs={12}>
<TextField
fullWidth
type="date"
label={t('Due Date')}
name="dueDate"
value={form.dueDate}
onChange={handleChange}
InputLabelProps={{
shrink:true
}}
/>
</Grid>
</Grid>
<TextField
label={t('Notes')}
name="notes"
value={form.notes}
onChange={handleChange}
multiline
rows={3}
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
type="submit"
variant="contained"
disabled={loading}
>
{task
?t('Update Task')
:t('Create Task')
}
</Button>
</DialogActions>
</form>
</Dialog>
);
};

export default TaskDialog;