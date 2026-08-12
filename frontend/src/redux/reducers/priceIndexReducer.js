import {
    FETCH_PRICE_INDEX_REQUEST,
    FETCH_PRICE_INDEX_SUCCESS,
    FETCH_PRICE_INDEX_FAIL,
    UPDATE_PRICE_INDEX_REQUEST,
    UPDATE_PRICE_INDEX_SUCCESS,
    UPDATE_PRICE_INDEX_FAIL,
} from '../actions/types';

import {
    DELETE_PRICE_INDEX_REQUEST,
    DELETE_PRICE_INDEX_SUCCESS,
    DELETE_PRICE_INDEX_FAIL,
} from '../constants/priceIndexConstants';

const initialState = {
    priceIndex: [],
    loading: false,
    success: false,
    error: null,

    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasMore: false,

    loadingMore: false,
};

const priceIndexReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case FETCH_PRICE_INDEX_REQUEST:
            return {
                ...state,
                loading:
                    !action.meta?.append,
                loadingMore:
                    Boolean(
                        action.meta?.append
                    ),
                success: false,
                error: null,
            };

        case FETCH_PRICE_INDEX_SUCCESS: {
            const append =
                Boolean(
                    action.meta?.append
                );

            return {
                ...state,
                loading: false,
                loadingMore: false,
                success: true,
                error: null,

                priceIndex: append
                    ? [
                          ...state.priceIndex,
                          ...action.payload,
                      ]
                    : action.payload,

                page:
                    action.meta?.page ||
                    1,

                limit:
                    action.meta?.limit ||
                    12,

                total:
                    action.meta?.total ||
                    0,

                totalPages:
                    action.meta
                        ?.totalPages || 0,

                hasMore:
                    Boolean(
                        action.meta?.hasMore
                    ),
            };
        }

        case UPDATE_PRICE_INDEX_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };

        case UPDATE_PRICE_INDEX_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                error: null,

                priceIndex: [
                    action.payload,
                    ...state.priceIndex,
                ],

                total:
                    state.total + 1,
            };

        case DELETE_PRICE_INDEX_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };

        case DELETE_PRICE_INDEX_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                error: null,

                priceIndex:
                    state.priceIndex.filter(
                        (price) =>
                            price._id !==
                            action.payload
                    ),

                total: Math.max(
                    state.total - 1,
                    0
                ),
            };

        case FETCH_PRICE_INDEX_FAIL:
        case UPDATE_PRICE_INDEX_FAIL:
        case DELETE_PRICE_INDEX_FAIL:
            return {
                ...state,
                loading: false,
                loadingMore: false,
                success: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default priceIndexReducer;