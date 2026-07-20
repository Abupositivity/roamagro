import api from '../../services/api';

export const fetchFarmProjects = () => async (dispatch) => {
    try {
        const { data } = await api.get('/farm-projects');
        dispatch({
            type: 'FETCH_PROJECTS_SUCCESS',
            payload: data.projects
        });
    } catch (err) {
        dispatch({
            type: 'FETCH_PROJECTS_FAIL',
            payload: err.response?.data?.message
        });
    }
};

export const createFarmProject = (project) => async (dispatch) => {

    try {
        const { data } = await api.post('/farm-projects', project);
        dispatch({
            type: 'CREATE_PROJECT_SUCCESS',
            payload: data.project
        });
        console.log('✅ Farm Project created');

    } catch (err) {
        dispatch({
            type: 'CREATE_PROJECT_FAIL',
            payload: err.response?.data?.message
        });
    }
};

export const updateFarmProject = (id, project) => async (dispatch) => {

    try {
        const { data } = await api.put(`/farm-projects/${id}`, project);
        dispatch({
            type: 'UPDATE_PROJECT_SUCCESS',
            payload: data.project
        });
    } catch (err) {
        dispatch({
            type: 'UPDATE_PROJECT_FAIL',
            payload: err.response?.data?.message
        });
    }
};

export const deleteFarmProject = (id) => async (dispatch) => {
    try {
        await api.delete(`/farm-projects/${id}`);
        dispatch({
            type: 'DELETE_PROJECT_SUCCESS',
            payload: id
        });
    } catch (err) {
        dispatch({
            type: 'DELETE_PROJECT_FAIL',
            payload: err.response?.data?.message
        });
    }
};