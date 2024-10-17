import axios from 'axios';

export const fetchListings = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/marketplace/listings');
    dispatch({ type: 'FETCH_LISTINGS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_LISTINGS_FAIL', payload: error.response.data });
  }
};

export const createListing = (listingData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/marketplace/listings', listingData);
    dispatch({ type: 'CREATE_LISTING_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'CREATE_LISTING_FAIL', payload: error.response.data });
  }
};

export const updateListing = (id, listingData) => async (dispatch) => {
  try {
    const response = await axios.put(`/api/marketplace/listings/${id}`, listingData);
    dispatch({ type: 'UPDATE_LISTING_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'UPDATE_LISTING_FAIL', payload: error.response.data });
  }
};

export const deleteListing = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/marketplace/listings/${id}`);
    dispatch({ type: 'DELETE_LISTING_SUCCESS', payload: id });
  } catch (error) {
    dispatch({ type: 'DELETE_LISTING_FAIL', payload: error.response.data });
  }
};