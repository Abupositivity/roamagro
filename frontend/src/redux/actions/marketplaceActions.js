import axios from 'axios';

export const fetchListings = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/marketplace');
    dispatch({ type: 'FETCH_LISTINGS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_LISTINGS_FAIL', payload: error.response.data });
  }
};

export const createListing = (listingData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/marketplace', listingData);
    dispatch({ type: 'CREATE_LISTING_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'CREATE_LISTING_FAIL', payload: error.response.data });
  }
};