import React from 'react';
import {
Stack,
Chip
}from'@mui/material';

const options=[
'All',
'Available',
'Sold'
];

const AvailabilityFilter=({
value,
onChange
})=>(

<Stack
direction="row"
spacing={1}
mb={2}
>
{options.map(option=>(
<Chip
key={option}
label={option}
clickable
color={
value===option
?'primary'
:'default'
}
onClick={()=>onChange(option)}
/>
))}
</Stack>
);

export default AvailabilityFilter;