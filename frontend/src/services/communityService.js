import api from './api';

const communityService = {
    // Get all community posts
    getPosts(params = {}) {
        return api.get('/community', {params,});},
    // Create a new community post
    createPost(data) {
        return api.post('/community', data);},
    // Like / Unlike a post
    toggleLike(postId) {
        return api.put(`/community/${postId}/like`);},
    // Add a comment
    addComment(postId, data) {
        return api.post(`/community/${postId}/comments`, data);},
    // Delete a comment (optional)
    deleteComment(postId, commentId) {
        return api.delete(`/community/${postId}/comments/${commentId}`);},
};

export default communityService;