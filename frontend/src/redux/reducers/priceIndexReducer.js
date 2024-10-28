const initialState = {
  priceIndex: [],
  loading: false,
  error: null
};

const priceIndexReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PRICE_INDEX_SUCCESS':
      return { ...state, priceIndex: action.payload, loading: false };
    case 'FETCH_PRICE_INDEX_FAIL':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_PRICE_INDEX_SUCCESS':
      return { ...state, priceIndex: [...state.priceIndex, action.payload] };
    default:
      return state;
  }
};

export default priceIndexReducer;