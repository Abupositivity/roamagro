import api from '../../services/api';

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
} from './types';

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message ||
    error.message ||
    fallback;

export const fetchListings =
    (params = {}, append = false) =>
    async (dispatch) => {
        dispatch({
            type: FETCH_LISTINGS_REQUEST,
            meta: {
                append,
            },
        });

        try {
            const requestParams = {
                page: params.page || 1,
                limit: params.limit || 20,
            };

            if (params.search?.trim()) {
                requestParams.search =
                    params.search.trim();
            }

            if (
                params.category &&
                params.category !== 'All'
            ) {
                requestParams.category =
                    params.category;
            }

            if (
                params.availability &&
                params.availability !== 'All'
            ) {
                requestParams.availability =
                    params.availability;
            }

            if (params.mine) {
                requestParams.mine = true;
            }

            if (
                params.userLatitude !== undefined &&
                params.userLatitude !== ''
            ) {
                requestParams.userLatitude =
                    params.userLatitude;
            }

            if (
                params.userLongitude !== undefined &&
                params.userLongitude !== ''
            ) {
                requestParams.userLongitude =
                    params.userLongitude;
            }

            const res = await api.get(
                '/marketplace',
                {
                    params: requestParams,
                }
            );

            dispatch({
                type: FETCH_LISTINGS_SUCCESS,
                payload: {
                    ...res.data,
                    append,
                },
            });

            return {
                success: true,
                data: res.data.data || [],
                meta: res.data,
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Failed to load marketplace listings.'
            );

            dispatch({
                type: FETCH_LISTINGS_FAIL,
                payload: message,
                meta: {
                    append,
                },
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const createListing =
    (listing) => async (dispatch) => {
        dispatch({
            type: CREATE_LISTING_REQUEST,
        });

        try {
            const res = await api.post(
                '/marketplace',
                listing
            );

            dispatch({
                type: CREATE_LISTING_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Failed to create listing.'
            );

            dispatch({
                type: CREATE_LISTING_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const getListing =
    (id) => async (dispatch) => {
        dispatch({
            type: GET_LISTING_REQUEST,
        });

        try {
            const res = await api.get(
                `/marketplace/${id}`
            );

            dispatch({
                type: GET_LISTING_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Failed to load listing.'
            );

            dispatch({
                type: GET_LISTING_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const updateListing =
    (id, data) => async (dispatch) => {
        dispatch({
            type: UPDATE_LISTING_REQUEST,
        });

        try {
            const res = await api.put(
                `/marketplace/${id}`,
                data
            );

            dispatch({
                type: UPDATE_LISTING_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Failed to update listing.'
            );

            dispatch({
                type: UPDATE_LISTING_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const deleteListing =
    (id) => async (dispatch) => {
        dispatch({
            type: DELETE_LISTING_REQUEST,
        });

        try {
            await api.delete(
                `/marketplace/${id}`
            );

            dispatch({
                type: DELETE_LISTING_SUCCESS,
                payload: id,
            });

            return {
                success: true,
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Failed to delete listing.'
            );

            dispatch({
                type: DELETE_LISTING_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };