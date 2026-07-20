import {
    FETCH_TOPICS_REQUEST,
    FETCH_TOPICS_SUCCESS,
    FETCH_TOPICS_FAIL,
    CREATE_TOPIC_REQUEST,
    CREATE_TOPIC_SUCCESS,
    CREATE_TOPIC_FAIL,
} from '../actions/types';

const initialState = {
    topics: [],
    loading: false,
    success: false,
    error: null,
};

const communityReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_TOPICS_REQUEST:
        case CREATE_TOPIC_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };
        case FETCH_TOPICS_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: action.payload,
                error: null,
            };
        case CREATE_TOPIC_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: [action.payload, ...state.topics],
                error: null,
            };
        case FETCH_TOPICS_FAIL:
        case CREATE_TOPIC_FAIL:
            return {
                ...state,
                loading: false,
                success: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export default communityReducer;