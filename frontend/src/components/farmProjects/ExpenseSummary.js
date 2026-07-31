import React,{useMemo}from'react';
import{
Card,
CardContent,
Grid,
Stack,
Typography,
LinearProgress
}from'@mui/material';
import {useTranslation}from'react-i18next';

const ExpenseSummary=({
project
})=>{

const{t}=useTranslation();

const summary=useMemo(()=>{

const expenses=(project?.expenses||[]).reduce(
(total,item)=>total+(item.amount||0),
0
);

const income=(project?.harvests||[]).reduce(
(total,item)=>total+(item.totalValue||0),
0
);

const budget=project?.budget||0;
const profit=income-expenses;
const budgetUsed=budget>0
?(expenses/budget)*100
:0;
return{
expenses,
income,
profit,
budget,
budgetUsed:Math.min(
Math.round(budgetUsed),
100
)
};
},[project]);
return(
<Card sx={{mb:3}}>
<CardContent>
<Grid container spacing={3}>
<Grid item xs={6} md={3}>
<Stack spacing={1}>
<Typography
variant="body2"
color="text.secondary"
>
{t('Budget')}
</Typography>
<Typography
variant="h6"
fontWeight={700}
>
₦{summary.budget.toLocaleString()}
</Typography>
</Stack>
</Grid>
<Grid item xs={6} md={3}>
<Stack spacing={1}>
<Typography
variant="body2"
color="text.secondary"
>
{t('Expenses')}
</Typography>
<Typography
variant="h6"
fontWeight={700}
color="error.main"
>
₦{summary.expenses.toLocaleString()}
</Typography>
</Stack>
</Grid>
<Grid item xs={6} md={3}>
<Stack spacing={1}>
<Typography
variant="body2"
color="text.secondary"
>
{t('Income')}
</Typography>
<Typography
variant="h6"
fontWeight={700}
color="success.main"
>
₦{summary.income.toLocaleString()}
</Typography>
</Stack>
</Grid>
<Grid item xs={6} md={3}>
<Stack spacing={1}>
<Typography
variant="body2"
color="text.secondary"
>
{t('Profit')}
</Typography>
<Typography
variant="h6"
fontWeight={700}
color={
summary.profit>=0
?'success.main'
:'error.main'
}
>
₦{summary.profit.toLocaleString()}
</Typography>
</Stack>
</Grid>
</Grid>
{summary.budget>0&&(
<Stack
spacing={1}
mt={4}
>
<Stack
direction="row"
justifyContent="space-between"
>
<Typography variant="body2">
{t('Budget Used')}
</Typography>
<Typography variant="body2">
{summary.budgetUsed}%
</Typography>
</Stack>
<LinearProgress
variant="determinate"
value={summary.budgetUsed}
/>
</Stack>
)}
</CardContent>
</Card>
);
};

export default ExpenseSummary;