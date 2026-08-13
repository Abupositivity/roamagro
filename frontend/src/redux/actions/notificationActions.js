import notificationService from '../../services/notificationService';

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
} from './notificationTypes';

export const fetchNotifications = () => async (dispatch) => {
    dispatch({
        type: FETCH_NOTIFICATIONS_REQUEST,
    });

    try {
        const res = await notificationService.getNotifications();

        dispatch({
            type: FETCH_NOTIFICATIONS_SUCCESS,
            payload: res.data.data || [],
        });
    } catch (error) {
        dispatch({
            type: FETCH_NOTIFICATIONS_FAIL,
            payload:
                error.response?.data?.message ||
                'Unable to load notifications.',
        });
    }
};

export const markNotificationAsRead = (id) => async (dispatch) => {
    dispatch({
        type: MARK_NOTIFICATION_READ_REQUEST,
    });

    try {
        const res = await notificationService.markAsRead(id);

        dispatch({
            type: MARK_NOTIFICATION_READ_SUCCESS,
            payload: res.data.data || { _id: id },
        });
    } catch (error) {
        dispatch({
            type: MARK_NOTIFICATION_READ_FAIL,
            payload:
                error.response?.data?.message ||
                'Unable to update notification.',
        });
    }
};

export const markAllNotificationsAsRead = () => async (dispatch) => {
    dispatch({
        type: MARK_ALL_NOTIFICATIONS_READ_REQUEST,
    });

    try {
        await notificationService.markAllAsRead();

        dispatch({
            type: MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
        });
    } catch (error) {
        dispatch({
            type: MARK_ALL_NOTIFICATIONS_READ_FAIL,
            payload:
                error.response?.data?.message ||
                'Unable to update notifications.',
        });
    }
};