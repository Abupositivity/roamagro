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

export const fetchPriceAlerts = () => async (dispatch) => {

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

    }

    catch (error) {

        dispatch({

            type: GET_PRICE_ALERTS_FAIL,

            payload:
                error.response?.data?.message ||
                error.message,

        });

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

    }

    catch (error) {

        dispatch({

            type:
            CREATE_PRICE_ALERT_FAIL,

            payload:
                error.response?.data?.message ||
                error.message,

        });

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

    }

    catch (error) {

        dispatch({

            type:
            DELETE_PRICE_ALERT_FAIL,

            payload:
                error.response?.data?.message ||
                error.message,

        });

    }

};