import React from'react';
import{
Alert,
Grid
}from'@mui/material';
import {useTranslation}from'react-i18next';
import ExpenseCard from'./ExpenseCard';

const ExpenseList=({
expenses=[],
loading=false,
onEdit,
onDelete
})=>{

const{t}=useTranslation();
if(!expenses.length){
return(
<Alert severity="info">
{t('No expenses recorded yet.')}
</Alert>
);
}
return(
<Grid container spacing={3}>
{expenses.map(expense=>(
<Grid
item
xs={12}
md={6}
lg={4}
key={expense._id}
>
<ExpenseCard
expense={expense}
loading={loading}
onEdit={onEdit}
onDelete={onDelete}
/>
</Grid>
))}
</Grid>
);
};

export default ExpenseList;