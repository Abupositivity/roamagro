import React,{useEffect,useState}from 'react';
import{Alert,Box,Button,Grid,MenuItem,Paper,Stack,TextField,Typography}from '@mui/material';
import{useTranslation}from 'react-i18next';

const initialState={
name:'',
description:'',
crop:'',
farmType:'Crop Farming',
category:'',
season:'Rainy Season',
farmSize:'',
measurementUnit:'Hectares',
location:'',
budget:'',
priority:'Medium',
status:'Planning',
startDate:'',
endDate:'',
weatherNotes:'',
tags:''
};
const farmTypes=[
'Crop Farming',
'Livestock',
'Poultry',
'Fishery',
'Mixed Farming',
'Other'
];
const seasons=[
'Dry Season',
'Rainy Season',
'All Season'
];
const units=[
'Hectares',
'Acres'
];
const priorities=[
'Low',
'Medium',
'High'
];
const statuses=[
'Planning',
'Active',
'Paused',
'Completed'
];
const FarmProjectForm=({
initialValues,
loading,
onSubmit,
submitLabel='Create Project'
})=>{

const{t}=useTranslation();
const[project,setProject]=useState(initialState);
const[errors,setErrors]=useState({});

useEffect(()=>{
if(initialValues){
setProject({
...initialState,
...initialValues,
tags:Array.isArray(initialValues.tags)?initialValues.tags.join(', '):''
});
}
},[initialValues]);
const handleChange=(e)=>{
const{name,value}=e.target;
setProject(prev=>({
...prev,
[name]:value
}));
};

const validate=()=>{
const validation={};
if(!project.name.trim())
validation.name=t('Project name is required');
if(!project.description.trim())
validation.description=t('Description is required');
if(project.description.trim().length<10)
validation.description=t('Description must be at least 10 characters');
if(!project.startDate)
validation.startDate=t('Start date is required');
if(!project.endDate)
validation.endDate=t('End date is required');
if(project.startDate&&project.endDate&&new Date(project.endDate)<new Date(project.startDate))
validation.endDate=t('End date must be after start date');
setErrors(validation);
return Object.keys(validation).length===0;
};
const handleSubmit=(e)=>{
e.preventDefault();
if(!validate())return;
const payload={
...project,
farmSize:Number(project.farmSize)||0,
budget:Number(project.budget)||0,
tags:project.tags
?project.tags.split(',').map(tag=>tag.trim()).filter(Boolean)
:[]
};
onSubmit(payload);
if(!initialValues){
setProject(initialState);
setErrors({});
}
};
return(
<Paper elevation={3} sx={{p:3,borderRadius:3}}>
<Box component="form" onSubmit={handleSubmit}>
<Stack spacing={2}>
<Typography variant="h6" fontWeight={700}>
{t(submitLabel)}
</Typography>
<TextField
label={t('Project Name')}
name="name"
value={project.name}
onChange={handleChange}
error={Boolean(errors.name)}
helperText={errors.name}
required
fullWidth
/>
<TextField
label={t('Description')}
name="description"
value={project.description}
onChange={handleChange}
error={Boolean(errors.description)}
helperText={errors.description}
multiline
rows={4}
required
fullWidth
/>
<Grid container spacing={2}>
<Grid item xs={12} md={6}>
<TextField
select
fullWidth
label={t('Farm Type')}
name="farmType"
value={project.farmType}
onChange={handleChange}
>
{farmTypes.map(type=>(
<MenuItem key={type} value={type}>
{t(type)}
</MenuItem>
))}
</TextField>
</Grid>
<Grid item xs={12} md={6}>
<TextField
label={t('Crop')}
name="crop"
value={project.crop}
onChange={handleChange}
fullWidth
/>
</Grid>
<Grid item xs={12} md={6}>
<TextField
label={t('Category')}
name="category"
value={project.category}
onChange={handleChange}
fullWidth
/>
</Grid>
<Grid item xs={12} md={6}>
<TextField
select
label={t('Season')}
name="season"
value={project.season}
onChange={handleChange}
fullWidth
>
{seasons.map(item=>(
<MenuItem key={item} value={item}>
{t(item)}
</MenuItem>
))}
</TextField>
</Grid>
<Grid item xs={12} md={6}>
<TextField
label={t('Farm Size')}
name="farmSize"
type="number"
value={project.farmSize}
onChange={handleChange}
fullWidth
/>
</Grid>
<Grid item xs={12} md={6}>
<TextField
select
label={t('Measurement Unit')}
name="measurementUnit"
value={project.measurementUnit}
onChange={handleChange}
fullWidth
>
{units.map(unit=>(
<MenuItem key={unit} value={unit}>
{t(unit)}
</MenuItem>
))}
</TextField>
</Grid>
<Grid item xs={12}>
<TextField
label={t('Location')}
name="location"
value={project.location}
onChange={handleChange}
fullWidth
/>
</Grid>
<Grid item xs={12} md={6}>
<TextField
label={t('Budget')}
name="budget"
type="number"
value={project.budget}
onChange={handleChange}
fullWidth
/>
</Grid>
<Grid item xs={12} md={6}>
<TextField
select
label={t('Priority')}
name="priority"
value={project.priority}
onChange={handleChange}
fullWidth
>
{priorities.map(priority=>(
<MenuItem key={priority} value={priority}>
{t(priority)}
</MenuItem>
))}
</TextField>
</Grid>
<Grid item xs={12} md={6}>
<TextField
select
label={t('Status')}
name="status"
value={project.status}
onChange={handleChange}
fullWidth
>
{statuses.map(status=>(
<MenuItem key={status} value={status}>
{t(status)}
</MenuItem>
))}
</TextField>
</Grid>
<Grid item xs={12} md={6}>
<TextField
label={t('Tags')}
name="tags"
value={project.tags}
onChange={handleChange}
helperText={t('Separate tags with commas')}
fullWidth
/>
</Grid>
<Grid item xs={12} md={6}>
<TextField
type="date"
label={t('Start Date')}
name="startDate"
value={project.startDate}
onChange={handleChange}
InputLabelProps={{shrink:true}}
error={Boolean(errors.startDate)}
helperText={errors.startDate}
fullWidth
required
/>
</Grid>
<Grid item xs={12} md={6}>
<TextField
type="date"
label={t('End Date')}
name="endDate"
value={project.endDate}
onChange={handleChange}
InputLabelProps={{shrink:true}}
error={Boolean(errors.endDate)}
helperText={errors.endDate}
fullWidth
required
/>
</Grid>
<Grid item xs={12}>
<TextField
label={t('Weather Notes')}
name="weatherNotes"
value={project.weatherNotes}
onChange={handleChange}
multiline
rows={3}
fullWidth
/>
</Grid>
</Grid>
{Object.keys(errors).length>0&&(
<Alert severity="warning">
{t('Please correct the highlighted fields.')}
</Alert>
)}
<Button
type="submit"
variant="contained"
size="large"
disabled={loading}
>
{loading?t('Saving...'):t(submitLabel)}
</Button>
</Stack>
</Box>
</Paper>
);
};

export default FarmProjectForm;