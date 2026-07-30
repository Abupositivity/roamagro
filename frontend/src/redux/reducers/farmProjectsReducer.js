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
case FETCH_ACTIVITIES_REQUEST:
case CREATE_ACTIVITY_REQUEST:
case UPDATE_ACTIVITY_REQUEST:
case UPDATE_ACTIVITY_STATUS_REQUEST:
case DELETE_ACTIVITY_REQUEST:

return{
...state,
loading:true,
error:null
};

case FETCH_ACTIVITIES_SUCCESS:
return{
...state,
loading:false,
projects:state.projects.map(project=>
project._id===action.payload.projectId
?{
...project,
activities:action.payload.activities
}
:project
)
};

case CREATE_ACTIVITY_SUCCESS:
return{
...state,
loading:false,
projects:state.projects.map(project=>
project._id===action.payload.projectId
?{
...project,
activities:[
...(project.activities||[]),
action.payload.activity
]
}
:project
)
};

case UPDATE_ACTIVITY_SUCCESS:
case UPDATE_ACTIVITY_STATUS_SUCCESS:
return{
...state,
loading:false,
projects:state.projects.map(project=>
project._id!==action.payload.projectId
?project
:{
...project,
activities:(project.activities||[]).map(activity=>
activity._id===action.payload.activity._id
?action.payload.activity
:activity
)
}
)
};

case DELETE_ACTIVITY_SUCCESS:
return{
...state,
loading:false,
projects:state.projects.map(project=>
project._id!==action.payload.projectId
?project
:{
...project,
activities:(project.activities||[]).filter(
activity=>activity._id!==action.payload.activityId
)
}
)
};

case FETCH_ACTIVITIES_FAIL:
case CREATE_ACTIVITY_FAIL:
case UPDATE_ACTIVITY_FAIL:
case UPDATE_ACTIVITY_STATUS_FAIL:
case DELETE_ACTIVITY_FAIL:
return{
...state,
loading:false,
error:action.payload
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