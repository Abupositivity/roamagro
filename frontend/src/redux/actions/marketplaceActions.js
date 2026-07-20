import api from '../../services/api';

export const fetchListings = () => async (dispatch) => {

    try {
        const { data } = await api.get('/marketplace');
        dispatch({
            type: 'FETCH_LISTINGS_SUCCESS',
            payload: data.items
        });
    } catch (err) {
        dispatch({
            type: 'FETCH_LISTINGS_FAIL',
            payload: err.response?.data?.message
        });
    }
};

export const createListing = (listing) => async (dispatch) => {
    try {
        const { data } = await api.post('/marketplace', listing);
        dispatch({
            type: 'CREATE_LISTING_SUCCESS',
            payload: data.item
        });
        console.log('✅ Listing created');
    } catch (err) {
        dispatch({
            type: 'CREATE_LISTING_FAIL',
            payload: err.response?.data?.message
        });
    }
};