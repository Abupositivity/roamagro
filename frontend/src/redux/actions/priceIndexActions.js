import axios from 'axios';

export const fetchPriceIndex = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/price-index');
    dispatch({ type: 'FETCH_PRICE_INDEX_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_PRICE_INDEX_FAIL', payload: error.response.data });
  }
};

export const updatePriceIndex = (priceData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/price-index/update', priceData);
    dispatch({ type: 'UPDATE_PRICE_INDEX_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'UPDATE_PRICE_INDEX_FAIL', payload: error.response.data });
  }
};