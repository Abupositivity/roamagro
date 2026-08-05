import {
    FETCH_TOPICS_REQUEST,
    FETCH_TOPICS_SUCCESS,
    FETCH_TOPICS_FAIL,
    CREATE_TOPIC_REQUEST,
    CREATE_TOPIC_SUCCESS,
    CREATE_TOPIC_FAIL,
    ADD_COMMENT_REQUEST,
    ADD_COMMENT_SUCCESS,
    ADD_COMMENT_FAIL,
    DELETE_COMMENT_REQUEST,
    DELETE_COMMENT_SUCCESS,
    DELETE_COMMENT_FAIL,
    LIKE_POST_REQUEST,
    LIKE_POST_SUCCESS,
    LIKE_POST_FAIL,
} from '../actions/types';

const initialState = {
    topics: [],
    loading: false,
    success: false,
    error: null,
};

const communityReducer = (state = initialState, action) => {
    switch (action.type) {
        /*
        |--------------------------------------------------------------------------
        | Requests
        |--------------------------------------------------------------------------
        */
        case FETCH_TOPICS_REQUEST:
        case CREATE_TOPIC_REQUEST:
        case ADD_COMMENT_REQUEST:
        case DELETE_COMMENT_REQUEST:
        case LIKE_POST_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Fetch Topics
        |--------------------------------------------------------------------------
        */
        case FETCH_TOPICS_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: action.payload,
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Create Topic
        |--------------------------------------------------------------------------
        */
        case CREATE_TOPIC_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: [
                    action.payload,
                    ...state.topics,
                ],
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Add Comment
        |--------------------------------------------------------------------------
        */
        case ADD_COMMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: state.topics.map((topic) =>
                    topic._id === action.payload._id
                        ? action.payload
                        : topic
                ),
                error: null,
            };

        /*
        |--------------------------------------------------------------------------
        | Delete Comment
        |--------------------------------------------------------------------------
        */
        case DELETE_COMMENT_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: state.topics.map((topic) =>
                    topic._id === action.payload._id
                        ? action.payload
                        : topic
                ),
                error: null,
            };
        
        /*
        |--------------------------------------------------------------------------
        | Like Post
        |--------------------------------------------------------------------------
        */
        case LIKE_POST_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: state.topics.map((topic) =>
                    topic._id === action.payload._id
                        ? action.payload
                        : topic
                ),
            };

        /*
        |--------------------------------------------------------------------------
        | Errors
        |--------------------------------------------------------------------------
        */
        case FETCH_TOPICS_FAIL:
        case CREATE_TOPIC_FAIL:
        case ADD_COMMENT_FAIL:
        case DELETE_COMMENT_FAIL:
         case LIKE_POST_FAIL:
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