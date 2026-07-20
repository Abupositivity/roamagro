import api from '../../services/api';

export const fetchPriceIndex = () => async (dispatch) => {
    try {
        const { data } = await api.get('/price-index');
        dispatch({
            type: 'FETCH_PRICE_INDEX_SUCCESS',
            payload: data.prices
        });
    } catch (err) {
        dispatch({
            type: 'FETCH_PRICE_INDEX_FAIL',
            payload: err.response?.data?.message
        });
    }
};

export const updatePriceIndex = (price) => async (dispatch) => {
    try {
        const { data } = await api.post('/price-index', price);
        dispatch({
            type: 'UPDATE_PRICE_INDEX_SUCCESS',
            payload: data.entry
        });
        console.log('✅ Price submitted');
    } catch (err) {
        dispatch({
            type: 'UPDATE_PRICE_INDEX_FAIL',
            payload: err.response?.data?.message
        });
    }
};