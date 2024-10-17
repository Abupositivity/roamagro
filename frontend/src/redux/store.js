import { configureStore, applyMiddleware, combineReducers } from 'redux';
import thunk from 'redux-thunk';
import authReducer from './reducers/authReducer';
import farmProjectsReducer from './reducers/farmProjectsReducer';
import marketplaceReducer from './reducers/marketplaceReducer';
import priceIndexReducer from './reducers/priceIndexReducer';
import communityReducer from './reducers/communityReducer';

const rootReducer = combineReducers({
  auth: authReducer,
  farmProjects: farmProjectsReducer,
  marketplace: marketplaceReducer,
  priceIndex: priceIndexReducer,
  community: communityReducer,
});

const store = configureStore(rootReducer, applyMiddleware(thunk));

export default store;