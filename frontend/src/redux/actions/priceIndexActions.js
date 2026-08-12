import api from '../../services/api';

import {
    FETCH_PRICE_INDEX_REQUEST,
    FETCH_PRICE_INDEX_SUCCESS,
    FETCH_PRICE_INDEX_FAIL,
    UPDATE_PRICE_INDEX_REQUEST,
    UPDATE_PRICE_INDEX_SUCCESS,
    UPDATE_PRICE_INDEX_FAIL,
} from './types';

import {
    DELETE_PRICE_INDEX_REQUEST,
    DELETE_PRICE_INDEX_SUCCESS,
    DELETE_PRICE_INDEX_FAIL,
} from '../constants/priceIndexConstants';

/**
 * Fetch market prices.
 *
 * append = false
 * Loads a fresh page and replaces existing prices.
 *
 * append = true
 * Loads the next page and appends prices.
 */
export const fetchPriceIndex = (
    options = {}
) => async (dispatch) => {
    const {
        page = 1,
        limit = 12,
        search = '',
        category = '',
        location = '',
        mine = false,
        append = false,
    } = options;

    dispatch({
        type: FETCH_PRICE_INDEX_REQUEST,
        meta: {
            append,
        },
    });

    try {
        const params = new URLSearchParams();

        params.append('page', page);
        params.append('limit', limit);

        if (search.trim()) {
            params.append(
                'search',
                search.trim()
            );
        }

        if (
            category &&
            category !== 'All'
        ) {
            params.append(
                'category',
                category
            );
        }

        if (
            location &&
            location !== 'All'
        ) {
            params.append(
                'location',
                location
            );
        }

        if (mine) {
            params.append('mine', 'true');
        }

        const res = await api.get(
            `/price-index?${params.toString()}`
        );

        dispatch({
            type: FETCH_PRICE_INDEX_SUCCESS,
            payload: res.data.data,
            meta: {
                append,
                page: res.data.page,
                limit: res.data.limit,
                total: res.data.total,
                totalPages:
                    res.data.totalPages,
                hasMore:
                    res.data.hasMore,
            },
        });

        return {
            success: true,
            data: res.data.data,
            page: res.data.page,
            hasMore: res.data.hasMore,
            total: res.data.total,
        };
    } catch (error) {
        const message =
            error.response?.data?.message ||
            error.message ||
            'Failed to load market prices.';

        dispatch({
            type: FETCH_PRICE_INDEX_FAIL,
            payload: message,
        });

        return {
            success: false,
            error: message,
        };
    }
};

/**
 * Submit a new market price.
 */
export const submitPrice =
    (priceData) => async (dispatch) => {
        dispatch({
            type: UPDATE_PRICE_INDEX_REQUEST,
        });

        try {
            const res = await api.post(
                '/price-index',
                priceData
            );

            dispatch({
                type: UPDATE_PRICE_INDEX_SUCCESS,
                payload: res.data.data,
            });

            console.log(
                '✅ Price Submitted'
            );

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data
                    ?.message ||
                error.message ||
                'Failed to submit price.';

            dispatch({
                type: UPDATE_PRICE_INDEX_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

/**
 * Delete a price submitted by
 * the current user.
 */
export const deletePrice =
    (id) => async (dispatch) => {
        dispatch({
            type: DELETE_PRICE_INDEX_REQUEST,
        });

        try {
            await api.delete(
                `/price-index/${id}`
            );

            dispatch({
                type: DELETE_PRICE_INDEX_SUCCESS,
                payload: id,
            });

            console.log(
                '✅ Price Deleted'
            );

            return {
                success: true,
            };
        } catch (error) {
            const message =
                error.response?.data
                    ?.message ||
                error.message ||
                'Failed to delete price.';

            dispatch({
                type: DELETE_PRICE_INDEX_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };