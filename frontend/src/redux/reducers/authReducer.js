const initialState = {
  user: null,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
      case 'LOGIN_SUCCESS':
      case 'REGISTER_SUCCESS':
      case 'GOOGLE_LOGIN_SUCCESS':
          return { ...state, user: action.payload, isAuthenticated: true };
      case 'LOGIN_FAIL':
      case 'REGISTER_FAIL':
      case 'GOOGLE_LOGIN_FAIL':
          return { ...state, error: action.payload, isAuthenticated: false };
      case 'LOGOUT':
          return { ...state, user: null, isAuthenticated: false };
      default:
          return state;
  }
};

export default authReducer;