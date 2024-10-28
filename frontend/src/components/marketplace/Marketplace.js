import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListings, createListing } from '../../redux/actions/marketplaceActions';
import { useTranslation } from 'react-i18next';
import { Container, Grid, TextField, Button, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Marketplace = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { listings } = useSelector((state) => state.marketplace);

  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
  });

  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewListing({ ...newListing, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    dispatch(createListing(newListing));
    setNewListing({ title: '', description: '', category: '', price: '', location: '' });
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        {t("Marketplace")}
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t("Create New Listing")}
        </Typography>
        <form>
          <TextField label={t("Title")} name="title" value={newListing.title} onChange={handleChange} fullWidth margin="normal" />
          <TextField label={t("Description")} name="description" value={newListing.description} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />
          <FormControl fullWidth margin="normal">
            <InputLabel>{t("Category")}</InputLabel>
            <Select label={t("Category")} name="category" value={newListing.category} onChange={handleChange}>
              <MenuItem value="produce">{t("Agro Produce")}</MenuItem>
              <MenuItem value="equipment">{t("Farm Equipment")}</MenuItem>
              <MenuItem value="farmland">{t("Lease Farmland")}</MenuItem>
            </Select>
          </FormControl>
          <TextField label={t("Price")} name="price" value={newListing.price} onChange={handleChange} fullWidth margin="normal" />
          <TextField label={t("Location")} name="location" value={newListing.location} onChange={handleChange} fullWidth margin="normal" />
          <Button onClick={handleCreate} color="primary" variant="contained" sx={{ mt: 2 }}>
            {t("Create Listing")}
          </Button>
        </form>
      </Paper>
      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} md={4} key={listing._id}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6">{listing.title}</Typography>
              <Typography>{t("Category")}: {listing.category}</Typography>
              <Typography>{t("Price")}: {listing.price}</Typography>
              <Typography>{t("Location")}: {listing.location}</Typography>
              <Typography>{listing.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Marketplace;