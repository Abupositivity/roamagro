const initialState = {
    priceIndex: [],
    error: null,
  };
  
  const priceIndexReducer = (state = initialState, action) => {
    switch (action.type) {
      case 'FETCH_PRICE_INDEX_SUCCESS':
        return { ...state, priceIndex: action.payload };
      case 'FETCH_PRICE_INDEX_FAIL':
        return { ...state, error: action.payload };
      case 'UPDATE_PRICE_INDEX_SUCCESS':
        return { ...state, priceIndex: action.payload };
      case 'UPDATE_PRICE_INDEX_FAIL':
        return { ...state, error: action.payload };
      default:
        return state;
    }
  };
  
  export default priceIndexReducer;