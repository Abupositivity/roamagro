import React from 'react';
import {
Grid,
Card,
CardContent,
Typography,
Stack
} from '@mui/material';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SellIcon from '@mui/icons-material/Sell';
import {useTranslation} from 'react-i18next';

const SummaryCard=({
title,
value,
icon
})=>(
<Card
sx={{
height:'100%'
}}
>
<CardContent>

<Stack
spacing={1}
alignItems="center"
>

{icon}

<Typography
variant="h4"
fontWeight={700}
>

{value}

</Typography>

<Typography
variant="body2"
color="text.secondary"
>

{title}

</Typography>

</Stack>

</CardContent>
</Card>
);

const MarketplaceSummaryCards=({
listings=[]
})=>{

const{t}=useTranslation();

const total=listings.length;

const available=listings.filter(
item=>item.available
).length;

const sold=total-available;

return(

<Grid
container
spacing={2}
mb={3}
>

<Grid item xs={12} md={4}>

<SummaryCard
title={t('Total Listings')}
value={total}
icon={<Inventory2Icon color="primary" fontSize="large"/>}
/>

</Grid>

<Grid item xs={12} md={4}>

<SummaryCard
title={t('Available')}
value={available}
icon={<CheckCircleIcon color="success" fontSize="large"/>}
/>

</Grid>

<Grid item xs={12} md={4}>

<SummaryCard
title={t('Sold')}
value={sold}
icon={<SellIcon color="error" fontSize="large"/>}
/>

</Grid>

</Grid>

);

};

export default MarketplaceSummaryCards;