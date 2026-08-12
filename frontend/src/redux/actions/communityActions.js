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
    UPDATE_TOPIC_REQUEST,
    UPDATE_TOPIC_SUCCESS,
    UPDATE_TOPIC_FAIL,
    DELETE_TOPIC_REQUEST,
    DELETE_TOPIC_SUCCESS,
    DELETE_TOPIC_FAIL,
    SHARE_POST_REQUEST,
    SHARE_POST_SUCCESS,
    SHARE_POST_FAIL,
} from './types';

export const fetchTopics =
    (params = {}) =>
    async (dispatch) => {
        dispatch({
            type: FETCH_TOPICS_REQUEST,
            meta: {
                append: Boolean(params.append),
            },
        });

        try {
            const requestParams = {
                page: params.page || 1,
                limit: params.limit || 10,
            };

            if (params.search?.trim()) {
                requestParams.search =
                    params.search.trim();
            }

            if (
                params.category &&
                params.category !== 'All'
            ) {
                requestParams.category =
                    params.category;
            }

            if (params.mine) {
                requestParams.mine = true;
            }

            const res = await api.get(
                '/community',
                {
                    params: requestParams,
                }
            );

            dispatch({
                type: FETCH_TOPICS_SUCCESS,
                payload: {
                    ...res.data,
                    append: Boolean(
                        params.append
                    ),
                },
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to load community posts.';

            dispatch({
                type: FETCH_TOPICS_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const createTopic =
    (topic) => async (dispatch) => {
        dispatch({
            type: CREATE_TOPIC_REQUEST,
        });

        try {
            const res = await api.post(
                '/community',
                topic
            );

            dispatch({
                type: CREATE_TOPIC_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to create community post.';

            dispatch({
                type: CREATE_TOPIC_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const updateTopic =
    (postId, data) => async (dispatch) => {
        dispatch({
            type: UPDATE_TOPIC_REQUEST,
        });

        try {
            const res = await api.put(
                `/community/${postId}`,
                data
            );

            dispatch({
                type: UPDATE_TOPIC_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to update community post.';

            dispatch({
                type: UPDATE_TOPIC_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const deleteTopic =
    (postId) => async (dispatch) => {
        dispatch({
            type: DELETE_TOPIC_REQUEST,
        });

        try {
            const res = await api.delete(
                `/community/${postId}`
            );

            dispatch({
                type: DELETE_TOPIC_SUCCESS,
                payload: {
                    _id: postId,
                },
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to delete community post.';

            dispatch({
                type: DELETE_TOPIC_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const sharePost =
    (postId) => async (dispatch) => {
        dispatch({
            type: SHARE_POST_REQUEST,
        });

        try {
            const res = await api.post(
                `/community/${postId}/share`
            );

            dispatch({
                type: SHARE_POST_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to record post share.';

            dispatch({
                type: SHARE_POST_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const addComment =
    (postId, content) =>
    async (dispatch) => {
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

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to add comment.';

            dispatch({
                type: ADD_COMMENT_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const deleteComment =
    (postId, commentId) =>
    async (dispatch) => {
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

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to delete comment.';

            dispatch({
                type: DELETE_COMMENT_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };

export const likePost =
    (postId) => async (dispatch) => {
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

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message =
                error.response?.data?.message ||
                error.message ||
                'Failed to update post like.';

            dispatch({
                type: LIKE_POST_FAIL,
                payload: message,
            });

            return {
                success: false,
                error: message,
            };
        }
    };