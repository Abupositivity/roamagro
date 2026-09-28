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
    loadingMore: false,
    success: false,
    error: null,

    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
    hasMore: false,
};

const marketplaceReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case FETCH_LISTINGS_REQUEST: {
            const append =
                action.meta?.append === true;

            return {
                ...state,
                loading: !append,
                loadingMore: append,
                success: false,
                error: null,
            };
        }

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

        case FETCH_LISTINGS_SUCCESS: {
            const payload =
                action.payload || {};

            const incomingListings =
                payload.data || [];

            const append =
                payload.append === true;

            let listings = incomingListings;

            if (append) {
                const existingIds =
                    new Set(
                        state.listings.map(
                            (listing) =>
                                listing._id
                        )
                    );

                const newListings =
                    incomingListings.filter(
                        (listing) =>
                            listing?._id &&
                            !existingIds.has(
                                listing._id
                            )
                    );

                listings = [
                    ...state.listings,
                    ...newListings,
                ];
            }

            return {
                ...state,
                loading: false,
                loadingMore: false,
                success: true,
                error: null,

                listings,

                page:
                    payload.page ||
                    1,

                limit:
                    payload.limit ||
                    20,

                total:
                    payload.total || 0,

                totalPages:
                    payload.totalPages ||
                    0,

                hasMore:
                    Boolean(
                        payload.hasMore
                    ),
            };
        }

        case GET_LISTING_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                selectedListing:
                    action.payload,
                error: null,
            };

        case CREATE_LISTING_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                listings: [
                    action.payload,
                    ...state.listings.filter(
                        (listing) =>
                            listing._id !==
                            action.payload._id
                    ),
                ],
                total: state.total + 1,
                error: null,
            };

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

        case FETCH_LISTINGS_FAIL:
            return {
                ...state,
                loading: false,
                loadingMore: false,
                success: false,
                error: action.payload,
            };

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