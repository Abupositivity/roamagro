import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import rootReducer from './reducers';

import {
    LOGIN_SUCCESS,
    GOOGLE_LOGIN_SUCCESS,
    LOGOUT,
} from './actions/types';

import {
    invalidateSubscriptionRequests,
} from './actions/subscriptionActions';

const subscriptionSessionMiddleware = () => (next) => (action) => {
    if (
        action.type === LOGIN_SUCCESS ||
        action.type === GOOGLE_LOGIN_SUCCESS ||
        action.type === LOGOUT
    ) {
        invalidateSubscriptionRequests();
    }

    return next(action);
};

const store = configureStore({
    reducer: rootReducer,

    middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware({
            serializableCheck: false,
        });

        middleware.push(subscriptionSessionMiddleware);

        if (process.env.NODE_ENV !== 'production') {
            middleware.push(logger);
        }

        return middleware;
    },

    devTools: process.env.NODE_ENV !== 'production',
});

export default store;