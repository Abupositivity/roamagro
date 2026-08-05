import {

    FETCH_AGRI_FEED_REQUEST,
    FETCH_AGRI_FEED_SUCCESS,
    FETCH_AGRI_FEED_FAIL,

} from '../actions/types';

const initialState = {

    tips: [],

    loading: false,

    error: null,

};

const agriFeedReducer = (

    state = initialState,

    action

) => {

    switch (action.type) {

        case FETCH_AGRI_FEED_REQUEST:

            return {

                ...state,

                loading: true,

                error: null,

            };

        case FETCH_AGRI_FEED_SUCCESS:

            return {

                ...state,

                loading: false,

                tips: action.payload,

            };

        case FETCH_AGRI_FEED_FAIL:

            return {

                ...state,

                loading: false,

                error: action.payload,

            };

        default:

            return state;

    }

};

export default agriFeedReducer;