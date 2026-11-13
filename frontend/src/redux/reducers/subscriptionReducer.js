import {
    SUBSCRIPTION_FETCH_REQUEST,
    SUBSCRIPTION_FETCH_SUCCESS,
    SUBSCRIPTION_FETCH_FAILURE,
    SUBSCRIPTION_CLEAR,
} from '../actions/subscriptionActions';

import {
    LOGIN_SUCCESS,
    GOOGLE_LOGIN_SUCCESS,
    LOGOUT,
} from '../actions/types';

const initialState = {
    data: null,
    loading: false,
    loaded: false,
    error: null,
};

const subscriptionReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case SUBSCRIPTION_FETCH_REQUEST:
            return {
                ...state,
                data: null,
                loading: true,
                loaded: false,
                error: null,
            };

        case SUBSCRIPTION_FETCH_SUCCESS:
            return {
                ...state,
                loading: false,
                loaded: true,
                data: action.payload,
                error: null,
            };

        case SUBSCRIPTION_FETCH_FAILURE:
            return {
                ...state,
                loading: false,
                loaded: false,
                data: null,
                error: action.payload,
            };

        case SUBSCRIPTION_CLEAR:
        case LOGIN_SUCCESS:
        case GOOGLE_LOGIN_SUCCESS:
        case LOGOUT:
            return initialState;

        default:
            return state;
    }
};

export default subscriptionReducer;