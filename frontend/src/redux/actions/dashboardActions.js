import api from '../../services/api';
import { fetchFarmProjects } from './farmProjectsActions';
import { fetchListings } from './marketplaceActions';
import { fetchPriceIndex } from './priceIndexActions';
import { fetchAgriFeed } from './agriFeedActions';
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

const CACHE_TIME = 60 * 1000;

const isFresh = (timestamp, maxAge = CACHE_TIME) =>
    timestamp &&
    Date.now() - timestamp < maxAge;

const hasData = (value) =>
    Array.isArray(value) && value.length > 0;

export const fetchDashboard =
    (type = '', options = {}) =>
    async (dispatch, getState) => {
        const { silent = false } = options;

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
            meta: { silent },
        });

        try {
            const endpoint = type
                ? `/dashboard${type}`
                : '/dashboard';

            const res = await api.get(endpoint);

            dispatch({
                type: DASHBOARD_SUCCESS,
                payload: res.data.data,
                meta: { silent },
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
                meta: { silent },
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
            force = false,
        } = options;

        const state = getState();

        if (
            state.dashboard?.refreshing
        ) {
            return {
                success: false,
                skipped: true,
            };
        }

        dispatch({
            type: DASHBOARD_REQUEST,
            meta: { silent },
        });

        try {
            const endpoint = type
                ? `/dashboard${type}`
                : '/dashboard';

            const dashboardRequest =
                api.get(endpoint);

            const farmProjects =
                state.farmProjects;

            const marketplace =
                state.marketplace;

            const priceIndex =
                state.priceIndex;

            const agriFeed =
                state.agriFeed;

            const requests = [
                dashboardRequest,
            ];

            const shouldFetchProjects =
                force ||
                !hasData(
                    farmProjects?.projects
                );

            const shouldFetchListings =
                force ||
                !hasData(
                    marketplace?.listings
                );

            const shouldFetchPrices =
                force ||
                !hasData(
                    priceIndex?.priceIndex
                );

            const shouldFetchFeed =
                force ||
                !hasData(
                    agriFeed?.tips
                ) ||
                !isFresh(
                    agriFeed?.lastUpdated
                );

            if (shouldFetchProjects) {
                requests.push(
                    dispatch(
                        fetchFarmProjects()
                    )
                );
            }

            if (shouldFetchListings) {
                requests.push(
                    dispatch(
                        fetchListings({
                            page: 1,
                            limit: 12,
                        })
                    )
                );
            }

            if (shouldFetchPrices) {
                requests.push(
                    dispatch(
                        fetchPriceIndex({
                            page: 1,
                            limit: 12,
                        })
                    )
                );
            }

            if (shouldFetchFeed) {
                requests.push(
                    dispatch(
                        fetchAgriFeed(
                            {},
                            { silent: true }
                        )
                    )
                );
            }

            const results =
                await Promise.all(
                    requests
                );

            const dashboardResponse =
                results[0];

            dispatch({
                type: DASHBOARD_SUCCESS,
                payload:
                    dashboardResponse.data.data,
                meta: { silent },
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
                meta: { silent },
            });

            return {
                success: false,
                message,
            };
        }
    };

export const updateDashboardPost =
    (text) => ({
        type: UPDATE_DASHBOARD_POST,
        payload: text,
    });

export const clearDashboardPost =
    () => ({
        type: CLEAR_DASHBOARD_POST,
    });