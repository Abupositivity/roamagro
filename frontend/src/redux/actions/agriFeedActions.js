import api from '../../services/api';

import {
    FETCH_AGRI_FEED_REQUEST,
    FETCH_AGRI_FEED_SUCCESS,
    FETCH_AGRI_FEED_FAIL,
    CREATE_AGRI_FEED_REQUEST,
    CREATE_AGRI_FEED_SUCCESS,
    CREATE_AGRI_FEED_FAIL,
    UPDATE_AGRI_FEED_REQUEST,
    UPDATE_AGRI_FEED_SUCCESS,
    UPDATE_AGRI_FEED_FAIL,
    DELETE_AGRI_FEED_REQUEST,
    DELETE_AGRI_FEED_SUCCESS,
    DELETE_AGRI_FEED_FAIL,
    LIKE_AGRI_TIP_REQUEST,
    LIKE_AGRI_TIP_SUCCESS,
    LIKE_AGRI_TIP_FAIL,
    ADD_AGRI_TIP_COMMENT_REQUEST,
    ADD_AGRI_TIP_COMMENT_SUCCESS,
    ADD_AGRI_TIP_COMMENT_FAIL,
    DELETE_AGRI_TIP_COMMENT_REQUEST,
    DELETE_AGRI_TIP_COMMENT_SUCCESS,
    DELETE_AGRI_TIP_COMMENT_FAIL,
    SHARE_AGRI_TIP_REQUEST,
    SHARE_AGRI_TIP_SUCCESS,
    SHARE_AGRI_TIP_FAIL,
    UNSHARE_AGRI_TIP_REQUEST,
    UNSHARE_AGRI_TIP_SUCCESS,
    UNSHARE_AGRI_TIP_FAIL,
} from './types';

const getErrorMessage = (error, fallback) =>
    error.response?.data?.message ||
    error.message ||
    fallback;

export const fetchAgriFeed =
    (params = {}, options = {}) =>
    async (dispatch, getState) => {
        const {
            silent = false,
        } = options;

        const append = Boolean(params.append);

        if (
            silent &&
            getState().agriFeed?.refreshing
        ) {
            return {
                success: false,
                skipped: true,
            };
        }

        dispatch({
            type: FETCH_AGRI_FEED_REQUEST,
            meta: {
                silent,
                append,
            },
        });

        try {
            const requestParams = {
                page: params.page || 1,
                limit: params.limit || 15,
            };

            if (params.mine) {
                requestParams.mine = true;
            }

            if (params.category) {
                requestParams.category =
                    params.category;
            }

            if (params.language) {
                requestParams.language =
                    params.language;
            }

            if (params.region) {
                requestParams.region =
                    params.region;
            }

            if (params.priority) {
                requestParams.priority =
                    params.priority;
            }

            if (params.search?.trim()) {
                requestParams.search =
                    params.search.trim();
            }

            const res = await api.get('/feed', {
                params: requestParams,
            });

            const responseData = res.data || {};
            const data = responseData.data || [];

            dispatch({
                type: FETCH_AGRI_FEED_SUCCESS,
                payload: {
                    ...responseData,
                    data,
                },
                meta: {
                    silent,
                    append,
                },
            });

            return {
                success: true,
                data,
                page:
                    responseData.page ||
                    requestParams.page,
                limit:
                    responseData.limit ||
                    requestParams.limit,
                total: responseData.total || 0,
                totalPages:
                    responseData.totalPages || 0,
                hasMore:
                    Boolean(responseData.hasMore),
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Unable to load agricultural tips.'
            );

            dispatch({
                type: FETCH_AGRI_FEED_FAIL,
                payload: message,
                meta: {
                    silent,
                    append,
                },
            });

            return {
                success: false,
                message,
            };
        }
    };

