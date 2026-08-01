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
DELETE_ACTIVITY_FAIL,
CREATE_TASK_REQUEST,
CREATE_TASK_SUCCESS,
CREATE_TASK_FAIL,
UPDATE_TASK_REQUEST,
UPDATE_TASK_SUCCESS,
UPDATE_TASK_FAIL,
DELETE_TASK_REQUEST,
DELETE_TASK_SUCCESS,
DELETE_TASK_FAIL,
UPDATE_TASK_STATUS_REQUEST,
UPDATE_TASK_STATUS_SUCCESS,
UPDATE_TASK_STATUS_FAIL,
CREATE_EXPENSE_REQUEST,
CREATE_EXPENSE_SUCCESS,
CREATE_EXPENSE_FAIL,
UPDATE_EXPENSE_REQUEST,
UPDATE_EXPENSE_SUCCESS,
UPDATE_EXPENSE_FAIL,
DELETE_EXPENSE_REQUEST,
DELETE_EXPENSE_SUCCESS,
DELETE_EXPENSE_FAIL,
CREATE_HARVEST_REQUEST,
CREATE_HARVEST_SUCCESS,
CREATE_HARVEST_FAIL,
UPDATE_HARVEST_REQUEST,
UPDATE_HARVEST_SUCCESS,
UPDATE_HARVEST_FAIL,
DELETE_HARVEST_REQUEST,
DELETE_HARVEST_SUCCESS,
DELETE_HARVEST_FAIL
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

export const createTask=(projectId,data)=>async dispatch=>{
dispatch({type:CREATE_TASK_REQUEST});
try{
const res=await api.post(
`/farm-projects/${projectId}/tasks`,
data
);
dispatch({
type:CREATE_TASK_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:CREATE_TASK_FAIL,
payload:error.response?.data?.message||error.message
});
}
};

export const updateTask=(projectId,taskId,data)=>async dispatch=>{
dispatch({type:UPDATE_TASK_REQUEST});
try{
const res=await api.put(
`/farm-projects/${projectId}/tasks/${taskId}`,
data
);
dispatch({
type:UPDATE_TASK_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:UPDATE_TASK_FAIL,
payload:error.response?.data?.message||error.message
});
}
};

export const deleteTask=(projectId,taskId)=>async dispatch=>{
dispatch({type:DELETE_TASK_REQUEST});
try{
await api.delete(
`/farm-projects/${projectId}/tasks/${taskId}`
);
dispatch({
type:DELETE_TASK_SUCCESS,
payload:{
projectId,
taskId
}
});
}catch(error){
dispatch({
type:DELETE_TASK_FAIL,
payload:error.response?.data?.message||error.message
});
}
};

export const updateTaskStatus=(projectId,taskId,status)=>async dispatch=>{
dispatch({type:UPDATE_TASK_STATUS_REQUEST});
try{
const res=await api.patch(
`/farm-projects/${projectId}/tasks/${taskId}/status`,
{status}
);
dispatch({
type:UPDATE_TASK_STATUS_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:UPDATE_TASK_STATUS_FAIL,
payload:error.response?.data?.message||error.message
});
}
};

export const createExpense=(projectId,data)=>async(dispatch)=>{
dispatch({type:CREATE_EXPENSE_REQUEST});
try{
const res=await api.post(
`/farm-projects/${projectId}/expenses`,
data
);
dispatch({
type:CREATE_EXPENSE_SUCCESS,
payload:res.data.data
});
}
catch(error){
dispatch({
type:CREATE_EXPENSE_FAIL,
payload:error.response?.data?.message||error.message
});
}
};

export const updateExpense=(projectId,expenseId,data)=>async(dispatch)=>{
dispatch({type:UPDATE_EXPENSE_REQUEST});
try{
const res=await api.put(
`/farm-projects/${projectId}/expenses/${expenseId}`,
data
);
dispatch({
type:UPDATE_EXPENSE_SUCCESS,
payload:res.data.data
});
}
catch(error){
dispatch({
type:UPDATE_EXPENSE_FAIL,
payload:error.response?.data?.message||error.message
});
}
};

export const deleteExpense=(projectId,expenseId)=>async(dispatch)=>{
dispatch({type:DELETE_EXPENSE_REQUEST});
try{
const res=await api.delete(
`/farm-projects/${projectId}/expenses/${expenseId}`
);
dispatch({
type:DELETE_EXPENSE_SUCCESS,
payload:res.data.data
});
}
catch(error){
dispatch({
type:DELETE_EXPENSE_FAIL,
payload:error.response?.data?.message||error.message
});
}
};

export const createHarvest=(projectId,data)=>async(dispatch)=>{
dispatch({
type:CREATE_HARVEST_REQUEST
});
try{
const res=await farmProjectService.createHarvest(
projectId,
data
);
dispatch({
type:CREATE_HARVEST_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:CREATE_HARVEST_FAIL,
payload:error.response?.data?.message
});
}
};

export const updateHarvest=(projectId,harvestId,data)=>async(dispatch)=>{
dispatch({
type:UPDATE_HARVEST_REQUEST
});
try{
const res=await farmProjectService.updateHarvest(
projectId,
harvestId,
data
);
dispatch({
type:UPDATE_HARVEST_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:UPDATE_HARVEST_FAIL,
payload:error.response?.data?.message
});
}
};

export const deleteHarvest=(projectId,harvestId)=>async(dispatch)=>{
dispatch({
type:DELETE_HARVEST_REQUEST
});
try{
const res=await farmProjectService.deleteHarvest(
projectId,
harvestId
);
dispatch({
type:DELETE_HARVEST_SUCCESS,
payload:res.data.data
});
}catch(error){
dispatch({
type:DELETE_HARVEST_FAIL,
payload:error.response?.data?.message
});
}
};