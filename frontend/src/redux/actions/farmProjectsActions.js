import farmProjectService from '../../services/farmProjectService';
import api from '../../services/api';

import {
FETCH_PROJECTS_REQUEST,
FETCH_PROJECTS_SUCCESS,
FETCH_PROJECTS_FAIL,
CREATE_PROJECT_REQUEST,
CREATE_PROJECT_SUCCESS,
CREATE_PROJECT_FAIL,
UPDATE_PROJECT_REQUEST,
UPDATE_PROJECT_SUCCESS,
UPDATE_PROJECT_FAIL,
DELETE_PROJECT_REQUEST,
DELETE_PROJECT_SUCCESS,
DELETE_PROJECT_FAIL,
FETCH_ACTIVITIES_REQUEST,
FETCH_ACTIVITIES_SUCCESS,
FETCH_ACTIVITIES_FAIL,
CREATE_ACTIVITY_REQUEST,
CREATE_ACTIVITY_SUCCESS,
CREATE_ACTIVITY_FAIL,
UPDATE_ACTIVITY_REQUEST,
UPDATE_ACTIVITY_SUCCESS,
UPDATE_ACTIVITY_FAIL,
UPDATE_ACTIVITY_STATUS_REQUEST,
UPDATE_ACTIVITY_STATUS_SUCCESS,
UPDATE_ACTIVITY_STATUS_FAIL,
DELETE_ACTIVITY_REQUEST,
DELETE_ACTIVITY_SUCCESS,
DELETE_ACTIVITY_FAIL
} from './types';

const getError=(error)=>
error?.response?.data?.message||
error?.message||
'Something went wrong.';

export const fetchFarmProjects=()=>async(dispatch)=>{
dispatch({type:FETCH_PROJECTS_REQUEST});
try{
const res=await farmProjectService.getProjects();
dispatch({
type:FETCH_PROJECTS_SUCCESS,
payload:res.data.data
});
return{
success:true,
data:res.data.data
};
}catch(error){
dispatch({
type:FETCH_PROJECTS_FAIL,
payload:getError(error)
});
return{
success:false,
message:getError(error)
};
}
};

export const createFarmProject=(project)=>async(dispatch)=>{
dispatch({type:CREATE_PROJECT_REQUEST});
try{
const res=await farmProjectService.createProject(project);
dispatch({
type:CREATE_PROJECT_SUCCESS,
payload:res.data.data
});
return{
success:true,
data:res.data.data
};
}catch(error){
dispatch({
type:CREATE_PROJECT_FAIL,
payload:getError(error)
});
return{
success:false,
message:getError(error)
};
}
};

export const updateFarmProject=(id,project)=>async(dispatch)=>{
dispatch({type:UPDATE_PROJECT_REQUEST});
try{
const res=await farmProjectService.updateProject(id,project);
dispatch({
type:UPDATE_PROJECT_SUCCESS,
payload:res.data.data
});
return{
success:true,
data:res.data.data
};
}catch(error){
dispatch({
type:UPDATE_PROJECT_FAIL,
payload:getError(error)
});
return{
success:false,
message:getError(error)
};
}
};

export const deleteFarmProject=(id)=>async(dispatch)=>{
dispatch({type:DELETE_PROJECT_REQUEST});
try{
await farmProjectService.deleteProject(id);
dispatch({
type:DELETE_PROJECT_SUCCESS,
payload:id
});
return{
success:true
};
}catch(error){
dispatch({
type:DELETE_PROJECT_FAIL,
payload:getError(error)
});
return{
success:false,
message:getError(error)
};
}
};
export const fetchActivities=(projectId)=>async(dispatch)=>{
dispatch({
type:FETCH_ACTIVITIES_REQUEST
});
try{
const res=await api.get(`/farm-projects/${projectId}/activities`);
dispatch({
type:FETCH_ACTIVITIES_SUCCESS,
payload:{
projectId,
activities:res.data.data
}
});
}
catch(error){
dispatch({
type:FETCH_ACTIVITIES_FAIL,
payload:error.response?.data?.message||'Unable to load activities.'
});
}
};

export const createActivity=(projectId,data)=>async(dispatch)=>{
dispatch({
type:CREATE_ACTIVITY_REQUEST
});
try{
const res=await api.post(
`/farm-projects/${projectId}/activities`,
data
);
dispatch({
type:CREATE_ACTIVITY_SUCCESS,
payload:{
projectId,
activity:res.data.data
}
});
}
catch(error){
dispatch({
type:CREATE_ACTIVITY_FAIL,
payload:error.response?.data?.message||'Unable to create activity.'
});
}
};

export const updateActivity=(projectId,activityId,data)=>async(dispatch)=>{
dispatch({
type:UPDATE_ACTIVITY_REQUEST
});
try{
const res=await api.put(
`/farm-projects/${projectId}/activities/${activityId}`,
data
);
dispatch({
type:UPDATE_ACTIVITY_SUCCESS,
payload:{
projectId,
activity:res.data.data
}
});
}
catch(error){
dispatch({
type:UPDATE_ACTIVITY_FAIL,
payload:error.response?.data?.message||'Unable to update activity.'
});
}
};

export const updateActivityStatus=(projectId,activityId,status)=>async(dispatch)=>{
dispatch({
type:UPDATE_ACTIVITY_STATUS_REQUEST
});
try{
const res=await api.patch(
`/farm-projects/${projectId}/activities/${activityId}/status`,
{status}
);
dispatch({
type:UPDATE_ACTIVITY_STATUS_SUCCESS,
payload:{
projectId,
activity:res.data.data
}
});
}
catch(error){
dispatch({
type:UPDATE_ACTIVITY_STATUS_FAIL,
payload:error.response?.data?.message||'Unable to update activity status.'
});
}
};

export const deleteActivity=(projectId,activityId)=>async(dispatch)=>{
dispatch({
type:DELETE_ACTIVITY_REQUEST
});
try{
await api.delete(
`/farm-projects/${projectId}/activities/${activityId}`
);
dispatch({
type:DELETE_ACTIVITY_SUCCESS,
payload:{
projectId,
activityId
}
});
}
catch(error){
dispatch({
type:DELETE_ACTIVITY_FAIL,
payload:error.response?.data?.message||'Unable to delete activity.'
});
}
};