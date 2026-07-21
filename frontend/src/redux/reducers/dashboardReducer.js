import {
    DASHBOARD_REQUEST,
    DASHBOARD_SUCCESS,
    DASHBOARD_FAIL,
    UPDATE_DASHBOARD_POST,
    CLEAR_DASHBOARD_POST,
} from '../actions/types';

const initialState = {

    loading: false,

    error: null,

    dashboard: {

        weather: null,

        priceSummary: [],

        recentProjects: [],

        marketplace: [],

        feed: [],

        notifications: [],

    },

    postContent: '',

};

const dashboardReducer = (state = initialState, action) => {

    switch (action.type) {

        case DASHBOARD_REQUEST:

            return {
                ...state,
                loading: true,
                error: null,
            };

        case DASHBOARD_SUCCESS:

            return {
                ...state,
                loading: false,
                dashboard: action.payload,
            };

        case DASHBOARD_FAIL:

            return {
                ...state,
                loading: false,
                error: action.payload,
            };

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