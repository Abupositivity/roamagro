import React,{useEffect} from 'react';
import {useDispatch,useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

import{
Alert,
Box,
CircularProgress,
Grid,
Typography
}from'@mui/material';

import {fetchProjectProfitability}
from'../../redux/actions/financialActions';

import ProjectProfitCard
from'./ProjectProfitCard';

const ProjectProfitability=()=>{
const{t}=useTranslation();
const dispatch=useDispatch();

const{
loading,
error,
projectProfitability=[]
}=useSelector(
state=>state.financial
);
useEffect(()=>{
dispatch(
fetchProjectProfitability()
);
},[dispatch]);
if(loading){
return(
<Box
display="flex"
justifyContent="center"
py={4}
>
<CircularProgress/>
</Box>
);
}
if(error){
return(
<Alert
severity="error"
sx={{mt:3}}
>
{error}
</Alert>
);
}
return(
<Box mt={5}>
<Typography
variant="h5"
fontWeight={700}
mb={3}
>
{t('Project Profitability')}
</Typography>
<Grid
container
spacing={3}
>
{projectProfitability.map(project=>(
<Grid
item
xs={12}
md={6}
lg={4}
key={project._id}
>
<ProjectProfitCard
project={project}
/>
</Grid>
))}
</Grid>
</Box>
);
};

export default ProjectProfitability;