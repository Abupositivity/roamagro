import React from'react';
import{
Card,
CardContent,
Typography,
Stack,
Chip,
IconButton
}from'@mui/material';
import EditIcon from'@mui/icons-material/Edit';
import DeleteIcon from'@mui/icons-material/Delete';
import {useTranslation}from'react-i18next';

const ExpenseCard=({
expense,
loading=false,
onEdit,
onDelete
})=>{
const{t}=useTranslation();
return(
<Card>
<CardContent>
<Stack
direction="row"
justifyContent="space-between"
alignItems="flex-start"
spacing={2}
>
<Stack spacing={1} flex={1}>
<Typography
variant="h6"
fontWeight={700}
>
{expense.category}
</Typography>
{expense.description&&(
<Typography
variant="body2"
color="text.secondary"
>
{expense.description}
</Typography>
)}
<Stack
direction="row"
spacing={1}
flexWrap="wrap"
>
<Chip
label={`₦${Number(expense.amount||0).toLocaleString()}`}
color="error"
size="small"
/>
<Chip
label={
expense.date
?new Date(expense.date).toLocaleDateString()
:t('No Date')
}
size="small"
variant="outlined"
/>
</Stack>
</Stack>
<Stack direction="row">
<IconButton
size="small"
disabled={loading}
onClick={()=>onEdit?.(expense)}
>
<EditIcon fontSize="small"/>
</IconButton>
<IconButton
size="small"
color="error"
disabled={loading}
onClick={()=>onDelete?.(expense)}
>
<DeleteIcon fontSize="small"/>
</IconButton>
</Stack>
</Stack>
</CardContent>
</Card>
);
};

export default ExpenseCard;