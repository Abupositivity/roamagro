import {
    FETCH_LISTINGS_REQUEST,
    FETCH_LISTINGS_SUCCESS,
    FETCH_LISTINGS_FAIL,
    CREATE_LISTING_REQUEST,
    CREATE_LISTING_SUCCESS,
    CREATE_LISTING_FAIL,
} from '../actions/types';

const initialState = {
    listings: [],
    loading: false,
    success: false,
    error: null,
};

const marketplaceReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_LISTINGS_REQUEST:
        case CREATE_LISTING_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };
        case FETCH_LISTINGS_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                listings: action.payload,
                error: null,
            };
        case CREATE_LISTING_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                listings: [action.payload, ...state.listings],
                error: null,
            };
        case FETCH_LISTINGS_FAIL:
        case CREATE_LISTING_FAIL:
            return {
                ...state,
                loading: false,
                success: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default marketplaceReducer;