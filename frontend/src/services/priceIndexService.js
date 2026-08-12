import api from './api';

const priceIndexService = {
    getPrices(params = {}) {
        return api.get('/price-index', {
            params,
        });
    },

    submitPrice(data) {
        return api.post(
            '/price-index',
            data
        );
    },

    deletePrice(id) {
        return api.delete(
            `/price-index/${id}`
        );
    },
};

export default priceIndexService;