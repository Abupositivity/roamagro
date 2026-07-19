import api from './api';

const marketplaceService = {

    getListings() {
        return api.get('/marketplace');
    },
    createListing(data) {
        return api.post('/marketplace', data);
    }
};

export default marketplaceService;