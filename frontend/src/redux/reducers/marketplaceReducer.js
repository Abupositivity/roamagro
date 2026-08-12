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

    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false,
};

const marketplaceReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        /*
        |--------------------------------------------------------------------------
        | Requests
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
        case FETCH_LISTINGS_SUCCESS: {
            const payload = action.payload;
            const incomingListings =
                payload.data || [];

            return {
                ...state,
                loading: false,
                success: true,
                error: null,

                listings:
                    payload.append
                        ? [
                              ...state.listings,
                              ...incomingListings,
                          ]
                        : incomingListings,

                page:
                    payload.page ||
                    1,

                limit:
                    payload.limit ||
                    12,

                total:
                    payload.total ||
                    0,

                totalPages:
                    payload.totalPages ||
                    0,

                hasMore:
                    Boolean(
                        payload.hasMore
                    ),
            };
        }

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
                selectedListing:
                    action.payload,
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
                total: state.total + 1,
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
                listings:
                    state.listings.map(
                        (listing) =>
                            listing._id ===
                            action.payload._id
                                ? action.payload
                                : listing
                    ),
                selectedListing:
                    action.payload,
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

                listings:
                    state.listings.filter(
                        (listing) =>
                            listing._id !==
                            action.payload
                    ),

                selectedListing:
                    state.selectedListing &&
                    state.selectedListing._id ===
                        action.payload
                        ? null
                        : state.selectedListing,

                total: Math.max(
                    state.total - 1,
                    0
                ),

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