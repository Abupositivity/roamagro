import axios from 'axios';

export const fetchPriceIndex = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/v1/price-index');
    console.log(response.data);
    dispatch({ type: 'FETCH_PRICE_INDEX_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_PRICE_INDEX_FAIL', payload: error.response?.data || 'Failed to fetch price index' });
  }
};

export const updatePriceIndex = (priceData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/v1/price-index', priceData);
    dispatch({ type: 'UPDATE_PRICE_INDEX_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'UPDATE_PRICE_INDEX_FAIL', payload: error.response?.data || 'Failed to update price index' });
  }
};