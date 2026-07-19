import api from './api';

const communityService = {

    getPosts() {
        return api.get('/community');
    },
    createPost(data) {
        return api.post('/community', data);
    },
    replyToPost(id, data) {
        return api.post(`/community/${id}/reply`, data);
    }

};

export default communityService;