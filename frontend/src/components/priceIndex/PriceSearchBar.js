import React from 'react';
import {
TextField,
InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import {useTranslation} from 'react-i18next';

const PriceSearchBar=({
search,
onSearchChange,
})=>{

const{t}=useTranslation();

return(
<TextField
fullWidth
placeholder={t('Search product, market or location')}
value={search}
onChange={e=>onSearchChange(e.target.value)}
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

export default PriceSearchBar;