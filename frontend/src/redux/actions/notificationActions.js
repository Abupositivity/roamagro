import notificationService from '../../services/notificationService';

import {
    FETCH_NOTIFICATIONS_REQUEST,
    FETCH_NOTIFICATIONS_SUCCESS,
    FETCH_NOTIFICATIONS_FAIL,
    FETCH_UNREAD_COUNT_REQUEST,
    FETCH_UNREAD_COUNT_SUCCESS,
    FETCH_UNREAD_COUNT_FAIL,
    MARK_NOTIFICATION_READ_REQUEST,
    MARK_NOTIFICATION_READ_SUCCESS,
    MARK_NOTIFICATION_READ_FAIL,
    MARK_ALL_NOTIFICATIONS_READ_REQUEST,
    MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
    MARK_ALL_NOTIFICATIONS_READ_FAIL,
    DELETE_NOTIFICATION_REQUEST,
    DELETE_NOTIFICATION_SUCCESS,
    DELETE_NOTIFICATION_FAIL
} from './notificationTypes';

const UNREAD_COUNT_CACHE_MS = 10000;

let sessionToken = null;
let sessionVersion = 0;
let cacheVersion = 0;

let unreadCountCache = null;
let unreadCountCacheTime = 0;
let unreadCountRequest = null;

const getSessionToken = () =>
    localStorage.getItem('token');

const normalizeCount = count =>
    Math.max(Number(count) || 0, 0);

const clearUnreadCountCache = () => {
    unreadCountCache = null;
    unreadCountCacheTime = 0;
    unreadCountRequest = null;
    cacheVersion += 1;
};

export const resetNotificationSession = () => {
    sessionToken = null;
    sessionVersion += 1;
    clearUnreadCountCache();
};

const getNotificationSession = () => {
    const token = getSessionToken();

    if (token !== sessionToken) {
        sessionToken = token;
        sessionVersion += 1;
        clearUnreadCountCache();
    }

    return {
        token,
        version: sessionVersion
    };
};

const isCurrentSession = session =>
    Boolean(
        session.token &&
        session.token === getSessionToken() &&
        session.version === sessionVersion
    );

const isCurrentCacheVersion = (
    session,
    version
) =>
    isCurrentSession(session) &&
    version === cacheVersion;

const skippedResult = () => ({
    success: false,
    skipped: true
});

const unauthenticatedResult = () => ({
    success: false,
    error: 'Authentication required.'
});

const cacheUnreadCount = count => {
    unreadCountCache = normalizeCount(count);
    unreadCountCacheTime = Date.now();
};

export const fetchNotifications = () => async dispatch => {
    const session = getNotificationSession();

    if (!session.token) {
        return unauthenticatedResult();
    }

    const requestVersion = cacheVersion;

    dispatch({
        type: FETCH_NOTIFICATIONS_REQUEST
    });

    try {
        const res =
            await notificationService.getNotifications();

        if (!isCurrentSession(session)) {
            return skippedResult();
        }

        if (
            !isCurrentCacheVersion(
                session,
                requestVersion
            )
        ) {
            dispatch({
                type: FETCH_NOTIFICATIONS_FAIL,
                meta: {
                    silent: true
                }
            });

            return skippedResult();
        }

        const data = Array.isArray(res.data?.data)
            ? res.data.data
            : [];

        const hasUnreadCount =
            res.data?.unreadCount !== undefined &&
            res.data?.unreadCount !== null &&
            Number.isFinite(
                Number(res.data.unreadCount)
            );

        const unreadCount = hasUnreadCount
            ? normalizeCount(res.data.unreadCount)
            : null;

        if (hasUnreadCount) {
            clearUnreadCountCache();
            cacheUnreadCount(unreadCount);

            dispatch({
                type: FETCH_UNREAD_COUNT_SUCCESS,
                payload: unreadCount
            });
        }

        dispatch({
            type: FETCH_NOTIFICATIONS_SUCCESS,
            payload: data,
            meta: {
                unreadCount
            }
        });

        return {
            success: true,
            data,
            unreadCount
        };
    } catch (error) {
        if (!isCurrentSession(session)) {
            return skippedResult();
        }

        const message =
            error.response?.data?.message ||
            error.message ||
            'Unable to load notifications.';

        dispatch({
            type: FETCH_NOTIFICATIONS_FAIL,
            payload: message
        });

        return {
            success: false,
            error: message
        };
    }
};

