import { configureStore } from '@reduxjs/toolkit';
import logger from 'redux-logger';

import rootReducer from './reducers';

const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        const middleware = getDefaultMiddleware({
            serializableCheck: false,
        });
        if (process.env.NODE_ENV !== 'production') {
            middleware.push(logger);
        }
        return middleware;
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;