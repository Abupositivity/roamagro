import api from './api';

const priceIndexService = {

    getPrices() {
        return api.get('/price-index');
    },
    submitPrice(data) {
        return api.post('/price-index', data);
    }
};

export default priceIndexService;