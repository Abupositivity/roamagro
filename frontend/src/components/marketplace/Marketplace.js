import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListings, createListing } from '../../redux/actions/marketplaceActions';
import { Container, Grid, TextField, Button, Typography, Paper, Select, MenuItem, FormControl, InputLabel } from '@mui/material';

const Marketplace = () => {
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
        Marketplace
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Listing
        </Typography>
        <form>
          <TextField label="Title" name="title" value={newListing.title} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Description" name="description" value={newListing.description} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />
          <FormControl fullWidth margin="normal">
            <InputLabel>Category</InputLabel>
            <Select label="Category" name="category" value={newListing.category} onChange={handleChange}>
              <MenuItem value="produce">Agro Produce</MenuItem>
              <MenuItem value="equipment">Farm Equipment</MenuItem>
              <MenuItem value="farmland">Lease Farmland</MenuItem>
            </Select>
          </FormControl>
          <TextField label="Price" name="price" value={newListing.price} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Location" name="location" value={newListing.location} onChange={handleChange} fullWidth margin="normal" />
          <Button onClick={handleCreate} color="primary" variant="contained" sx={{ mt: 2 }}>
            Create Listing
          </Button>
        </form>
      </Paper>
      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} md={4} key={listing._id}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6">{listing.title}</Typography>
              <Typography>Category: {listing.category}</Typography>
              <Typography>Price: {listing.price}</Typography>
              <Typography>Location: {listing.location}</Typography>
              <Typography>{listing.description}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Marketplace;