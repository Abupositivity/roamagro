import React from 'react';
import {
Card,
CardContent,
Grid,
Typography,
Chip
} from '@mui/material';
import {useTranslation} from 'react-i18next';

const formatCurrency=value=>
`₦${Number(value||0).toLocaleString()}`;

const CashFlowCard=({cashFlow})=>{
const{t}=useTranslation();

const isProfit=(cashFlow.profit||0)>=0;
return(
<Card>
<CardContent>
<Typography
variant="h6"
fontWeight={700}
gutterBottom
>
{cashFlow.month}
</Typography>
<Grid container spacing={2}>
<Grid item xs={4}>
<Typography variant="body2" color="text.secondary">
{t('Income')}
</Typography>
<Typography
fontWeight={600}
color="success.main"
>
{formatCurrency(cashFlow.income)}
</Typography>
</Grid>
<Grid item xs={4}>
<Typography variant="body2" color="text.secondary">
{t('Expenses')}
</Typography>
<Typography
fontWeight={600}
color="error.main"
>
{formatCurrency(cashFlow.expenses)}
</Typography>
</Grid>
<Grid item xs={4}>
<Typography variant="body2" color="text.secondary">
{isProfit?t('Profit'):t('Loss')}
</Typography>
<Typography
fontWeight={700}
color={isProfit?'primary.main':'error.main'}
>
{formatCurrency(Math.abs(cashFlow.profit))}
</Typography>
</Grid>
</Grid>
<Chip
sx={{mt:2}}
size="small"
label={isProfit?t('Profitable'):t('Loss')}
color={isProfit?'success':'error'}
/>
</CardContent>
</Card>
);
};

export default CashFlowCard;