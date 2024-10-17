import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk'; // Import as a named export
import authReducer from './reducers/authReducer';
import farmProjectsReducer from './reducers/farmProjectsReducer';
import marketplaceReducer from './reducers/marketplaceReducer';
import priceIndexReducer from './reducers/priceIndexReducer';
import communityReducer from './reducers/communityReducer';

// Combine reducers into a root reducer
const rootReducer = {
  auth: authReducer,
  farmProjects: farmProjectsReducer,
  marketplace: marketplaceReducer,
  priceIndex: priceIndexReducer,
  community: communityReducer,
};

// Configure the store and apply thunk middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: [thunk], // Add thunk middleware
});

export default store;