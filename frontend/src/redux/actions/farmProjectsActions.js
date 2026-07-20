import api from '../../services/api';

import {
    FETCH_PROJECTS_REQUEST,
    FETCH_PROJECTS_SUCCESS,
    FETCH_PROJECTS_FAIL,
    CREATE_PROJECT_REQUEST,
    CREATE_PROJECT_SUCCESS,
    CREATE_PROJECT_FAIL,
} from './types';

export const fetchFarmProjects = () => async (dispatch) => {
    dispatch({
        type: FETCH_PROJECTS_REQUEST,
    });
    try {
        const res = await api.get('/farm-projects');
        dispatch({
            type: FETCH_PROJECTS_SUCCESS,
            payload: res.data.data,
        });
    }
    catch (error) {
        dispatch({
            type: FETCH_PROJECTS_FAIL,
            payload: error.response?.data?.message,
        });
    }
};

export const createFarmProject = (project) => async (dispatch) => {
    dispatch({
        type: CREATE_PROJECT_REQUEST,
    });
    try {
        const res = await api.post('/farm-projects', project);
        dispatch({
            type: CREATE_PROJECT_SUCCESS,
            payload: res.data.data,
        });
        console.log("✅ Farm Project Created");
    }
    catch (error) {
        dispatch({
            type: CREATE_PROJECT_FAIL,
            payload: error.response?.data?.message,
        });
    }
};