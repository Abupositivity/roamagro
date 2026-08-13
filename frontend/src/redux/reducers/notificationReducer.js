import {
    FETCH_NOTIFICATIONS_REQUEST,
    FETCH_NOTIFICATIONS_SUCCESS,
    FETCH_NOTIFICATIONS_FAIL,
    MARK_NOTIFICATION_READ_REQUEST,
    MARK_NOTIFICATION_READ_SUCCESS,
    MARK_NOTIFICATION_READ_FAIL,
    MARK_ALL_NOTIFICATIONS_READ_REQUEST,
    MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
    MARK_ALL_NOTIFICATIONS_READ_FAIL,
} from '../actions/notificationTypes';

const initialState = {
    notifications: [],
    loading: false,
    actionLoading: false,
    error: null,
};

const notificationReducer = (
    state = initialState,
    action
) => {
    switch (action.type) {
        case FETCH_NOTIFICATIONS_REQUEST:
            return {
                ...state,
                loading: true,
                error: null,
            };

        case FETCH_NOTIFICATIONS_SUCCESS:
            return {
                ...state,
                loading: false,
                notifications: action.payload,
                error: null,
            };

        case FETCH_NOTIFICATIONS_FAIL:
            return {
                ...state,
                loading: false,
                error: action.payload,
            };

        case MARK_NOTIFICATION_READ_REQUEST:
        case MARK_ALL_NOTIFICATIONS_READ_REQUEST:
            return {
                ...state,
                actionLoading: true,
                error: null,
            };

        case MARK_NOTIFICATION_READ_SUCCESS:
            return {
                ...state,
                actionLoading: false,
                notifications: state.notifications.map(
                    (notification) =>
                        notification._id === action.payload._id
                            ? {
                                  ...notification,
                                  read: true,
                              }
                            : notification
                ),
            };

        case MARK_ALL_NOTIFICATIONS_READ_SUCCESS:
            return {
                ...state,
                actionLoading: false,
                notifications: state.notifications.map(
                    (notification) => ({
                        ...notification,
                        read: true,
                    })
                ),
            };

        case MARK_NOTIFICATION_READ_FAIL:
        case MARK_ALL_NOTIFICATIONS_READ_FAIL:
            return {
                ...state,
                actionLoading: false,
                error: action.payload,
            };

        default:
            return state;
    }
};

export default notificationReducer;