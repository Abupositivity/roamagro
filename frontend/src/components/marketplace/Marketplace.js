import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchListings, createListing } from '../../redux/actions/marketplaceActions';
import { Container, Grid, TextField, Button, Typography, Paper, Select, MenuItem } from '@material-ui/core';

const Marketplace = () => {
  const dispatch = useDispatch();
  const { listings } = useSelector((state) => state.marketplace);

  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    location: '',
    contact: '',
  });

  useEffect(() => {
    dispatch(fetchListings());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewListing({ ...newListing, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    dispatch(createListing(newListing));
    setNewListing({ title: '', description: '', category: '', price: '', location: '', contact: '' });
  };

  return (
    <Container>
      <Typography variant="h4">Marketplace</Typography>
      <Paper style={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6">Create New Listing</Typography>
        <form>
          <TextField label="Title" name="title" value={newListing.title} onChange={handleChange} fullWidth />
          <TextField label="Description" name="description" value={newListing.description} onChange={handleChange} fullWidth multiline rows={3} />
          <Select label="Category" name="category" value={newListing.category} onChange={handleChange} fullWidth>
            <MenuItem value="produce">Agro Produce</MenuItem>
            <MenuItem value="equipment">Farm Equipment</MenuItem>
            <MenuItem value="farmland">Lease Farmland</MenuItem>
          </Select>
          <TextField label="Price" name="price" value={newListing.price} onChange={handleChange} fullWidth />
          <TextField label="Location" name="location" value={newListing.location} onChange={handleChange} fullWidth />
          <TextField label="Contact Info" name="contact" value={newListing.contact} onChange={handleChange} fullWidth />
          <Button onClick={handleCreate} color="primary" variant="contained">Create Listing</Button>
        </form>
      </Paper>
      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} md={4} key={listing._id}>
            <Paper style={{ padding: '16px' }}>
              <Typography variant="h6">{listing.title}</Typography>
              <Typography>Category: {listing.category}</Typography>
              <Typography>Price: {listing.price}</Typography>
              <Typography>Location: {listing.location}</Typography>
              <Typography>Contact: {listing.contact}</Typography>
              <Typography>{listing.description}</Typography>
              {/* Edit and delete functionality can be added as per user requirements */}
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Marketplace;