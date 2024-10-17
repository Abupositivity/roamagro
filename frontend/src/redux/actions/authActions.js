import axios from 'axios';

export const login = (credentials) => async (dispatch) => {
  try {
    const response = await axios.post('/auth/login', credentials);
    dispatch({ type: 'LOGIN_SUCCESS', payload: response.data });
  } catch (error) {
    dispatch({ type: 'LOGIN_FAIL', payload: error.response.data });
  }
};

export const googleLogin = () => async (dispatch) => {
  try {
    window.location.href = '/auth/google';
  } catch (error) {
    dispatch({ type: 'LOGIN_FAIL', payload: error.response.data });
  }
};