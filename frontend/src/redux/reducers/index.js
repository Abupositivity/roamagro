import { combineReducers } from 'redux';

import authReducer from './authReducer';
import farmProjectsReducer from './farmProjectsReducer';
import marketplaceReducer from './marketplaceReducer';
import communityReducer from './communityReducer';
import priceIndexReducer from './priceIndexReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    farmProjects: farmProjectsReducer,
    marketplace: marketplaceReducer,
    community: communityReducer,
    priceIndex: priceIndexReducer,
});

export default rootReducer;