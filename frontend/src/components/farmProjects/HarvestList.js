import React from'react';
import{
Alert,
Grid
}from'@mui/material';
import {useTranslation}from'react-i18next';
import HarvestCard from'./HarvestCard';

const HarvestList=({
harvests=[],
loading=false,
onEdit,
onDelete
})=>{
const{t}=useTranslation();
if(!harvests.length){
return(
<Alert severity="info">
{t('No harvests recorded yet.')}
</Alert>
);
}
return(
<Grid container spacing={3}>
{harvests.map(harvest=>(
<Grid
item
xs={12}
md={6}
lg={4}
key={harvest._id}
>
<HarvestCard
harvest={harvest}
loading={loading}
onEdit={onEdit}
onDelete={onDelete}
/>
</Grid>
))}
</Grid>
);
};

export default HarvestList;