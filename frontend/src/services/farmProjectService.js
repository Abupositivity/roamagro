import api from './api';

const farmProjectService = {

    getProjects() {
        return api.get('/farm-projects');
    },
    createProject(data) {
        return api.post('/farm-projects', data);
    },
    updateProject(id, data) {
        return api.put(`/farm-projects/${id}`, data);
    },
    deleteProject(id) {
        return api.delete(`/farm-projects/${id}`);
    }
};

export default farmProjectService;