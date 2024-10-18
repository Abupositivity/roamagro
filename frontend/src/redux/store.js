// eslint-disable-next-line no-unused-vars
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit'; // Import getDefaultMiddleware
import authReducer from './reducers/authReducer';
import farmProjectsReducer from './reducers/farmProjectsReducer';
import marketplaceReducer from './reducers/marketplaceReducer';
import priceIndexReducer from './reducers/priceIndexReducer';
import communityReducer from './reducers/communityReducer';

const rootReducer = {
  auth: authReducer,
  farmProjects: farmProjectsReducer,
  marketplace: marketplaceReducer,
  priceIndex: priceIndexReducer,
  community: communityReducer,
};

// Configure the store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;