import {
    LOGIN_REQUEST,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_REQUEST,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    GOOGLE_LOGIN_REQUEST,
    GOOGLE_LOGIN_SUCCESS,
    GOOGLE_LOGIN_FAIL,
    LOGOUT,
} from '../actions/types';

const initialState = {
    token: localStorage.getItem('token'),
    user: JSON.parse(localStorage.getItem('user')),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    success: false,
    error: null,
};

const authReducer = (state = initialState, action) => {
    switch (action.type) {
        case REGISTER_REQUEST:
        case LOGIN_REQUEST:
        case GOOGLE_LOGIN_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };
        case REGISTER_SUCCESS:
        case LOGIN_SUCCESS:
        case GOOGLE_LOGIN_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                isAuthenticated: true,
                token: action.payload.token,
                user: action.payload.user,
                error: null,
            };
        case REGISTER_FAIL:
        case LOGIN_FAIL:
        case GOOGLE_LOGIN_FAIL:
            return {
                ...state,
                loading: false,
                success: false,
                error: action.payload,
            };

        case LOGOUT:
            return {
                token: null,
                user: null,
                isAuthenticated: false,
                loading: false,
                success: false,
                error: null,
            };
        default:
            return state;
    }
};

export default authReducer;