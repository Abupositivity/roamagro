import React,{useMemo}from'react';
import{
Box,
Card,
CardContent,
LinearProgress,
Stack,
Typography,
Chip
}from'@mui/material';
import CheckCircleIcon from'@mui/icons-material/CheckCircle';
import PendingActionsIcon from'@mui/icons-material/PendingActions';
import WarningAmberIcon from'@mui/icons-material/WarningAmber';
import {useTranslation}from'react-i18next';

const ActivityProgress=({activities=[]})=>{
const{t}=useTranslation();
const stats=useMemo(()=>{
const total=activities.length;
const completed=activities.filter(
activity=>activity.status==='Completed'
).length;
const pending=activities.filter(
activity=>activity.status!=='Completed'
).length;
const overdue=activities.filter(activity=>
activity.status!=='Completed'&&
activity.dueDate&&
new Date(activity.dueDate)<new Date()
).length;
const progress=total===0
?0
:Math.round((completed/total)*100);
return{
total,
completed,
pending,
overdue,
progress
};
},[activities]);
const progressColour=
stats.progress>=80
?'success'
:stats.progress>=40
?'warning'
:'error';
return(
<Card
sx={{
borderRadius:3
}}
>
<CardContent>
<Stack spacing={2}>
<Box>
<Stack
direction="row"
justifyContent="space-between"
alignItems="center"
>
<Typography
variant="h6"
fontWeight={600}
>
{t('Project Progress')}
</Typography>
<Typography
variant="h6"
fontWeight={700}
>
{stats.progress}%
</Typography>
</Stack>
<LinearProgress
variant="determinate"
value={stats.progress}
color={progressColour}
sx={{
height:10,
borderRadius:5,
mt:1
}}
/>
</Box>
<Stack
direction="row"
spacing={1}
flexWrap="wrap"
>
<Chip
icon={<CheckCircleIcon/>}
label={`${stats.completed} ${t('Completed')}`}
color="success"
/>
<Chip
icon={<PendingActionsIcon/>}
label={`${stats.pending} ${t('Pending')}`}
color="warning"
/>
<Chip
icon={<WarningAmberIcon/>}
label={`${stats.overdue} ${t('Overdue')}`}
color={stats.overdue?'error':'default'}
/>
<Chip
label={`${stats.total} ${t('Activities')}`}
variant="outlined"
/>
</Stack>
</Stack>
</CardContent>
</Card>
);
};

export default ActivityProgress;