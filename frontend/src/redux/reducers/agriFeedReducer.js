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
} from '../actions/types';

const initialState = {
    tips: [],
    loading: false,
    loadingMore: false,
    refreshing: false,
    creating: false,
    updating: false,
    deleting: false,
    interacting: false,
    error: null,
    createError: null,
    updateError: null,
    deleteError: null,
    interactionError: null,
    lastUpdated: null,
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
    hasMore: false,
};

const replaceTip = (
    tips,
    updatedTip
) =>
    tips.map((tip) =>
        tip._id === updatedTip._id
            ? updatedTip
            : tip
    );

const agriFeedReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case FETCH_AGRI_FEED_REQUEST: {
            const silent =
                action.meta?.silent === true;

            const append =
                action.meta?.append === true;

            return {
                ...state,
                loading:
                    !silent && !append,
                loadingMore:
                    append,
                refreshing:
                    silent,
                error:
                    silent
                        ? state.error
                        : null,
            };
        }

        case FETCH_AGRI_FEED_SUCCESS: {
            const {
                data = [],
                page = 1,
                limit = 15,
                total = 0,
                totalPages = 0,
                hasMore = false,
            } = action.payload || {};

            const append =
                action.meta?.append === true;

            let tips = data;

            if (append) {
                const existingIds =
                    new Set(
                        state.tips.map(
                            (tip) => tip._id
                        )
                    );

                const newTips =
                    data.filter(
                        (tip) =>
                            tip?._id &&
                            !existingIds.has(
                                tip._id
                            )
                    );

                tips = [
                    ...state.tips,
                    ...newTips,
                ];
            }

            return {
                ...state,
                loading: false,
                loadingMore: false,
                refreshing: false,
                tips,
                error: null,
                lastUpdated: Date.now(),
                page,
                limit,
                total,
                totalPages,
                hasMore,
            };
        }

        case FETCH_AGRI_FEED_FAIL: {
            const silent =
                action.meta?.silent === true;

            const append =
                action.meta?.append === true;

            return {
                ...state,
                loading: false,
                loadingMore: false,
                refreshing: false,
                error:
                    silent || append
                        ? state.error
                        : action.payload,
            };
        }

        case CREATE_AGRI_FEED_REQUEST:
            return {
                ...state,
                creating: true,
                createError: null,
            };

        case CREATE_AGRI_FEED_SUCCESS:
            return {
                ...state,
                creating: false,
                tips: [
                    action.payload,
                    ...state.tips.filter(
                        (tip) =>
                            tip._id !==
                            action.payload._id
                    ),
                ],
                total: state.total + 1,
                createError: null,
            };

        case CREATE_AGRI_FEED_FAIL:
            return {
                ...state,
                creating: false,
                createError:
                    action.payload,
            };

        case UPDATE_AGRI_FEED_REQUEST:
            return {
                ...state,
                updating: true,
                updateError: null,
            };

        case UPDATE_AGRI_FEED_SUCCESS:
            return {
                ...state,
                updating: false,
                tips: replaceTip(
                    state.tips,
                    action.payload
                ),
                updateError: null,
            };

        case UPDATE_AGRI_FEED_FAIL:
            return {
                ...state,
                updating: false,
                updateError:
                    action.payload,
            };

        case DELETE_AGRI_FEED_REQUEST:
            return {
                ...state,
                deleting: true,
                deleteError: null,
            };

        case DELETE_AGRI_FEED_SUCCESS:
            return {
                ...state,
                deleting: false,
                tips: state.tips.filter(
                    (tip) =>
                        tip._id !==
                        action.payload
                ),
                total: Math.max(
                    state.total - 1,
                    0
                ),
                deleteError: null,
            };

        case DELETE_AGRI_FEED_FAIL:
            return {
                ...state,
                deleting: false,
                deleteError:
                    action.payload,
            };

        case LIKE_AGRI_TIP_REQUEST:
        case ADD_AGRI_TIP_COMMENT_REQUEST:
        case DELETE_AGRI_TIP_COMMENT_REQUEST:
        case SHARE_AGRI_TIP_REQUEST:
        case UNSHARE_AGRI_TIP_REQUEST:
            return {
                ...state,
                interacting: true,
                interactionError: null,
            };

        case LIKE_AGRI_TIP_SUCCESS:
        case ADD_AGRI_TIP_COMMENT_SUCCESS:
        case DELETE_AGRI_TIP_COMMENT_SUCCESS:
        case SHARE_AGRI_TIP_SUCCESS:
        case UNSHARE_AGRI_TIP_SUCCESS:
            return {
                ...state,
                interacting: false,
                tips: replaceTip(
                    state.tips,
                    action.payload
                ),
                interactionError: null,
            };

        case LIKE_AGRI_TIP_FAIL:
        case ADD_AGRI_TIP_COMMENT_FAIL:
        case DELETE_AGRI_TIP_COMMENT_FAIL:
        case SHARE_AGRI_TIP_FAIL:
        case UNSHARE_AGRI_TIP_FAIL:
            return {
                ...state,
                interacting: false,
                interactionError:
                    action.payload,
            };

        default:
            return state;
    }
};

export default agriFeedReducer;