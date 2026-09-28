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

const initialState = {
    alerts: [],
    loading: false,
    creating: false,
    deleting: false,
    success: false,
    error: null,
    lastFetched: null,
};

const priceAlertReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case GET_PRICE_ALERTS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case GET_PRICE_ALERTS_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                alerts: action.payload || [],
                error: null,
                lastFetched: Date.now(),
            };

        case GET_PRICE_ALERTS_FAIL:
            return {
                ...state,
                loading: false,
                success: false,
                error: action.payload,
            };

        case CREATE_PRICE_ALERT_REQUEST:
            return {
                ...state,
                creating: true,
                success: false,
                error: null,
            };

        case CREATE_PRICE_ALERT_SUCCESS:
            return {
                ...state,
                creating: false,
                success: true,
                error: null,
                alerts: [
                    action.payload,
                    ...state.alerts,
                ],
            };

        case CREATE_PRICE_ALERT_FAIL:
            return {
                ...state,
                creating: false,
                success: false,
                error: action.payload,
            };

        case DELETE_PRICE_ALERT_REQUEST:
            return {
                ...state,
                deleting: true,
                success: false,
                error: null,
            };

        case DELETE_PRICE_ALERT_SUCCESS:
            return {
                ...state,
                deleting: false,
                success: true,
                error: null,
                alerts: state.alerts.filter(
                    (alert) =>
                        alert._id !== action.payload
                ),
            };

        case DELETE_PRICE_ALERT_FAIL:
            return {
                ...state,
                deleting: false,
                success: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default priceAlertReducer;