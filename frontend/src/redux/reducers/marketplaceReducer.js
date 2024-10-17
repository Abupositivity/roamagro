const initialState = {
    listings: [],
    error: null,
  };
  
  const marketplaceReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'FETCH_LISTINGS_SUCCESS':
        return { ...state, listings: action.payload };
      case 'FETCH_LISTINGS_FAIL':
        return { ...state, error: action.payload };
      case 'CREATE_LISTING_SUCCESS':
        return { ...state, listings: [...state.listings, action.payload] };
      case 'CREATE_LISTING_FAIL':
        return { ...state, error: action.payload };
      case 'UPDATE_LISTING_SUCCESS':
        return {
          ...state,
          listings: state.listings.map((listing) =>
            listing._id === action.payload._id ? action.payload : listing
          ),
        };
      case 'UPDATE_LISTING_FAIL':
        return { ...state, error: action.payload };
      case 'DELETE_LISTING_SUCCESS':
        return { ...state, listings: state.listings.filter((listing) => listing._id !== action.payload) };
      case 'DELETE_LISTING_FAIL':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  };
  
  export default marketplaceReducer;