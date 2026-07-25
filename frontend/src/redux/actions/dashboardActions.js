import api from '../../services/api';

import {

    DASHBOARD_REQUEST,
    DASHBOARD_SUCCESS,
    DASHBOARD_FAIL,
    UPDATE_DASHBOARD_POST,
    CLEAR_DASHBOARD_POST,
} from './types';

export const fetchDashboard = () => async (dispatch) => {
    dispatch({
        type: DASHBOARD_REQUEST,
    });
    try {
        const res = await api.get('/dashboard');
        dispatch({
            type: DASHBOARD_SUCCESS,
            payload: res.data.data,
        });
    }
    catch (error) {
        dispatch({
            type: DASHBOARD_FAIL,
            payload:
                error.response?.data?.message ||
                'Unable to load dashboard.',
        });
    }
};

export const updateDashboardPost = (text) => ({
    type: UPDATE_DASHBOARD_POST,
    payload: text,
});

export const clearDashboardPost = () => ({
    type: CLEAR_DASHBOARD_POST,
});