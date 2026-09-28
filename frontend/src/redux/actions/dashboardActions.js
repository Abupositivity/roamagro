import api from '../../services/api';

import {
    fetchFarmProjects,
} from './farmProjectsActions';

import {
    fetchListings,
} from './marketplaceActions';

import {
    fetchPriceIndex,
} from './priceIndexActions';

import {
    fetchAgriFeed,
} from './agriFeedActions';

import {
    DASHBOARD_REQUEST,
    DASHBOARD_SUCCESS,
    DASHBOARD_FAIL,
    UPDATE_DASHBOARD_POST,
    CLEAR_DASHBOARD_POST,
} from './types';

const getError = (error) =>
    error?.response?.data?.message ||
    error?.message ||
    'Unable to load dashboard.';

export const fetchDashboard =
    (type = '', options = {}) =>
    async (dispatch, getState) => {
        const {
            silent = false,
        } = options;

        if (
            silent &&
            getState().dashboard?.refreshing
        ) {
            return {
                success: false,
                skipped: true,
            };
        }

        dispatch({
            type: DASHBOARD_REQUEST,
            meta: {
                silent,
            },
        });

        try {
            const endpoint = type
                ? `/dashboard${type}`
                : '/dashboard';

            const res = await api.get(endpoint);

            dispatch({
                type: DASHBOARD_SUCCESS,
                payload: res.data.data,
                meta: {
                    silent,
                },
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message = getError(error);

            dispatch({
                type: DASHBOARD_FAIL,
                payload: message,
                meta: {
                    silent,
                },
            });

            return {
                success: false,
                message,
            };
        }
    };

export const refreshDashboard =
    (options = {}) =>
    async (dispatch, getState) => {
        const {
            type = '',
            silent = true,
        } = options;

        if (
            getState().dashboard?.refreshing
        ) {
            return {
                success: false,
                skipped: true,
            };
        }

        dispatch({
            type: DASHBOARD_REQUEST,
            meta: {
                silent,
            },
        });

        try {
            const endpoint = type
                ? `/dashboard${type}`
                : '/dashboard';

            const results = await Promise.all([
                api.get(endpoint),
                dispatch(fetchFarmProjects()),
                dispatch(
                    fetchListings({
                        page: 1,
                        limit: 12,
                    })
                ),
                dispatch(
                    fetchPriceIndex({
                        page: 1,
                        limit: 12,
                    })
                ),
                dispatch(fetchAgriFeed()),
            ]);

            const dashboardResponse =
                results[0];

            dispatch({
                type: DASHBOARD_SUCCESS,
                payload:
                    dashboardResponse.data.data,
                meta: {
                    silent,
                },
            });

            return {
                success: true,
                data:
                    dashboardResponse.data.data,
            };
        } catch (error) {
            const message = getError(error);

            dispatch({
                type: DASHBOARD_FAIL,
                payload: message,
                meta: {
                    silent,
                },
            });

            return {
                success: false,
                message,
            };
        }
    };

export const updateDashboardPost = (text) => ({
    type: UPDATE_DASHBOARD_POST,
    payload: text,
});

export const clearDashboardPost = () => ({
    type: CLEAR_DASHBOARD_POST,
});