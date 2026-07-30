import React from 'react';
import {
Card,
CardContent,
Typography,
Stack,
Chip,
IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
//import {useTranslation} from 'react-i18next';

const priorityColours={
Low:'success',
Medium:'warning',
High:'error'
};

const statusColours={
Pending:'default',
'In Progress':'info',
Completed:'success'
};

const ActivityCard=({
activity,
onEdit,
onDelete
})=>{

//const{t}=useTranslation();

const overdue=
activity.status!=='Completed'&&
activity.dueDate&&
new Date(activity.dueDate)<new Date();
return(
<Card
sx={{
borderRadius:3,
borderLeft:overdue?'4px solid #d32f2f':'4px solid transparent'
}}
>
<CardContent>
<Stack
direction="row"
justifyContent="space-between"
alignItems="flex-start"
spacing={2}
>
<Stack spacing={1} flex={1}>
<Typography
variant="h6"
fontWeight={600}
>
{activity.title}
</Typography>
{activity.description&&(
<Typography
variant="body2"
color="text.secondary"
>
{activity.description}
</Typography>
)}
<Stack
direction="row"
spacing={1}
flexWrap="wrap"
>
<Chip
size="small"
label={activity.category}
variant="outlined"
/>
<Chip
size="small"
label={activity.priority}
color={priorityColours[activity.priority]||'default'}
/>
<Chip
size="small"
label={activity.status}
color={statusColours[activity.status]||'default'}
/>
</Stack>
{activity.dueDate&&(
<Stack
direction="row"
spacing={1}
alignItems="center"
>
<CalendarMonthIcon fontSize="small"/>
<Typography
variant="caption"
color={overdue?'error':'text.secondary'}
>
{new Date(activity.dueDate).toLocaleDateString()}
</Typography>
</Stack>
)}
</Stack>
<Stack>
<IconButton
size="small"
onClick={()=>onEdit(activity)}
>
<EditIcon fontSize="small"/>
</IconButton>
<IconButton
size="small"
color="error"
onClick={()=>onDelete(activity)}
>
<DeleteIcon fontSize="small"/>
</IconButton>
</Stack>
</Stack>
</CardContent>
</Card>
);
};

export default ActivityCard;