export const createAgriTip =
    (tipData) =>
    async (dispatch) => {
        dispatch({
            type: CREATE_AGRI_FEED_REQUEST,
        });

        try {
            const res = await api.post(
                '/feed',
                tipData
            );

            dispatch({
                type: CREATE_AGRI_FEED_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Unable to publish agricultural tip.'
            );

            dispatch({
                type: CREATE_AGRI_FEED_FAIL,
                payload: message,
            });

            return {
                success: false,
                message,
            };
        }
    };

export const updateAgriTip =
    (id, tipData) =>
    async (dispatch) => {
        dispatch({
            type: UPDATE_AGRI_FEED_REQUEST,
        });

        try {
            const res = await api.put(
                `/feed/${id}`,
                tipData
            );

            dispatch({
                type: UPDATE_AGRI_FEED_SUCCESS,
                payload: res.data.data,
            });

            return {
                success: true,
                data: res.data.data,
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Unable to update agricultural tip.'
            );

            dispatch({
                type: UPDATE_AGRI_FEED_FAIL,
                payload: message,
            });

            return {
                success: false,
                message,
            };
        }
    };

export const deleteAgriTip =
    (id) =>
    async (dispatch) => {
        dispatch({
            type: DELETE_AGRI_FEED_REQUEST,
        });

        try {
            const res = await api.delete(
                `/feed/${id}`
            );

            dispatch({
                type: DELETE_AGRI_FEED_SUCCESS,
                payload: id,
            });

            return {
                success: true,
                message:
                    res.data.message ||
                    'Agricultural tip archived.',
            };
        } catch (error) {
            const message = getErrorMessage(
                error,
                'Unable to delete agricultural tip.'
            );

            dispatch({
                type: DELETE_AGRI_FEED_FAIL,
                payload: message,
            });

            return {
                success: false,
                message,
            };
        }
    };

const runTipInteraction = async ({
    dispatch,
    requestType,
    successType,
    failType,
    request,
    fallback,
}) => {
    dispatch({
        type: requestType,
    });

    try {
        const res = await request();

        dispatch({
            type: successType,
            payload: res.data.data,
        });

        return {
            success: true,
            data: res.data.data,
        };
    } catch (error) {
        const message = getErrorMessage(
            error,
            fallback
        );

        dispatch({
            type: failType,
            payload: message,
        });

        return {
            success: false,
            message,
        };
    }
};

export const likeAgriTip =
    (tipId) =>
    async (dispatch) =>
        runTipInteraction({
            dispatch,
            requestType:
                LIKE_AGRI_TIP_REQUEST,
            successType:
                LIKE_AGRI_TIP_SUCCESS,
            failType:
                LIKE_AGRI_TIP_FAIL,
            request: () =>
                api.post(
                    `/feed/${tipId}/like`
                ),
            fallback:
                'Unable to update tip like.',
        });

export const addAgriTipComment =
    (tipId, content) =>
    async (dispatch) =>
        runTipInteraction({
            dispatch,
            requestType:
                ADD_AGRI_TIP_COMMENT_REQUEST,
            successType:
                ADD_AGRI_TIP_COMMENT_SUCCESS,
            failType:
                ADD_AGRI_TIP_COMMENT_FAIL,
            request: () =>
                api.post(
                    `/feed/${tipId}/comments`,
                    { content }
                ),
            fallback:
                'Unable to add comment.',
        });

export const deleteAgriTipComment =
    (tipId, commentId) =>
    async (dispatch) =>
        runTipInteraction({
            dispatch,
            requestType:
                DELETE_AGRI_TIP_COMMENT_REQUEST,
            successType:
                DELETE_AGRI_TIP_COMMENT_SUCCESS,
            failType:
                DELETE_AGRI_TIP_COMMENT_FAIL,
            request: () =>
                api.delete(
                    `/feed/${tipId}/comments/${commentId}`
                ),
            fallback:
                'Unable to delete comment.',
        });

export const shareAgriTip =
    (tipId) =>
    async (dispatch) =>
        runTipInteraction({
            dispatch,
            requestType:
                SHARE_AGRI_TIP_REQUEST,
            successType:
                SHARE_AGRI_TIP_SUCCESS,
            failType:
                SHARE_AGRI_TIP_FAIL,
            request: () =>
                api.post(
                    `/feed/${tipId}/share`
                ),
            fallback:
                'Unable to share this tip to the Community.',
        });

export const unshareAgriTip =
    (tipId) =>
    async (dispatch) =>
        runTipInteraction({
            dispatch,
            requestType:
                UNSHARE_AGRI_TIP_REQUEST,
            successType:
                UNSHARE_AGRI_TIP_SUCCESS,
            failType:
                UNSHARE_AGRI_TIP_FAIL,
            request: () =>
                api.delete(
                    `/feed/${tipId}/share`
                ),
            fallback:
                'Unable to remove this tip from the Community.',
        });