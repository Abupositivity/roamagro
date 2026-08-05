import api from './api';

const agriFeedService = {

    getTips(params = {}) {

        return api.get('/feed', {
            params,
        });

    },

};

export default agriFeedService;