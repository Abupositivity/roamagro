import api from './api';

const farmProjectService={

getProjects(){
return api.get('/farm-projects');
},

getProject(id){
return api.get(`/farm-projects/${id}`);
},

createProject(data){
return api.post('/farm-projects',data);
},

updateProject(id,data){
return api.put(`/farm-projects/${id}`,data);
},

deleteProject(id){
return api.delete(`/farm-projects/${id}`);
},

getActivities(projectId){
return api.get(`/farm-projects/${projectId}/activities`);
},

createActivity(projectId,data){
return api.post(`/farm-projects/${projectId}/activities`,data);
},

updateActivity(projectId,activityId,data){
return api.put(`/farm-projects/${projectId}/activities/${activityId}`,data);
},

updateActivityStatus(projectId,activityId,status){
return api.patch(
`/farm-projects/${projectId}/activities/${activityId}/status`,
{status}
);
},

deleteActivity(projectId,activityId){
return api.delete(
`/farm-projects/${projectId}/activities/${activityId}`
);
}
};

export default farmProjectService;