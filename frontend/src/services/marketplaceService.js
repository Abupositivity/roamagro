import api from './api';

const marketplaceService = {
    getListings(params = {}) {
        return api.get(
            '/marketplace',
            {
                params,
            }
        );
    },

    getListing(id) {
        return api.get(
            `/marketplace/${id}`
        );
    },

    createListing(data) {
        return api.post(
            '/marketplace',
            data
        );
    },

    updateListing(id, data) {
        return api.put(
            `/marketplace/${id}`,
            data
        );
    },

    deleteListing(id) {
        return api.delete(
            `/marketplace/${id}`
        );
    },
};

export default marketplaceService;