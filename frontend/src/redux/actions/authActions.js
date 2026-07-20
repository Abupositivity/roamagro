import api from '../../services/api';

import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    GOOGLE_LOGIN_SUCCESS,
    GOOGLE_LOGIN_FAIL,
    LOGOUT,
} from './types';

export const register = (userData, navigate) => async (dispatch) => {
    try {
        const { data } = await api.post('/auth/register', userData);
        console.log('✅ Registration successful');
        dispatch({
            type: REGISTER_SUCCESS,
            payload: data
        });
        dispatch(login({
            email: userData.email,
            password: userData.password
        }, navigate));
    } catch (err) {
        console.error(err.response?.data || err);
        dispatch({
            type: REGISTER_FAIL,
            payload: err.response?.data?.message || 'Registration failed'
        });
    }
};

export const login = (credentials, navigate) => async (dispatch) => {
    try {
        const { data } = await api.post('/auth/login', credentials);
        localStorage.setItem('token', data.token);
        dispatch({
            type: LOGIN_SUCCESS,
            payload: data
        });
        console.log('✅ Login successful');
        navigate('/dashboard');
    } catch (err) {
        console.error(err.response?.data || err);
        dispatch({
            type: LOGIN_FAIL,
            payload: err.response?.data?.message || 'Login failed'
        });
    }
};

export const googleLogin = (token, navigate) => async (dispatch) => {
    try {
        const { data } = await api.post('/auth/google', {
            token
        });
        localStorage.setItem('token', data.token);
        dispatch({
            type: GOOGLE_LOGIN_SUCCESS,
            payload: data
        });
        console.log('✅ Google Login successful');
        navigate('/dashboard');
    } catch (err) {
        console.error(err.response?.data || err);
        dispatch({
            type: GOOGLE_LOGIN_FAIL,
            payload: err.response?.data?.message || 'Google Login failed'
        });
    }
};

export const logout = () => (dispatch) => {
    localStorage.removeItem('token');
    dispatch({
        type: LOGOUT
    });
};