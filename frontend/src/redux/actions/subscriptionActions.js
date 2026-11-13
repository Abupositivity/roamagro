import api from '../../services/api';

export const SUBSCRIPTION_FETCH_REQUEST =
    'SUBSCRIPTION_FETCH_REQUEST';

export const SUBSCRIPTION_FETCH_SUCCESS =
    'SUBSCRIPTION_FETCH_SUCCESS';

export const SUBSCRIPTION_FETCH_FAILURE =
    'SUBSCRIPTION_FETCH_FAILURE';

export const SUBSCRIPTION_CLEAR =
    'SUBSCRIPTION_CLEAR';

let latestRequestId = 0;
let activeRequest = null;
let activeRequestToken = null;

export const invalidateSubscriptionRequests = () => {
    latestRequestId += 1;
    activeRequest = null;
    activeRequestToken = null;
};

export const fetchSubscription = () =>
    (dispatch, getState) => {
        const {
            token: sessionToken,
            isAuthenticated,
        } = getState().auth;

        if (!sessionToken || !isAuthenticated) {
            return Promise.resolve({
                success: false,
                message: 'Authentication required.',
            });
        }

        // Reuse an ongoing request for the same session.
        if (
            activeRequest &&
            activeRequestToken === sessionToken
        ) {
            return activeRequest;
        }

        const requestId = ++latestRequestId;

        dispatch({
            type: SUBSCRIPTION_FETCH_REQUEST,
        });

        const isCurrentRequest = () =>
            requestId === latestRequestId &&
            getState().auth.token === sessionToken &&
            getState().auth.isAuthenticated === true;

        const request = (async () => {
            try {
                const response = await api.get(
                    '/subscription/me'
                );

                if (!isCurrentRequest()) {
                    return {
                        success: false,
                        stale: true,
                    };
                }

                const subscription = response.data.data;

                dispatch({
                    type: SUBSCRIPTION_FETCH_SUCCESS,
                    payload: subscription,
                });

                return {
                    success: true,
                    data: subscription,
                };
            } catch (error) {
                if (!isCurrentRequest()) {
                    return {
                        success: false,
                        stale: true,
                    };
                }

                const message =
                    error.response?.data?.message ||
                    error.message ||
                    'Could not load subscription information.';

                dispatch({
                    type: SUBSCRIPTION_FETCH_FAILURE,
                    payload: message,
                });

                return {
                    success: false,
                    message,
                };
            }
        })();

        activeRequest = request;
        activeRequestToken = sessionToken;

        request.finally(() => {
            if (activeRequest === request) {
                activeRequest = null;
                activeRequestToken = null;
            }
        });

        return request;
    };

export const fetchSubscriptionPlans = () =>
    async () => {
        try {
            const response = await api.get(
                '/subscription/plans'
            );

            return {
                success: true,
                data: response.data.data,
            };
        } catch (error) {
            return {
                success: false,
                message:
                    error.response?.data?.message ||
                    error.message ||
                    'Could not load subscription plans.',
            };
        }
    };

export const clearSubscription = () => (dispatch) => {
    invalidateSubscriptionRequests();

    dispatch({
        type: SUBSCRIPTION_CLEAR,
    });
};