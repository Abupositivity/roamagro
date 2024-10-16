import axios from 'axios';

// Action to fetch all farm Projects for authenticated user
export const fetchFarmProjects = () => async (dispatch) => {
    try {
        const response = await axios.get('/api/farm-projects');
        dispatch({ type: 'FETCH_PROJECTS_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'FETCH_PROJECTS_FAIL', payload: error.response.data });
  }
};

// Action to create a new farm project
export const createFarmProject = (projectData) => async (dispatch) => {
  try {
    const response = await axios.post('/api/farm-projects', projectData);
    dispatch({ type: 'CREATE_PROJECT_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'CREATE_PROJECT_FAIL', payload: error.response.data });
  }
};

// Action to update an existing farm project
export const updateFarmProject = (id, projectData) => async (dispatch) => {
  try {
    const response = await axios.put(`/api/farm-projects/${id}`, projectData);
    dispatch({ type: 'UPDATE_PROJECT_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'UPDATE_PROJECT_FAIL', payload: error.response.data });
  }
};

// Action to delete a farm project
export const deleteFarmProject = (id) => async (dispatch) => {
  try {
    await axios.delete(`/api/farm-projects/${id}`);
    dispatch({ type: 'DELETE_PROJECT_SUCCESS', payload: id });
  } catch (error) {
    dispatch({ type: 'DELETE_PROJECT_FAIL', payload: error.response.data });
  }
};