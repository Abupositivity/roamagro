import axios from 'axios';
import {
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    GOOGLE_LOGIN_SUCCESS,
    GOOGLE_LOGIN_FAIL,
} from './types';

// Set Axios base URL globally
axios.defaults.baseURL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

export const register = (userData, navigate) => async (dispatch) => {
    try {
        const res = await axios.post('/api/auth/register', userData);
        dispatch({ type: REGISTER_SUCCESS, payload: res.data });

        // Automatically log in the user after successful registration
        dispatch(login({ email: userData.email, password: userData.password }, navigate));
    } catch (err) {
        console.error('Registration failed:', err);
        dispatch({
            type: REGISTER_FAIL,
            payload: err.response?.data?.error || 'Registration failed',
        });
    }
};

export const login = (userData, navigate) => async (dispatch) => {
    try {
        const res = await axios.post('/api/auth/login', userData);

        if (res.data) {
            dispatch({ type: LOGIN_SUCCESS, payload: res.data });
            localStorage.setItem('token', res.data.token); // Store JWT for session
            navigate('/dashboard');
        }
    } catch (err) {
        console.error('Login failed:', err);
        dispatch({
            type: LOGIN_FAIL,
            payload: err.response?.data?.message || 'Login failed',
        });
    }
};

export const googleLogin = (token, navigate) => async (dispatch) => {
    try {
        const res = await axios.post('/api/auth/google', { token });

        if (res.data) {
            dispatch({ type: GOOGLE_LOGIN_SUCCESS, payload: res.data });
            localStorage.setItem('token', res.data.token); // Store JWT for session
            navigate('/dashboard');
        }
    } catch (err) {
        console.error('Google login failed:', err);
        dispatch({
            type: GOOGLE_LOGIN_FAIL,
            payload: err.response?.data?.error || 'Google login failed',
        });
    }
};