import{
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
}from'../actions/types';

const initialState={
projects:[],
currentProject:null,
loading:false,
success:false,
error:null
};

const farmProjectsReducer=(state=initialState,action)=>{
switch(action.type){

case FETCH_PROJECTS_REQUEST:
case CREATE_PROJECT_REQUEST:
case UPDATE_PROJECT_REQUEST:
case DELETE_PROJECT_REQUEST:
return{
...state,
loading:true,
success:false,
error:null
};

case FETCH_PROJECTS_SUCCESS:
return{
...state,
loading:false,
success:true,
projects:action.payload,
error:null
};

case CREATE_PROJECT_SUCCESS:
return{
...state,
loading:false,
success:true,
error:null,
projects:[action.payload,...state.projects],
currentProject:action.payload
};

case UPDATE_PROJECT_SUCCESS:
return{
...state,
loading:false,
success:true,
error:null,
currentProject:action.payload,
projects:state.projects.map(project=>
project._id===action.payload._id
?action.payload
:project
)
};

case DELETE_PROJECT_SUCCESS:
return{
...state,
loading:false,
success:true,
error:null,
currentProject:null,
projects:state.projects.filter(project=>
project._id!==action.payload
)
};

case FETCH_PROJECTS_FAIL:
case CREATE_PROJECT_FAIL:
case UPDATE_PROJECT_FAIL:
case DELETE_PROJECT_FAIL:
return{
...state,
loading:false,
success:false,
error:action.payload
};

default:
return state;
}
};

export default farmProjectsReducer;