export const fetchUnreadCount = () => async dispatch => {
    const session = getNotificationSession();

    if (!session.token) {
        return unauthenticatedResult();
    }

    const now = Date.now();

    if (
        unreadCountCache !== null &&
        now - unreadCountCacheTime <
            UNREAD_COUNT_CACHE_MS
    ) {
        dispatch({
            type: FETCH_UNREAD_COUNT_SUCCESS,
            payload: unreadCountCache
        });

        return {
            success: true,
            count: unreadCountCache,
            cached: true
        };
    }

    if (unreadCountRequest) {
        return unreadCountRequest;
    }

    const requestVersion = cacheVersion;

    dispatch({
        type: FETCH_UNREAD_COUNT_REQUEST
    });

    const request = Promise.resolve().then(
        async () => {
            try {
                if (
                    !isCurrentCacheVersion(
                        session,
                        requestVersion
                    )
                ) {
                    return skippedResult();
                }

                const res =
                    await notificationService.getUnreadCount();

                if (
                    !isCurrentCacheVersion(
                        session,
                        requestVersion
                    )
                ) {
                    return skippedResult();
                }

                const count = normalizeCount(
                    res.data?.count
                );

                cacheUnreadCount(count);

                dispatch({
                    type: FETCH_UNREAD_COUNT_SUCCESS,
                    payload: count
                });

                return {
                    success: true,
                    count
                };
            } catch (error) {
                if (
                    !isCurrentCacheVersion(
                        session,
                        requestVersion
                    )
                ) {
                    return skippedResult();
                }

                const isNetworkFailure =
                    !error.response;

                const message =
                    error.response?.data?.message ||
                    error.message ||
                    'Unable to load notification count.';

                dispatch({
                    type: FETCH_UNREAD_COUNT_FAIL,
                    payload: message
                });

                return {
                    success: false,
                    error: message,
                    ...(isNetworkFailure
                        ? {
                            networkError: true
                        }
                        : {})
                };
            }
        }
    );

    unreadCountRequest = request;

    try {
        return await request;
    } finally {
        if (unreadCountRequest === request) {
            unreadCountRequest = null;
        }
    }
};

export const markNotificationAsRead =
    id => async dispatch => {
        if (!id) {
            return {
                success: false,
                error: 'Notification ID is required.'
            };
        }

        const session = getNotificationSession();

        if (!session.token) {
            return unauthenticatedResult();
        }

        dispatch({
            type: MARK_NOTIFICATION_READ_REQUEST,
            payload: id
        });

        try {
            const res =
                await notificationService.markAsRead(id);

            if (!isCurrentSession(session)) {
                return skippedResult();
            }

            clearUnreadCountCache();

            dispatch({
                type: FETCH_UNREAD_COUNT_FAIL
            });

            dispatch({
                type: MARK_NOTIFICATION_READ_SUCCESS,
                payload: res.data?.data
            });

            return {
                success: true,
                data: res.data?.data
            };
        } catch (error) {
            if (!isCurrentSession(session)) {
                return skippedResult();
            }

            const message =
                error.response?.data?.message ||
                error.message ||
                'Unable to update notification.';

            dispatch({
                type: MARK_NOTIFICATION_READ_FAIL,
                payload: {
                    id,
                    message
                }
            });

            return {
                success: false,
                error: message
            };
        }
    };

export const markAllNotificationsAsRead =
    () => async dispatch => {
        const session = getNotificationSession();

        if (!session.token) {
            return unauthenticatedResult();
        }

        dispatch({
            type: MARK_ALL_NOTIFICATIONS_READ_REQUEST
        });

        try {
            const res =
                await notificationService.markAllAsRead();

            if (!isCurrentSession(session)) {
                return skippedResult();
            }

            clearUnreadCountCache();

            dispatch({
                type: FETCH_UNREAD_COUNT_FAIL
            });

            dispatch({
                type: MARK_ALL_NOTIFICATIONS_READ_SUCCESS,
                payload: res.data
            });

            return {
                success: true
            };
        } catch (error) {
            if (!isCurrentSession(session)) {
                return skippedResult();
            }

            const message =
                error.response?.data?.message ||
                error.message ||
                'Unable to update notifications.';

            dispatch({
                type: MARK_ALL_NOTIFICATIONS_READ_FAIL,
                payload: message
            });

            return {
                success: false,
                error: message
            };
        }
    };

export const deleteNotification =
    id => async dispatch => {
        if (!id) {
            return {
                success: false,
                error: 'Notification ID is required.'
            };
        }

        const session = getNotificationSession();

        if (!session.token) {
            return unauthenticatedResult();
        }

        dispatch({
            type: DELETE_NOTIFICATION_REQUEST,
            payload: id
        });

        try {
            await notificationService.deleteNotification(id);

            if (!isCurrentSession(session)) {
                return skippedResult();
            }

            clearUnreadCountCache();

            dispatch({
                type: FETCH_UNREAD_COUNT_FAIL
            });

            dispatch({
                type: DELETE_NOTIFICATION_SUCCESS,
                payload: id
            });

            return {
                success: true
            };
        } catch (error) {
            if (!isCurrentSession(session)) {
                return skippedResult();
            }

            const message =
                error.response?.data?.message ||
                error.message ||
                'Unable to delete notification.';

            dispatch({
                type: DELETE_NOTIFICATION_FAIL,
                payload: {
                    id,
                    message
                }
            });

            return {
                success: false,
                error: message
            };
        }
    };