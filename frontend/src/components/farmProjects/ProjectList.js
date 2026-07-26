import React from 'react';
import{
Box,
Button,
Grid,
Typography
}from'@mui/material';
import{useTranslation}from'react-i18next';
import FarmProjectCard from'./FarmProjectCard';

const ProjectList=({
projects=[],
onView,
onEdit,
onDelete,
onCreate
})=>{
const{t}=useTranslation();

if(!projects.length){
return(
<Box
textAlign="center"
py={8}
>
<Typography
variant="h5"
fontWeight={700}
gutterBottom
>
🌱 {t('No farm projects yet')}
</Typography>

<Typography
color="text.secondary"
mb={3}
>
{t('Create your first farm project to begin tracking activities, expenses and harvests.')}
</Typography>

<Button
variant="contained"
onClick={onCreate}
>
{t('Create Project')}
</Button>
</Box>
);
}

return(
<Grid container spacing={3}>
{projects.map(project=>(
<Grid
item
xs={12}
md={6}
lg={4}
key={project._id}
>
<FarmProjectCard
project={project}
onView={onView}
onEdit={onEdit}
onDelete={onDelete}
/>
</Grid>
))}
</Grid>
);
};

export default ProjectList;