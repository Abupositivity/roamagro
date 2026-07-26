import farmProjectService from '../../services/farmProjectService';
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
DELETE_PROJECT_FAIL
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