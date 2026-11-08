import api from '../../services/api';
import { fetchFarmProjects } from './farmProjectsActions';
import { fetchListings } from './marketplaceActions';
import { fetchPriceIndex } from './priceIndexActions';
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

const getEndpoint = (type = '') =>
    type ? `/dashboard${type}` : '/dashboard';

export const fetchDashboard =
    (type = '', options = {}) =>
    async (dispatch, getState) => {
        const { silent = false } = options;

        const dashboardState = getState().dashboard;

        if (
            dashboardState?.loading ||
            dashboardState?.refreshing
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
            const res = await api.get(
                getEndpoint(type)
            );

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
            state.dashboard?.loading ||
            state.dashboard?.refreshing
        ) {
            return {
                success: false,
                skipped: true,
            };
        }

        // Load supporting datasets on the first refresh.
        // Subsequent polling refreshes the dashboard endpoint.
        // A forced refresh also reloads supporting datasets.
        const loadSupportingData =
            force ||
            !state.dashboard?.lastUpdated;

        dispatch({
            type: DASHBOARD_REQUEST,
            meta: { silent },
        });

        const supportingRequests = [];

        if (loadSupportingData) {
            if (
                force ||
                !state.farmProjects?.projects?.length
            ) {
                supportingRequests.push(
                    dispatch(fetchFarmProjects())
                );
            }

            if (
                force ||
                !state.marketplace?.listings?.length
            ) {
                supportingRequests.push(
                    dispatch(
                        fetchListings({
                            page: 1,
                            limit: 12,
                        })
                    )
                );
            }

            if (
                force ||
                !state.priceIndex?.priceIndex?.length
            ) {
                supportingRequests.push(
                    dispatch(
                        fetchPriceIndex({
                            page: 1,
                            limit: 12,
                        })
                    )
                );
            }
        }

        try {
            const res = await api.get(
                getEndpoint(type)
            );

            dispatch({
                type: DASHBOARD_SUCCESS,
                payload: res.data.data,
                meta: { silent },
            });

            // Supporting requests are independent of the
            // main dashboard request. Their failures should
            // not cause a successful dashboard load to fail.
            if (supportingRequests.length > 0) {
                await Promise.allSettled(
                    supportingRequests
                );
            }

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

export const updateDashboardPost =
    (text) => ({
        type: UPDATE_DASHBOARD_POST,
        payload: text,
    });

export const clearDashboardPost =
    () => ({
        type: CLEAR_DASHBOARD_POST,
    });