import { combineReducers } from 'redux';

import authReducer from './authReducer';
import dashboardReducer from './dashboardReducer';
import farmProjectsReducer from './farmProjectsReducer';
import marketplaceReducer from './marketplaceReducer';
import communityReducer from './communityReducer';
import priceIndexReducer from './priceIndexReducer';
import financialReducer from './financialReducer';
import priceAlertReducer from './priceAlertReducer';
import agriFeedReducer from './agriFeedReducer';
import notificationReducer from './notificationReducer';
import connectionReducer from './connectionReducer';
import subscriptionReducer from './subscriptionReducer';

const rootReducer = combineReducers({
    auth: authReducer,
    dashboard: dashboardReducer,
    farmProjects: farmProjectsReducer,
    marketplace: marketplaceReducer,
    community: communityReducer,
    priceIndex: priceIndexReducer,
    financial:financialReducer,
    priceAlerts: priceAlertReducer,
    agriFeed: agriFeedReducer,
    notifications: notificationReducer,
    connection: connectionReducer,
    subscription: subscriptionReducer,
});

export default rootReducer;