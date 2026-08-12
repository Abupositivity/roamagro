import api from '../../services/api';

import {
    GET_PRICE_ALERTS_REQUEST,
    GET_PRICE_ALERTS_SUCCESS,
    GET_PRICE_ALERTS_FAIL,

    CREATE_PRICE_ALERT_REQUEST,
    CREATE_PRICE_ALERT_SUCCESS,
    CREATE_PRICE_ALERT_FAIL,

    DELETE_PRICE_ALERT_REQUEST,
    DELETE_PRICE_ALERT_SUCCESS,
    DELETE_PRICE_ALERT_FAIL,
} from '../constants/priceAlertConstants';

export const fetchPriceAlerts =
    () => async (dispatch) => {
        dispatch({
            type: GET_PRICE_ALERTS_REQUEST,
        });

        try {
            const res =
                await api.get('/price-alerts');

            dispatch({
                type: GET_PRICE_ALERTS_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to load price alerts.';

            dispatch({
                type: GET_PRICE_ALERTS_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const createPriceAlert =
    (data) => async (dispatch) => {
        dispatch({
            type: CREATE_PRICE_ALERT_REQUEST,
        });

        try {
            const res =
                await api.post(
                    '/price-alerts',
                    data
                );

            dispatch({
                type:
                    CREATE_PRICE_ALERT_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to create price alert.';

            dispatch({
                type:
                    CREATE_PRICE_ALERT_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const deletePriceAlert =
    (id) => async (dispatch) => {
        dispatch({
            type:
                DELETE_PRICE_ALERT_REQUEST,
        });

        try {
            await api.delete(
                `/price-alerts/${id}`
            );

            dispatch({
                type:
                    DELETE_PRICE_ALERT_SUCCESS,
                payload: id,
            });

            return {
                success: true,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to delete price alert.';

            dispatch({
                type:
                    DELETE_PRICE_ALERT_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };