import React,{useEffect}from'react';
import{
Grid,
TextField,
MenuItem,
Button
}from'@mui/material';
import {useTranslation}from'react-i18next';
import {useForm,Controller}from'react-hook-form';

const categories=[
'Crop',
'Livestock',
'Poultry',
'Fishery',
'Equipment',
'Farm Inputs',
'Services',
'Other'
];

const units=[
'Bag',
'Kg',
'Tonne',
'Litre',
'Piece',
'Crate',
'Pack',
'Animal'
];

const MarketplaceForm=({
initialValues={},
loading=false,
submitLabel='Create Listing',
onSubmit
})=>{

const{t}=useTranslation();
const{
handleSubmit,
control,
reset
}=useForm({
defaultValues:{
title:'',
description:'',
category:'Crop',
price:'',
quantity:1,
unit:'Bag',
location:'',
images:['','',''],
available:true,
...initialValues
}
});

useEffect(()=>{
reset({
title:'',
description:'',
category:'Crop',
price:'',
quantity:1,
unit:'Bag',
location:'',
images:['','',''],
available:true,
...initialValues
});
},[initialValues,reset]);
return(
<form
onSubmit={handleSubmit(data=>{
const cleanedData={...data, images:(data.images||[]).filter(image=>image?.trim())
};
onSubmit(cleanedData);
})}>
<Grid container spacing={2}>
<Grid item xs={12}>
<Controller
name="title"
control={control}
rules={{
required:true
}}
render={({field})=>(
<TextField
{...field}
label={t('Title')}
fullWidth
required
/>
)}
/>
</Grid>
<Grid item xs={12}>
<Controller
name="description"
control={control}
rules={{
required:true
}}
render={({field})=>(
<TextField
{...field}
label={t('Description')}
multiline
rows={4}
fullWidth
required
/>
)}
/>
</Grid>
<Grid item xs={12} md={6}>
<Controller
name="category"
control={control}
render={({field})=>(
<TextField
select
fullWidth
label={t('Category')}
{...field}
>
{categories.map(category=>(
<MenuItem
key={category}
value={category}
>
{t(category)}
</MenuItem>
))}
</TextField>
)}
/>
</Grid>
<Grid item xs={12} md={6}>
<Controller
name="price"
control={control}
render={({field})=>(
<TextField
{...field}
type="number"
fullWidth
label={t('Price')}
/>
)}
/>
</Grid>
<Grid item xs={12} md={6}>
<Controller
name="quantity"
control={control}
render={({field})=>(
<TextField
{...field}
type="number"
fullWidth
label={t('Quantity')}
/>
)}
/>
</Grid>
<Grid item xs={12} md={6}>
<Controller
name="unit"
control={control}
render={({field})=>(
<TextField
select
fullWidth
label={t('Unit')}
{...field}
>
{units.map(unit=>(
<MenuItem
key={unit}
value={unit}
>
{t(unit)}
</MenuItem>
))}
</TextField>
)}
/>
</Grid>
<Grid item xs={12}>
<Controller
name="location"
control={control}
render={({field})=>(
<TextField
{...field}
fullWidth
label={t('Location')}
/>
)}
/>
</Grid>
<Grid item xs={12}>
<Controller
name="images.0"
control={control}
render={({field})=>(
<TextField
{...field}
label={t('Image URL 1')}
helperText={t('Optional')}
fullWidth
/>
)}
/>
</Grid>
<Grid item xs={12}>
<Controller
name="images.1"
control={control}
render={({field})=>(
<TextField
{...field}
label={t('Image URL 2')}
helperText={t('Optional')}
fullWidth
/>
)}
/>
</Grid>
<Grid item xs={12}>
<Controller
name="images.2"
control={control}
render={({field})=>(
<TextField
{...field}
label={t('Image URL 3')}
helperText={t('Optional')}
fullWidth
/>
)}
/>
</Grid>
<Grid item xs={12}>
<Button
type="submit"
variant="contained"
disabled={loading}
>
{t(submitLabel)}
</Button>
</Grid>
</Grid>
</form>
);
};

export default MarketplaceForm;