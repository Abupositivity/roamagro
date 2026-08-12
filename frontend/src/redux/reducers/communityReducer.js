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
    UPDATE_TOPIC_REQUEST,
    UPDATE_TOPIC_SUCCESS,
    UPDATE_TOPIC_FAIL,
    DELETE_TOPIC_REQUEST,
    DELETE_TOPIC_SUCCESS,
    DELETE_TOPIC_FAIL,
    SHARE_POST_REQUEST,
    SHARE_POST_SUCCESS,
    SHARE_POST_FAIL,
} from '../actions/types';

const initialState = {
    topics: [],
    loading: false,
    success: false,
    error: null,
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
    search: '',
    category: 'All',
    mine: false,
    loadingMore: false,
};

const communityReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case FETCH_TOPICS_REQUEST:
            return {
                ...state,
                loading:
                    !action.meta?.append,
                loadingMore:
                    action.meta?.append || false,
                success: false,
                error: null,
            };

        case CREATE_TOPIC_REQUEST:
        case UPDATE_TOPIC_REQUEST:
        case DELETE_TOPIC_REQUEST:
        case ADD_COMMENT_REQUEST:
        case DELETE_COMMENT_REQUEST:
        case LIKE_POST_REQUEST:
        case SHARE_POST_REQUEST:
            return {
                ...state,
                loading: true,
                success: false,
                error: null,
            };

        case FETCH_TOPICS_SUCCESS: {
            const {
                data = [],
                page = 1,
                limit = 10,
                total = 0,
                totalPages = 0,
                hasMore = false,
                search = '',
                category = 'All',
                mine = false,
                append = false,
            } = action.payload;

            return {
                ...state,
                loading: false,
                loadingMore: false,
                success: true,
                error: null,
                topics: append
                    ? [
                          ...state.topics,
                          ...data,
                      ]
                    : data,
                page,
                limit,
                total,
                totalPages,
                hasMore,
                search,
                category,
                mine,
            };
        }

        case CREATE_TOPIC_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: [
                    action.payload,
                    ...state.topics,
                ],
                total: state.total + 1,
                error: null,
            };

        case UPDATE_TOPIC_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: state.topics.map(
                    (topic) =>
                        topic._id ===
                        action.payload._id
                            ? action.payload
                            : topic
                ),
                error: null,
            };

        case DELETE_TOPIC_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: state.topics.filter(
                    (topic) =>
                        topic._id !==
                        action.payload._id
                ),
                total: Math.max(
                    state.total - 1,
                    0
                ),
                error: null,
            };

        case ADD_COMMENT_SUCCESS:
        case DELETE_COMMENT_SUCCESS:
        case LIKE_POST_SUCCESS:
        case SHARE_POST_SUCCESS:
            return {
                ...state,
                loading: false,
                success: true,
                topics: state.topics.map(
                    (topic) =>
                        topic._id ===
                        action.payload._id
                            ? action.payload
                            : topic
                ),
                error: null,
            };

        case FETCH_TOPICS_FAIL:
            return {
                ...state,
                loading: false,
                loadingMore: false,
                success: false,
                error: action.payload,
            };

        case CREATE_TOPIC_FAIL:
        case UPDATE_TOPIC_FAIL:
        case DELETE_TOPIC_FAIL:
        case ADD_COMMENT_FAIL:
        case DELETE_COMMENT_FAIL:
        case LIKE_POST_FAIL:
        case SHARE_POST_FAIL:
            return {
                ...state,
                loading: false,
                loadingMore: false,
                success: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default communityReducer;