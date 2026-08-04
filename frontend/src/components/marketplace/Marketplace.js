import React,{useEffect,useState}from'react';
import {useDispatch,useSelector}from'react-redux';
import {useTranslation}from'react-i18next';

import{
Container,
Typography,
Box,
Button,
Alert,
CircularProgress,
FormControlLabel,
Switch
}from'@mui/material';

import AddIcon from'@mui/icons-material/Add';

import{
fetchListings,
createListing,
updateListing,
deleteListing
}from'../../redux/actions/marketplaceActions';

import MarketplaceGrid from'./MarketplaceGrid';
import MarketplaceDialog from'./MarketplaceDialog';
import DeleteMarketplaceDialog from'./DeleteMarketplaceDialog';
import MarketplaceSearchBar from './MarketplaceSearchBar';
import CategoryFilter from './CategoryFilter';
import MarketplaceSummaryCards from './MarketplaceSummaryCards';
import AvailabilityFilter from './AvailabilityFilter';

const Marketplace=()=>{
const{t}=useTranslation();
const dispatch=useDispatch();

const{
listings,
loading,
error
}=useSelector(state=>state.marketplace);

const{user}=useSelector(state=>state.auth);

const[dialogOpen,setDialogOpen]=useState(false);
const[selectedListing,setSelectedListing]=useState(null);
const[deleteDialogOpen,setDeleteDialogOpen]=useState(false);
const[search,setSearch]=useState('');
const[selectedCategory,setSelectedCategory]=useState('All');
const[showMine,setShowMine]=useState(false);
const[availability,setAvailability]=useState('All');

useEffect(()=>{
dispatch(fetchListings());
},[dispatch]);

const filteredListings=(listings||[]).filter(listing=>{
const keyword=search.toLowerCase();
const matchesSearch=
(listing.title||'').toLowerCase().includes(keyword)||
(listing.location||'').toLowerCase().includes(keyword)||
(listing.category||'').toLowerCase().includes(keyword);

const matchesCategory=
selectedCategory==='All'||
listing.category===selectedCategory;

const matchesAvailability=
availability==='All'
||
(availability==='Available'&&listing.available)

||
(availability==='Sold'&&!listing.available);

const matchesOwner=
!showMine||
listing.user?._id===user?._id;

return matchesSearch&&matchesCategory&&matchesAvailability&&matchesOwner;
});

/*
|--------------------------------------------------------------------------
| Create Listing
|--------------------------------------------------------------------------
*/
const handleCreate=()=>{
setSelectedListing(null);
setDialogOpen(true);
};

/*
|--------------------------------------------------------------------------
| Edit Listing
|--------------------------------------------------------------------------
*/
const handleEditListing=listing=>{
setSelectedListing(listing);
setDialogOpen(true)
};

/*
|--------------------------------------------------------------------------
| Close Dialog
|--------------------------------------------------------------------------
*/
const handleCloseDialog=()=>{
if(loading)return;
setSelectedListing(null);
setDialogOpen(false);
};

/*
|--------------------------------------------------------------------------
| Delete Listing
|--------------------------------------------------------------------------
*/
const handleDeleteListing=listing=>{
setSelectedListing(listing);
setDeleteDialogOpen(true);
};
const handleCloseDeleteDialog=()=>{
if(loading)return;
setSelectedListing(null);
setDeleteDialogOpen(false);
};

/*
|--------------------------------------------------------------------------
| Submit/ save
|--------------------------------------------------------------------------
*/
const handleSubmit=data=>{
if(selectedListing){
dispatch(
updateListing(
selectedListing._id,
data
)
);
}else{
dispatch(
createListing(data)
);
}
handleCloseDialog();
};

/*
|--------------------------------------------------------------------------
| Confirm Delete
|--------------------------------------------------------------------------
*/
const handleDelete=()=>{
if(selectedListing){
dispatch(
deleteListing(
selectedListing._id
)
);
}
handleCloseDeleteDialog();
};

const handleToggleAvailability=listing=>{
dispatch(
updateListing(
listing._id,
{
available:!listing.available
}
)
);
};

return(
<Container
maxWidth="xl"
sx={{
py:3,
pb:10
}}
>
<Box
display="flex"
justifyContent="space-between"
alignItems="center"
mb={4}
flexWrap="wrap"
gap={2}
>
<Box>
<Typography
variant="h4"
fontWeight={700}
>
{t('Marketplace')}
</Typography>
<Typography
variant="body1"
color="text.secondary"
>
{t('Buy and sell agricultural products.')}
</Typography>
</Box>
<Button
variant="contained"
startIcon={<AddIcon/>}
onClick={handleCreate}
>
{t('Create Listing')}
</Button>
</Box>

<MarketplaceSummaryCards
listings={filteredListings}
/>

<MarketplaceSearchBar
value={search}
onChange={setSearch}
/>

<CategoryFilter
selected={selectedCategory}
onChange={setSelectedCategory}
/>

<AvailabilityFilter
value={availability}
onChange={setAvailability}
/>

<FormControlLabel
control={
<Switch
checked={showMine}
onChange={e=>setShowMine(e.target.checked)}
/>
}
label={t('Show My Listings')}
sx={{mb:3}}
/>

{loading&&(
<Box
display="flex"
justifyContent="center"
py={6}
>
<CircularProgress/>
</Box>
)}
{error&&(
<Alert
severity="error"
sx={{mb:3}}
>
{error}
</Alert>
)}

{!loading&&(
<MarketplaceGrid
listings={filteredListings}
loading={loading}
error={error}
onEdit={handleEditListing}
onDelete={handleDeleteListing}
onToggleAvailability={handleToggleAvailability}
onCreate={handleCreate}
/>
)}

<MarketplaceDialog
open={dialogOpen}
loading={loading}
listing={selectedListing}
onClose={handleCloseDialog}
onSubmit={handleSubmit}
/>

<DeleteMarketplaceDialog
open={deleteDialogOpen}
loading={loading}
listing={selectedListing}
onClose={handleCloseDeleteDialog}
onConfirm={handleDelete}
/>
</Container>
);
};

export default Marketplace;