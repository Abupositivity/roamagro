import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import farmProjectsReducer from './reducers/farmProjectsReducer';
import marketplaceReducer from './reducers/marketplaceReducer';
import priceIndexReducer from './reducers/priceIndexReducer';
import communityReducer from './reducers/communityReducer';
import logger from 'redux-logger';

const rootReducer = {
  auth: authReducer,
  farmProjects: farmProjectsReducer,
  marketplace: marketplaceReducer,
  priceIndex: priceIndexReducer,
  community: communityReducer,
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(logger),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;