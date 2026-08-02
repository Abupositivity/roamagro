import { combineReducers } from 'redux';

import authReducer from './authReducer';
import dashboardReducer from './dashboardReducer';
import farmProjectsReducer from './farmProjectsReducer';
import marketplaceReducer from './marketplaceReducer';
import communityReducer from './communityReducer';
import priceIndexReducer from './priceIndexReducer';
import financialReducer from './financialReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    farmProjects: farmProjectsReducer,
    marketplace: marketplaceReducer,
    community: communityReducer,
    priceIndex: priceIndexReducer,
    financial:financialReducer
});

export default rootReducer;