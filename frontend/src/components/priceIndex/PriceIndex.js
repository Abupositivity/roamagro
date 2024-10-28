import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPriceIndex, updatePriceIndex } from '../../redux/actions/priceIndexActions';
import { Container, Grid, TextField, Button, Typography, Paper } from '@mui/material';

const PriceIndex = () => {
  const dispatch = useDispatch();
  const { priceIndex } = useSelector((state) => state.priceIndex);
  const [newPrice, setNewPrice] = useState({ product: '', price: '', location: '' });

  useEffect(() => {
    dispatch(fetchPriceIndex());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewPrice({ ...newPrice, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    if (newPrice.product && newPrice.price && newPrice.location) {
      dispatch(updatePriceIndex(newPrice));
      setNewPrice({ product: '', price: '', location: '' });
    } else {
      alert("Please fill out all fields.");
    }
  };

  const priceIndexArray = Array.isArray(priceIndex) ? priceIndex : [];

  return (
    <Container>
      <Typography variant="h4">Local Price Index</Typography>
      <Paper style={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6">Update Price</Typography>
        <TextField label="Product" name="product" value={newPrice.product} onChange={handleChange} fullWidth />
        <TextField label="Price" name="price" value={newPrice.price} onChange={handleChange} fullWidth />
        <TextField label="Location" name="location" value={newPrice.location} onChange={handleChange} fullWidth />
        <Button onClick={handleUpdate} color="primary" variant="contained" style={{ marginTop: '16px' }}>
          Update Price
        </Button>
      </Paper>
      {priceIndexArray.length > 0 ? (
        <Grid container spacing={3}>
          {priceIndexArray.map((entry) => (
            <Grid item xs={12} md={4} key={entry._id}>
              <Paper style={{ padding: '16px' }}>
                <Typography variant="h6">{entry.product}</Typography>
                <Typography>Price: {entry.price}</Typography>
                <Typography>Location: {entry.location}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1">No price index data available.</Typography>
      )}
    </Container>
  );
};

export default PriceIndex;