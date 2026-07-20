import {
    FETCH_PRICE_INDEX_REQUEST,
    FETCH_PRICE_INDEX_SUCCESS,
    FETCH_PRICE_INDEX_FAIL,
    UPDATE_PRICE_INDEX_REQUEST,
    UPDATE_PRICE_INDEX_SUCCESS,
    UPDATE_PRICE_INDEX_FAIL,
} from '../actions/types';

const initialState = {
    priceIndex: [],
    loading: false,
    success: false,
    error: null,
};

const priceIndexReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_PRICE_INDEX_REQUEST:
        case UPDATE_PRICE_INDEX_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };
        case FETCH_PRICE_INDEX_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                priceIndex: action.payload,
            };
        case UPDATE_PRICE_INDEX_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                priceIndex: [action.payload, ...state.priceIndex],
            };
        case FETCH_PRICE_INDEX_FAIL:
        case UPDATE_PRICE_INDEX_FAIL:
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

export default priceIndexReducer;