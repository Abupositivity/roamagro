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
return api.patch(`/farm-projects/${projectId}/activities/${activityId}/status`,{status});
},
deleteActivity(projectId,activityId){
return api.delete(`/farm-projects/${projectId}/activities/${activityId}`);
},

createTask(projectId,data){
return api.post(`/farm-projects/${projectId}/tasks`,data);
},
updateTask(projectId,taskId,data){
return api.put(`/farm-projects/${projectId}/tasks/${taskId}`,data);
},
deleteTask(projectId,taskId){
return api.delete(`/farm-projects/${projectId}/tasks/${taskId}`);
},
updateTaskStatus(projectId,taskId,status){
return api.patch(`/farm-projects/${projectId}/tasks/${taskId}/status`,{status});
},

addExpense(projectId,data){
return api.post(`/farm-projects/${projectId}/expenses`,data);
},
updateExpense(projectId,expenseId,data){
return api.put(`/farm-projects/${projectId}/expenses/${expenseId}`,data);
},
deleteExpense(projectId,expenseId){
return api.delete(`/farm-projects/${projectId}/expenses/${expenseId}`);
},

createHarvest(projectId,data){
return api.post(`/farm-projects/${projectId}/harvests`,data);
},
updateHarvest(projectId,harvestId,data){
return api.put(`/farm-projects/${projectId}/harvests/${harvestId}`,data);
},
deleteHarvest(projectId,harvestId){
return api.delete(`/farm-projects/${projectId}/harvests/${harvestId}`);
},

createReminder(projectId,data){
return api.post(`/farm-projects/${projectId}/reminders`,data);
},

updateReminder(projectId,reminderId,data){
return api.put(`/farm-projects/${projectId}/reminders/${reminderId}`,data);
},

toggleReminder(projectId,reminderId){
return api.patch(`/farm-projects/${projectId}/reminders/${reminderId}/toggle`);
},

deleteReminder(projectId,reminderId){
return api.delete(`/farm-projects/${projectId}/reminders/${reminderId}`);
},

};

export default farmProjectService;