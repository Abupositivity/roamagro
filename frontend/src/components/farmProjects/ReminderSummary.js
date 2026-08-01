import React,{useMemo}from'react';
import{
Card,
CardContent,
Grid,
Stack,
Typography
}from'@mui/material';
import {useTranslation}from'react-i18next';

const ReminderSummary=({project})=>{
const{t}=useTranslation();

const summary=useMemo(()=>{
const reminders=project?.reminders||[];

const completed=reminders.filter(
item=>item.completed
).length;

const pending=reminders.length-completed;

return{
total:reminders.length,
completed,
pending
};
},[project]);

return(
<Card sx={{mb:3}}>
<CardContent>
<Grid container spacing={3}>
<Grid item xs={4}>
<Stack spacing={1}>
<Typography color="text.secondary">
{t('Total')}
</Typography>
<Typography variant="h5" fontWeight={700}>
{summary.total}
</Typography>
</Stack>
</Grid>
<Grid item xs={4}>
<Stack spacing={1}>
<Typography color="text.secondary">
{t('Completed')}
</Typography>
<Typography
variant="h5"
fontWeight={700}
color="success.main"
>
{summary.completed}
</Typography>
</Stack>
</Grid>
<Grid item xs={4}>
<Stack spacing={1}>
<Typography color="text.secondary">
{t('Pending')}
</Typography>
<Typography
variant="h5"
fontWeight={700}
color="warning.main"
>
{summary.pending}
</Typography>
</Stack>
</Grid>
</Grid>
</CardContent>
</Card>
);
};

export default ReminderSummary;