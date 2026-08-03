import React from 'react';
import {
Card,
CardContent,
Chip,
Stack,
Typography,
Button,
IconButton
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PhoneIcon from '@mui/icons-material/Phone';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import {useTranslation} from 'react-i18next';

import MarketplaceImage from './MarketplaceImage';

const formatPrice=value=>
`₦${Number(value||0).toLocaleString()}`;

const MarketplaceCard=({
listing,
onEdit,
onDelete,
onToggleAvailability
})=>{

const{t}=useTranslation();
const sellerPhone=listing.user?.phone||'';
const whatsappLink=sellerPhone
?`https://wa.me/${sellerPhone.replace(/\D/g,'')}`
:null;

return(
<Card
sx={{
height:'100%',
display:'flex',
flexDirection:'column',
borderRadius:3
}}
>
<MarketplaceImage
images={listing.images||[]}
/>
<CardContent sx={{flexGrow:1}}>
<Stack
direction="row"
justifyContent="space-between"
alignItems="flex-start"
spacing={1}
mb={1}
>
<Typography
variant="h6"
fontWeight={700}
>
{listing.title}
</Typography>
<Chip
size="small"
label={
listing.available
?t('Available')
:t('Sold')
}
color={
listing.available
?'success'
:'default'
}
/>
</Stack>
<Typography
variant="body2"
color="text.secondary"
mb={2}
>
{listing.description}
</Typography>
<Typography
fontWeight={700}
fontSize={20}
color="primary.main"
>
{formatPrice(listing.price)}
</Typography>
<Typography variant="body2">
{listing.quantity} {listing.unit}
</Typography>
<Typography
variant="body2"
color="text.secondary"
>
📍 {listing.location||t('Unknown Location')}
</Typography>
<Typography
variant="caption"
display="block"
mt={1}
>
{listing.category}
</Typography>
{listing.user&&(
<Stack
spacing={0.5}
mt={2}
>
<Typography
fontWeight={600}
>
👤 {listing.user.name}
</Typography>
{listing.user.location&&(
<Typography
variant="body2"
color="text.secondary"
>
📍 {listing.user.location}
</Typography>
)}
</Stack>
)}
<Stack
spacing={1}
mt={3}
>
<Button
variant="contained"
fullWidth
startIcon={<PhoneIcon/>}
href={
sellerPhone
?`tel:${sellerPhone}`
:undefined
}
disabled={!sellerPhone&&(
<Typography
variant="caption"
color="text.secondary"
>
{t('Seller has not provided a phone number.')}
</Typography>
)}
>
{t('Call Seller')}
</Button>
<Button
variant="outlined"
fullWidth
startIcon={<WhatsAppIcon/>}
href={whatsappLink||undefined}
target="_blank"
disabled={!whatsappLink}
>
{t('WhatsApp Seller')}
</Button>
<Button
fullWidth
variant="outlined"
color={
listing.available
?'warning'
:'success'
}
sx={{mt:2}}
onClick={()=>onToggleAvailability?.(listing)}
>
{listing.available
?t('Mark as Sold')
:t('Mark Available')
}
</Button>
</Stack>
<Stack
direction="row"
justifyContent="flex-end"
spacing={1}
mt={2}
>
<IconButton
size="small"
onClick={()=>onEdit?.(listing)}
>
<EditIcon/>
</IconButton>
<IconButton
size="small"
color="error"
onClick={()=>onDelete?.(listing)}
>
<DeleteIcon/>
</IconButton>
</Stack>
</CardContent>
</Card>
);
};
export default MarketplaceCard;