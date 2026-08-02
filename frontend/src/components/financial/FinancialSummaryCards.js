import React from 'react';
import {
Grid,
Card,
CardContent,
Typography,
Stack
} from '@mui/material';
import {
TrendingUp,
TrendingDown,
AccountBalanceWallet,
Agriculture
} from '@mui/icons-material';
import {useTranslation} from 'react-i18next';

const FinancialSummaryCards=({dashboard})=>{
const{t}=useTranslation();

const cards=[
{
title:t('Total Income'),
value:`₦${(dashboard?.totalIncome||0).toLocaleString()}`,
icon:<TrendingUp color="success"/>,
color:'success.main'
},
{
title:t('Total Expenses'),
value:`₦${(dashboard?.totalExpenses||0).toLocaleString()}`,
icon:<TrendingDown color="error"/>,
color:'error.main'
},
{
title:t('Profit'),
value:`₦${(dashboard?.totalProfit||0).toLocaleString()}`,
icon:<AccountBalanceWallet color="primary"/>,
color:'primary.main'
},
{
title:t('Active Projects'),
value:dashboard?.activeProjects||0,
icon:<Agriculture color="success"/>,
color:'success.main'
}
];
return(
<Grid container spacing={3}>
{cards.map(card=>(
<Grid
item
xs={12}
sm={6}
md={3}
key={card.title}
>
<Card elevation={3}>
<CardContent>
<Stack
direction="row"
justifyContent="space-between"
alignItems="center"
>
<Stack spacing={1}>
<Typography
variant="body2"
color="text.secondary"
>
{card.title}
</Typography>
<Typography
variant="h5"
fontWeight={700}
sx={{color:card.color}}
>
{card.value}
</Typography>
</Stack>
{card.icon}
</Stack>
</CardContent>
</Card>
</Grid>
))}
</Grid>
);
};

export default FinancialSummaryCards;