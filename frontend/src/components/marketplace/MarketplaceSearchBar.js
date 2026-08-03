import React from 'react';
import {
TextField,
InputAdornment
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {useTranslation} from 'react-i18next';

const MarketplaceSearchBar=({
value,
onChange
})=>{

const{t}=useTranslation();
return(
<TextField
fullWidth
value={value}
onChange={e=>onChange(e.target.value)}
placeholder={t('Search products, category or location')}
InputProps={{
startAdornment:(
<InputAdornment position="start">
<SearchIcon/>
</InputAdornment>
)
}}
sx={{mb:3}}
/>
);
};

export default MarketplaceSearchBar;