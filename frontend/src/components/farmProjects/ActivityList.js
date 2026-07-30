import React,{useMemo,useState}from'react';
import{
Alert,
Box,
Grid,
InputAdornment,
MenuItem,
Stack,
TextField
}from'@mui/material';
import SearchIcon from'@mui/icons-material/Search';
import{useTranslation}from'react-i18next';
import ActivityCard from'./ActivityCard';

const ActivityList=({
activities=[],
onEdit,
onDelete
})=>{

const{t}=useTranslation();
const[search,setSearch]=useState('');
const[sortBy,setSortBy]=useState('dueDate');

const filteredActivities=useMemo(()=>{

const keyword=search.trim().toLowerCase();
let data=[...activities];
if(keyword){
data=data.filter(activity=>
(activity.title||'').toLowerCase().includes(keyword)||
(activity.description||'').toLowerCase().includes(keyword)||
(activity.category||'').toLowerCase().includes(keyword)
);
}
switch(sortBy){
case'priority':
{
const order={
High:3,
Medium:2,
Low:1
};
data.sort(
(a,b)=>
(order[b.priority]||0)-
(order[a.priority]||0)
);
break;
}
case'status':
{
const order={
Pending:1,
'In Progress':2,
Completed:3
};
data.sort(
(a,b)=>
(order[a.status]||0)-
(order[b.status]||0)
);
break;
}
case'title':
data.sort((a,b)=>
(a.title||'').localeCompare(b.title||'')
);
break;
default:
data.sort((a,b)=>{
if(!a.dueDate&&!b.dueDate)return 0;
if(!a.dueDate)return 1;
if(!b.dueDate)return-1;
return new Date(a.dueDate)-new Date(b.dueDate);
});
}
return data;
},[activities,search,sortBy]);
if(!activities.length){
return(
<Alert severity="info">
{t('No activities yet.')}
</Alert>
);
}
return(
<Stack spacing={3}>
<Box>
<Grid container spacing={2}>
<Grid item xs={12} md={8}>
<TextField
fullWidth
placeholder={t('Search activities...')}
value={search}
onChange={e=>setSearch(e.target.value)}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<SearchIcon/>
</InputAdornment>
)
}}
/>
</Grid>
<Grid item xs={12} md={4}>
<TextField
select
fullWidth
label={t('Sort')}
value={sortBy}
onChange={e=>setSortBy(e.target.value)}
>
<MenuItem value="dueDate">
{t('Due Date')}
</MenuItem>
<MenuItem value="priority">
{t('Priority')}
</MenuItem>
<MenuItem value="status">
{t('Status')}
</MenuItem>
<MenuItem value="title">
{t('Title')}
</MenuItem>
</TextField>
</Grid>
</Grid>
</Box>
<Grid container spacing={2}>
{filteredActivities.map(activity=>(
<Grid
item
xs={12}
key={activity._id}
>
<ActivityCard
activity={activity}
onEdit={onEdit}
onDelete={onDelete}
/>
</Grid>
))}
</Grid>
</Stack>
);
};

export default ActivityList;