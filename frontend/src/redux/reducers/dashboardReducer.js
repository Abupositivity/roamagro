import {
    DASHBOARD_REQUEST,
    DASHBOARD_SUCCESS,
    DASHBOARD_FAIL,
    UPDATE_DASHBOARD_POST,
    CLEAR_DASHBOARD_POST,
} from '../actions/types';

const initialState = {
    loading: false,
    refreshing: false,
    error: null,
    lastUpdated: null,

    dashboard: {
        summary: {},
        weather: null,
        priceSummary: [],
        recentProjects: [],
        marketplace: [],
        feed: [],
        notifications: [],
        extension: {},
        admin: {},
    },

    postContent: '',
};

const dashboardReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case DASHBOARD_REQUEST: {
            const silent =
                action.meta?.silent === true;

            return {
                ...state,
                loading: !silent,
                refreshing: silent,
                error: silent
                    ? state.error
                    : null,
            };
        }

        case DASHBOARD_SUCCESS:
            return {
                ...state,
                loading: false,
                refreshing: false,
                error: null,
                lastUpdated: Date.now(),
                dashboard: action.payload,
            };

        case DASHBOARD_FAIL: {
            const silent =
                action.meta?.silent === true;

            return {
                ...state,
                loading: false,
                refreshing: false,
                error: silent
                    ? state.error
                    : action.payload,
            };
        }

        case UPDATE_DASHBOARD_POST:
            return {
                ...state,
                postContent: action.payload,
            };

        case CLEAR_DASHBOARD_POST:
            return {
                ...state,
                postContent: '',
            };

        default:
            return state;
    }
};

export default dashboardReducer;