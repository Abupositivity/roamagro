import api from './api';

const notificationService = {
    getNotifications() {
        return api.get('/notifications');
    },
    markAsRead(id) {
        return api.patch(`/notifications/${id}/read`);
    },
    markAllAsRead() {
        return api.patch('/notifications/read-all');
    }
};

export default notificationService;