import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPriceIndex, updatePriceIndex } from '../../redux/actions/priceIndexActions';
import { Container, Grid, TextField, Button, Typography, Paper } from '@material-ui/core';

const PriceIndex = () => {
  const dispatch = useDispatch();
  const { priceIndex } = useSelector((state) => state.priceIndex);

  const [newPrice, setNewPrice] = useState({ item: '', price: '', location: '' });

  useEffect(() => {
    dispatch(fetchPriceIndex());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewPrice({ ...newPrice, [e.target.name]: e.target.value });
  };

  const handleUpdate = () => {
    dispatch(updatePriceIndex(newPrice));
    setNewPrice({ item: '', price: '', location: '' });
  };

  return (
    <Container>
      <Typography variant="h4">Local Price Index</Typography>
      <Paper style={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6">Update Price</Typography>
        <TextField label="Item" name="item" value={newPrice.item} onChange={handleChange} fullWidth />
        <TextField label="Price" name="price" value={newPrice.price} onChange={handleChange} fullWidth />
        <TextField label="Location" name="location" value={newPrice.location} onChange={handleChange} fullWidth />
        <Button onClick={handleUpdate} color="primary" variant="contained">Update Price</Button>
      </Paper>
      <Grid container spacing={3}>
        {priceIndex.map((entry) => (
          <Grid item xs={12} md={4} key={entry._id}>
            <Paper style={{ padding: '16px' }}>
              <Typography variant="h6">{entry.item}</Typography>
              <Typography>Price: {entry.price}</Typography>
              <Typography>Location: {entry.location}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default PriceIndex;