import api from '../../services/api';

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
} from './types';

export const register = (userData, navigate) => async (dispatch) => {

    dispatch({ type: REGISTER_REQUEST });

    try {

        const res = await api.post('/auth/register', userData);

        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data.data,
        });

        console.log("✅ Registration Successful");

        dispatch(login({
            email: userData.email,
            password: userData.password,
        }, navigate));

    } catch (error) {

        console.error(error);

        dispatch({
            type: REGISTER_FAIL,
            payload: error.response?.data?.message || "Registration failed",
        });

    }

};

export const login = (credentials, navigate) => async (dispatch) => {

    dispatch({ type: LOGIN_REQUEST });

    try {

        const res = await api.post('/auth/login', credentials);

        localStorage.setItem('token', res.data.data.token);

        dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data.data,
        });

        console.log("✅ Login Successful");

        navigate('/dashboard');

    }

    catch (error) {

        dispatch({
            type: LOGIN_FAIL,
            payload: error.response?.data?.message || "Login failed",
        });

    }

};

export const googleLogin = (token, navigate) => async (dispatch) => {

    dispatch({
        type: GOOGLE_LOGIN_REQUEST,
    });

    try {

        const res = await api.post('/auth/google', {
            token,
        });

        localStorage.setItem('token', res.data.data.token);

        dispatch({
            type: GOOGLE_LOGIN_SUCCESS,
            payload: res.data.data,
        });

        console.log("✅ Google Login Successful");

        navigate('/dashboard');

    }

    catch (error) {

        dispatch({
            type: GOOGLE_LOGIN_FAIL,
            payload: error.response?.data?.message || "Google Login Failed",
        });

    }

};

export const logout = () => (dispatch) => {

    localStorage.removeItem("token");

    dispatch({
        type: LOGOUT,
    });

};