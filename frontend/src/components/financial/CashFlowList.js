import React from 'react';
import {
Alert,
Grid,
Typography
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import CashFlowCard from './CashFlowCard';

const CashFlowList=({
cashFlow=[],
loading
})=>{

const{t}=useTranslation();
if(loading)return null;
if(!cashFlow.length){
return(
<Alert severity="info">
{t('No cash flow records available.')}
</Alert>
);
}
return(
<>
<Typography
variant="h5"
fontWeight={700}
mb={2}
>
{t('Monthly Cash Flow')}
</Typography>
<Grid container spacing={3}>
{cashFlow.map(item=>(
<Grid
item
xs={12}
md={6}
lg={4}
key={item.month}
>
<CashFlowCard cashFlow={item}/>
</Grid>
))}
</Grid>
</>
);
};

export default CashFlowList;