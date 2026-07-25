import api from "../../services/api";

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
} from "./types";

/*
|--------------------------------------------------------------------------
| Register User
|--------------------------------------------------------------------------
*/
export const register = (userData) => async (dispatch) => {
    dispatch({
        type: REGISTER_REQUEST,
    });
    try {
        const res = await api.post("/auth/register", userData);
        dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data.data,
        });
        // Automatically log the user in after registration
        dispatch(login({
            email: userData.email,
            password: userData.password,
        }));
    } catch (error) {
        dispatch({
            type: REGISTER_FAIL,
            payload:
                error.response?.data?.message ||
                "Registration failed.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Login User
|--------------------------------------------------------------------------
*/
export const login = (credentials) => async (dispatch) => {
    dispatch({
        type: LOGIN_REQUEST,
    });
    try {
        const res = await api.post("/auth/login", credentials);
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        dispatch({
            type: LOGIN_SUCCESS,
            payload: {
                token,
                user,
            },
        });
    } catch (error) {
        dispatch({
            type: LOGIN_FAIL,
            payload:
                error.response?.data?.message ||
                "Invalid email or password.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Google Login
|--------------------------------------------------------------------------
*/
export const googleLogin = (googleToken) => async (dispatch) => {
    dispatch({
        type: GOOGLE_LOGIN_REQUEST,
    });
    try {
        const res = await api.post("/auth/google", {
            token: googleToken,
        });
        const { token, user } = res.data.data;
        localStorage.setItem("token", token);
        dispatch({
            type: GOOGLE_LOGIN_SUCCESS,
            payload: {
                token,
                user,
            },
        });
    } catch (error) {
        dispatch({
            type: GOOGLE_LOGIN_FAIL,
            payload:
                error.response?.data?.message ||
                "Google login failed.",
        });
    }
};

/*
|--------------------------------------------------------------------------
| Logout
|--------------------------------------------------------------------------
*/
export const logout = () => (dispatch) => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({
        type: LOGOUT,
    });
};