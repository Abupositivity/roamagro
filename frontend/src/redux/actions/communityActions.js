import api from '../../services/api';

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
} from './types';

/*
|--------------------------------------------------------------------------
| Fetch Topics
|--------------------------------------------------------------------------
*/
export const fetchTopics = () => async (dispatch) => {
    dispatch({
        type: FETCH_TOPICS_REQUEST,
    });
    try {
        const res = await api.get('/community');
        dispatch({
            type: FETCH_TOPICS_SUCCESS,
            payload: res.data.data,
        });
    } catch (error) {
        dispatch({
            type: FETCH_TOPICS_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

/*
|--------------------------------------------------------------------------
| Create Topic
|--------------------------------------------------------------------------
*/
export const createTopic = (topic) => async (dispatch) => {
    dispatch({
        type: CREATE_TOPIC_REQUEST,
    });
    try {
        const res = await api.post('/community', topic);
        dispatch({
            type: CREATE_TOPIC_SUCCESS,
            payload: res.data.data,
        });
        console.log('✅ Topic Created');
    } catch (error) {
        dispatch({
            type: CREATE_TOPIC_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

/*
|--------------------------------------------------------------------------
| Add Comment
|--------------------------------------------------------------------------
*/
export const addComment = (postId, content) => async (dispatch) => {
    dispatch({
        type: ADD_COMMENT_REQUEST,
    });
    try {
        const res = await api.post(
            `/community/${postId}/comments`,
            { content }
        );
        dispatch({
            type: ADD_COMMENT_SUCCESS,
            payload: res.data.data,
        });
    } catch (error) {
        dispatch({
            type: ADD_COMMENT_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

/*
|--------------------------------------------------------------------------
| Delete Comment
|--------------------------------------------------------------------------
*/
export const deleteComment = (postId, commentId) => async (dispatch) => {
    dispatch({
        type: DELETE_COMMENT_REQUEST,
    });

    try {
        const res = await api.delete(
            `/community/${postId}/comments/${commentId}`
        );
        dispatch({
            type: DELETE_COMMENT_SUCCESS,
            payload: res.data.data,
        });
    } catch (error) {
        dispatch({
            type: DELETE_COMMENT_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};

/*
|--------------------------------------------------------------------------
| Like / Unlike Post
|--------------------------------------------------------------------------
*/

export const likePost = (postId) => async (dispatch) => {
    dispatch({
        type: LIKE_POST_REQUEST,
    });
    try {
        const res = await api.post(
            `/community/${postId}/like`
        );
        dispatch({
            type: LIKE_POST_SUCCESS,
            payload: res.data.data,
        });
    } catch (error) {
        dispatch({
            type: LIKE_POST_FAIL,
            payload: error.response?.data?.message || error.message,
        });
    }
};