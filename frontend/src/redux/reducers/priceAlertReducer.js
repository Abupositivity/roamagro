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

    success: false,

    error: null,

};

const priceAlertReducer = (

    state = initialState,

    action

) => {

    switch (action.type) {

        case GET_PRICE_ALERTS_REQUEST:
        case CREATE_PRICE_ALERT_REQUEST:
        case DELETE_PRICE_ALERT_REQUEST:

            return {

                ...state,

                loading: true,

                success: false,

                error: null,

            };

        case GET_PRICE_ALERTS_SUCCESS:

            return {

                ...state,

                loading: false,

                success: true,

                alerts: action.payload,

            };

        case CREATE_PRICE_ALERT_SUCCESS:

            return {

                ...state,

                loading: false,

                success: true,

                alerts: [

                    action.payload,

                    ...state.alerts,

                ],

            };

        case DELETE_PRICE_ALERT_SUCCESS:

            return {

                ...state,

                loading: false,

                success: true,

                alerts: state.alerts.filter(

                    alert =>

                        alert._id !==

                        action.payload

                ),

            };

        case GET_PRICE_ALERTS_FAIL:
        case CREATE_PRICE_ALERT_FAIL:
        case DELETE_PRICE_ALERT_FAIL:

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

export default priceAlertReducer;