import api from './api';

const farmProjectService={
getProjects:()=>api.get('/farm-projects'),
getProject:(id)=>api.get(`/farm-projects/${id}`),
createProject:(data)=>api.post('/farm-projects',data),
updateProject:(id,data)=>api.put(`/farm-projects/${id}`,data),
deleteProject:(id)=>api.delete(`/farm-projects/${id}`),
getDashboardSummary:()=>api.get('/farm-projects/dashboard/summary')
};

export default farmProjectService;