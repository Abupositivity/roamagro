import api from './api';

const priceAlertService = {

    getAlerts() {
        return api.get('/price-alerts');
    },

    createAlert(data) {
        return api.post('/price-alerts', data);
    },

    deleteAlert(id) {
        return api.delete(`/price-alerts/${id}`);
    },

};

export default priceAlertService;