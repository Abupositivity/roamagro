import {
    FETCH_LISTINGS_REQUEST,
    FETCH_LISTINGS_SUCCESS,
    FETCH_LISTINGS_FAIL,
    CREATE_LISTING_REQUEST,
    CREATE_LISTING_SUCCESS,
    CREATE_LISTING_FAIL,
    GET_LISTING_REQUEST,
    GET_LISTING_SUCCESS,
    GET_LISTING_FAIL,
    UPDATE_LISTING_REQUEST,
    UPDATE_LISTING_SUCCESS,
    UPDATE_LISTING_FAIL,
    DELETE_LISTING_REQUEST,
    DELETE_LISTING_SUCCESS,
    DELETE_LISTING_FAIL,
} from '../actions/types';

const initialState = {
    listings: [],
    selectedListing: null,
    loading: false,
    success: false,
    error: null,
};

const marketplaceReducer = (state = initialState, action) => {
    switch (action.type) {

        /*
        |--------------------------------------------------------------------------
        |Requests
        |--------------------------------------------------------------------------
        */
        case FETCH_LISTINGS_REQUEST:
        case CREATE_LISTING_REQUEST:
        case GET_LISTING_REQUEST:
        case UPDATE_LISTING_REQUEST:
        case DELETE_LISTING_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Fetch Listings
        |--------------------------------------------------------------------------
        */
        case FETCH_LISTINGS_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                listings: action.payload,
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Get Single Listing
        |--------------------------------------------------------------------------
        */
        case GET_LISTING_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                selectedListing: action.payload,
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Create Listing
        |--------------------------------------------------------------------------
        */
        case CREATE_LISTING_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                listings: [
                    action.payload,
                    ...state.listings,
                ],
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Update Listing
        |--------------------------------------------------------------------------
        */
        case UPDATE_LISTING_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                listings: state.listings.map(listing =>
                    listing._id === action.payload._id
                        ? action.payload
                        : listing
                ),
                selectedListing: action.payload,
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Delete Listing
        |--------------------------------------------------------------------------
        */
        case DELETE_LISTING_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                listings: state.listings.filter(
                    listing => listing._id !== action.payload
                ),
                selectedListing:
                    state.selectedListing &&
                    state.selectedListing._id === action.payload
                        ? null
                        : state.selectedListing,
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Failures
        |--------------------------------------------------------------------------
        */
        case FETCH_LISTINGS_FAIL:
        case CREATE_LISTING_FAIL:
        case GET_LISTING_FAIL:
        case UPDATE_LISTING_FAIL:
        case DELETE_LISTING_FAIL:
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