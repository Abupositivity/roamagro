import React from 'react';
import {
Card,
CardContent,
Chip,
Divider,
Stack,
Typography
} from '@mui/material';
import {
TrendingUp,
TrendingDown
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

const ProjectProfitCard=({project})=>{
const{t}=useTranslation();
const{
name,
status,
income=0,
expenses=0,
profit=0
}=project;

const profitable=profit>=0;
return(
<Card
elevation={2}
sx={{
height:'100%'
}}
>
<CardContent>
<Stack
direction="row"
justifyContent="space-between"
alignItems="center"
mb={2}
>
<Typography
variant="h6"
fontWeight={700}
>
{name}
</Typography>
<Chip
label={status}
size="small"
color={
status==='Completed'
?'success'
:status==='Active'
?'primary'
:'default'
}
/>
</Stack>
<Divider sx={{mb:2}}/>
<Stack spacing={2}>
<Stack
direction="row"
justifyContent="space-between"
>
<Typography color="text.secondary">
{t('Income')}
</Typography>
<Typography
fontWeight={600}
color="success.main"
>
₦{income.toLocaleString()}
</Typography>
</Stack>
<Stack
direction="row"
justifyContent="space-between"
>
<Typography color="text.secondary">
{t('Expenses')}
</Typography>
<Typography
fontWeight={600}
color="error.main"
>
₦{expenses.toLocaleString()}
</Typography>
</Stack>
<Divider/>
<Stack
direction="row"
justifyContent="space-between"
alignItems="center"
>
<Typography fontWeight={700}>
{profitable
?t('Profit')
:t('Loss')
}
</Typography>
<Stack
direction="row"
spacing={1}
alignItems="center"
>
{profitable?
<TrendingUp color="success"/>
:
<TrendingDown color="error"/>
}
<Typography
fontWeight={700}
color={
profitable
?'success.main'
:'error.main'
}
>
₦{Math.abs(profit).toLocaleString()}
</Typography>
</Stack>
</Stack>
</Stack>
</CardContent>
</Card>
);
};

export default ProjectProfitCard;