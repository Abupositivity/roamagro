import React from'react';
import{
Card,
CardContent,
Chip,
IconButton,
Stack,
Typography,
Tooltip
}from'@mui/material';
import CheckCircleIcon from'@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from'@mui/icons-material/RadioButtonUnchecked';
import EditIcon from'@mui/icons-material/Edit';
import DeleteIcon from'@mui/icons-material/Delete';
import EventIcon from'@mui/icons-material/Event';
import FlagIcon from'@mui/icons-material/Flag';
import {useTranslation}from'react-i18next';

const TaskCard=({
task,
loading=false,
onEdit,
onDelete,
onToggleStatus
})=>{
const{t}=useTranslation();
const completed=task.status==='Completed';
const priorityColor={
Low:'success',
Medium:'warning',
High:'error'
}[task.priority]||'default';
return(
<Card
variant="outlined"
sx={{
mb:2,
borderRadius:3
}}
>
<CardContent>
<Stack
direction="row"
justifyContent="space-between"
alignItems="flex-start"
spacing={2}
>
<Stack
spacing={1}
flex={1}
>
<Typography
variant="h6"
sx={{
textDecoration:completed?'line-through':'none'
}}
>
{task.title}
</Typography>
{task.description&&(
<Typography
variant="body2"
color="text.secondary"
>
{task.description}
</Typography>
)}
<Stack
direction="row"
spacing={1}
flexWrap="wrap"
>
<Chip
size="small"
label={task.status}
color={
completed
?'success'
:'warning'
}
/>
<Chip
size="small"
icon={<FlagIcon/>}
label={task.priority||'Medium'}
color={priorityColor}
/>
{task.dueDate&&(
<Chip
size="small"
icon={<EventIcon/>}
label={new Date(
task.dueDate
).toLocaleDateString()}
/>
)}
</Stack>
{task.notes&&(
<Typography
variant="caption"
color="text.secondary"
>
{task.notes}
</Typography>
)}
</Stack>
<Stack>
<Tooltip
title={
completed
?t('Mark Pending')
:t('Mark Completed')
}
>
<IconButton
onClick={()=>
onToggleStatus?.(task)
}
disabled={loading}
color={
completed
?'success'
:'default'
}
>
{completed
?<CheckCircleIcon/>
:<RadioButtonUncheckedIcon/>
}
</IconButton>
</Tooltip>
<Tooltip title={t('Edit')}>
<IconButton
onClick={()=>
onEdit?.(task)
}
disabled={loading}
>
<EditIcon/>
</IconButton>
</Tooltip>
<Tooltip title={t('Delete')}>
<IconButton
onClick={()=>
onDelete?.(task)
}
disabled={loading}
color="error"
>
<DeleteIcon/>
</IconButton>
</Tooltip>
</Stack>
</Stack>
</CardContent>
</Card>
);
};

export default TaskCard;