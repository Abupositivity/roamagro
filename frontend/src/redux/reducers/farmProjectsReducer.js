const initialState = {
    projects: [],
    error: null,
  };
  
  const farmProjectsReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'FETCH_PROJECTS_SUCCESS':
        return { ...state, projects: action.payload };
      case 'FETCH_PROJECTS_FAIL':
        return { ...state, error: action.payload };
      case 'CREATE_PROJECT_SUCCESS':
        return { ...state, projects: [...state.projects, action.payload] };
      case 'CREATE_PROJECT_FAIL':
        return { ...state, error: action.payload };
      case 'UPDATE_PROJECT_SUCCESS':
        return {
          ...state,
          projects: state.projects.map((project) =>
            project._id === action.payload._id ? action.payload : project
          ),
        };
      case 'UPDATE_PROJECT_FAIL':
        return { ...state, error: action.payload };
      case 'DELETE_PROJECT_SUCCESS':
        return {
          ...state,
          projects: state.projects.filter((project) => project._id !== action.payload),
        };
      case 'DELETE_PROJECT_FAIL':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  };
  
  export default farmProjectsReducer;