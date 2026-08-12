import api from './api';

const communityService = {
    getPosts(params = {}) {
        return api.get('/community', {
            params,
        });
    },

    createPost(data) {
        return api.post(
            '/community',
            data
        );
    },

    updatePost(postId, data) {
        return api.put(
            `/community/${postId}`,
            data
        );
    },

    deletePost(postId) {
        return api.delete(
            `/community/${postId}`
        );
    },

    sharePost(postId) {
        return api.post(
            `/community/${postId}/share`
        );
    },

    toggleLike(postId) {
        return api.post(
            `/community/${postId}/like`
        );
    },

    addComment(postId, data) {
        return api.post(
            `/community/${postId}/comments`,
            data
        );
    },

    deleteComment(postId, commentId) {
        return api.delete(
            `/community/${postId}/comments/${commentId}`
        );
    },
};

export default communityService;