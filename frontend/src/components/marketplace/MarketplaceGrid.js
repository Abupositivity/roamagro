import React from 'react';
import {
Grid,
Alert,
Typography,
CircularProgress,
Box
} from '@mui/material';
import Button from '@mui/material/Button';
import {useTranslation} from 'react-i18next';
import MarketplaceCard from './MarketplaceCard';

const MarketplaceGrid=({
listings=[],
loading=false,
error=null,
onEdit,
onDelete,
onToggleAvailability,
onCreate
})=>{
const{t}=useTranslation();
if(loading){
return(
<Box
display="flex"
justifyContent="center"
py={6}
>
<CircularProgress/>
</Box>
);
}
if(error){
return(
<Alert severity="error">
{error}
</Alert>
);
}
if(!listings.length){
return(
<Box
textAlign="center"
py={8}
>
<Typography
variant="h6"
gutterBottom
>
🌾 {t('No listings match your search.')}
</Typography>
<Typography
color="text.secondary"
mb={3}
>
{t('Try another category or create the first listing.')}
</Typography>
<Button
variant="contained"
onClick={onCreate}
>
{t('Create Listing')}
</Button>
</Box>
);
}
return(
<>
<Typography
variant="h5"
fontWeight={700}
mb={3}
>
{t('Marketplace Listings')}
</Typography>
<Grid container spacing={3}>
{listings.map(listing=>(
<Grid
item
xs={12}
sm={6}
md={4}
lg={3}
key={listing._id}
>
<MarketplaceCard
listing={listing}
onEdit={onEdit}
onDelete={onDelete}
onToggleAvailability={onToggleAvailability}
/>
</Grid>
))}
</Grid>
</>
);
};

export default MarketplaceGrid;