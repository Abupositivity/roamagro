import axios from 'axios';

export const fetchFarmProjects = () => async (dispatch) => {
  try {
    const response = await axios.get('/api/v1/farm-projects');
    dispatch({ type: 'FETCH_PROJECTS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_PROJECTS_FAIL', payload: error.response.data });
  }
};

export const createFarmProject = (projectData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/v1/farm-projects', projectData);
    dispatch({ type: 'CREATE_PROJECT_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'CREATE_PROJECT_FAIL', payload: error.response.data });
  }
};

export const updateFarmProject = (id, projectData) => async (dispatch) => {
  try {
    const response = await axios.put(`/api/v1/farm-projects/${id}`, projectData);
    dispatch({ type: 'UPDATE_PROJECT_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'UPDATE_PROJECT_FAIL', payload: error.response.data });
  }
};

export const deleteFarmProject = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/v1/farm-projects/${id}`);
    dispatch({ type: 'DELETE_PROJECT_SUCCESS', payload: id });
  } catch (error) {
    dispatch({ type: 'DELETE_PROJECT_FAIL', payload: error.response.data });
  }
};