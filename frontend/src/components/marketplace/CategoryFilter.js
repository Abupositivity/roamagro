import React from 'react';
import {
Stack,
Chip
} from '@mui/material';

const categories=[
'All',
'Crop',
'Livestock',
'Poultry',
'Fishery',
'Equipment',
'Farm Inputs',
'Services'
];

const CategoryFilter=({
selected,
onChange
})=>{
return(
<Stack
direction="row"
spacing={1}
mb={3}
sx={{
overflowX:'auto',
pb:1
}}
>
{categories.map(category=>(
<Chip
key={category}
label={category}
clickable
color={
selected===category
?'primary'
:'default'
}
onClick={()=>onChange(category)}
/>
))}
</Stack>
);
};

export default CategoryFilter;