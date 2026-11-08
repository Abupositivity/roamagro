import axios from 'axios';

const getFriendlyNetworkMessage = (error) => {
    if (error.response) {
        return null;
    }

    if (!navigator.onLine) {
        return 'You are offline. Please check your internet connection.';
    }

    if (error.code === 'ECONNABORTED') {
        return 'The request is taking too long. Please try again.';
    }

    if (error.code === 'ERR_NETWORK') {
        return 'Unable to connect. Please check your connection and try again.';
    }

    return null;
};

const api = axios.create({
    baseURL:
        process.env.REACT_APP_API_URL ||
        'http://localhost:5000/api/v1',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        if (
            typeof FormData !== 'undefined' &&
            config.data instanceof FormData
        ) {
            if (config.headers?.delete) {
                config.headers.delete('Content-Type');
            } else {
                delete config.headers['Content-Type'];
            }

            config.timeout = 60000;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';

        const isPublicAuthRequest =
            /\/auth\/(register|login|google|verify-email|forgot-password|reset-password|logout)(?:[/?]|$)/i.test(
                requestUrl
            );

        const token = localStorage.getItem('token');

        if (
            status === 401 &&
            token &&
            !isPublicAuthRequest
        ) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            if (window.location.pathname !== '/login') {
                window.location.replace('/login');
            }
        }

        const friendlyMessage = getFriendlyNetworkMessage(error);

        if (friendlyMessage) {
            error.message = friendlyMessage;
        }

        return Promise.reject(error);
    }
);

api.reportUser = (userId, payload) =>
    api.post(`/users/${userId}/report`, payload);

api.getReports = () =>
    api.get('/users/admin/reports');

api.updateReportStatus = (reportId, status) =>
    api.patch(`/users/admin/reports/${reportId}`, {
        status,
    });

api.suspendUser = (userId, payload) =>
    api.patch(`/users/admin/${userId}/suspend`, payload);

api.restoreUser = (userId) =>
    api.patch(`/users/admin/${userId}/restore`);

export default api;