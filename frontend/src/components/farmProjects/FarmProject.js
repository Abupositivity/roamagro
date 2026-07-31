import React,{useEffect,useState}from'react';
import{useDispatch,useSelector}from'react-redux';
import{useTranslation}from'react-i18next';
import{
Alert,
Box,
Button,
CircularProgress,
Container,
Snackbar,
Stack,
Typography
}from'@mui/material';
import AddIcon from'@mui/icons-material/Add';
import{
fetchFarmProjects,
createFarmProject,
updateFarmProject,
deleteFarmProject,
createActivity,
updateActivity,
deleteActivity,
updateActivityStatus,
createTask,
updateTask,
deleteTask,
toggleTaskStatus
}from'../../redux/actions/farmProjectsActions';
import ProjectList from'./ProjectList';
import ProjectDialog from'./ProjectDialog';
import DeleteProjectDialog from'./DeleteProjectDialog';

const FarmProject=()=>{

const{t}=useTranslation();
const dispatch=useDispatch();

const{
projects,
loading,
error
}=useSelector(state=>state.farmProjects);

const[dialogOpen,setDialogOpen]=useState(false);
const[deleteDialogOpen,setDeleteDialogOpen]=useState(false);
const[selectedProject,setSelectedProject]=useState(null);
const[snackbar,setSnackbar]=useState({
open:false,
message:'',
severity:'success'
});

useEffect(()=>{
dispatch(fetchFarmProjects());
},[dispatch]);

const showSnackbar=(success,message)=>{
setSnackbar({
open:true,
severity:success?'success':'error',
message
});
};

const openCreateDialog=()=>{
setSelectedProject(null);
setDialogOpen(true);
};

const openEditDialog=project=>{
setSelectedProject(project);
setDialogOpen(true);
};

const closeDialog=()=>{
if(loading)return;
setDialogOpen(false);
setSelectedProject(null);
};

const openDeleteDialog=project=>{
setSelectedProject(project);
setDeleteDialogOpen(true);
};

const closeDeleteDialog=()=>{
if(loading)return;
setDeleteDialogOpen(false);
setSelectedProject(null);
};

const closeSnackbar=()=>{
setSnackbar(prev=>({...prev,open:false}));
};

const handleSubmit=async(data)=>{
let result;
if(selectedProject){
result=await dispatch(updateFarmProject(selectedProject._id,data));
}else{
result=await dispatch(createFarmProject(data));
}
showSnackbar(
result.success,
result.success
?(selectedProject
?t('Project updated successfully.')
:t('Project created successfully.'))
:result.message
);
if(result.success){
setDialogOpen(false);
setSelectedProject(null);
}
};

const handleDelete=async()=>{
if(!selectedProject)return;
const result=await dispatch(deleteFarmProject(selectedProject._id));
showSnackbar(
result.success,
result.success
?t('Project deleted successfully.')
:result.message
);
if(result.success){
setDeleteDialogOpen(false);
setSelectedProject(null);
}
};

const handleView=project=>{
openEditDialog(project);
};

const handleCreateTask=async(projectId,data)=>{
const result=await dispatch(createTask(projectId,data));
showSnackbar(
result.success,
result.success
?t('Task created successfully.')
:result.message
);
};

const handleUpdateTask=async(projectId,taskId,data)=>{
const result=await dispatch(updateTask(projectId,taskId,data));
showSnackbar(
result.success,
result.success
?t('Task updated successfully.')
:result.message
);
};

const handleDeleteTask=async(projectId,taskId)=>{
const result=await dispatch(deleteTask(projectId,taskId));
showSnackbar(
result.success,
result.success
?t('Task deleted successfully.')
:result.message
);
};

const handleToggleTaskStatus=async(projectId,taskId,status)=>{
const result=await dispatch(toggleTaskStatus(projectId,taskId,status));
if(!result)return;
showSnackbar(
result.success,
result.success
?t('Task updated successfully.')
:result.message
);
};

return(
<Container
maxWidth="xl"
sx={{py:3,pb:12}}
>

<Stack
direction={{xs:'column',sm:'row'}}
justifyContent="space-between"
alignItems={{xs:'flex-start',sm:'center'}}
spacing={2}
mb={4}
>

<Box>
<Typography variant="h4" fontWeight={700}>
{t('Farm Projects')}
</Typography>

<Typography variant="body1" color="text.secondary">
{t('Manage all your farm projects in one place.')}
</Typography>
</Box>

<Button
variant="contained"
startIcon={<AddIcon/>}
onClick={openCreateDialog}
disabled={loading}
>
{t('New Project')}
</Button>

</Stack>

{loading&&projects.length===0&&(
<Box display="flex" justifyContent="center" py={8}>
<CircularProgress/>
</Box>
)}

{error&&(
<Alert severity="error" sx={{mb:3}}>
{error}
</Alert>
)}

{!loading&&!error&&(
<ProjectList
projects={projects}
onView={handleView}
onEdit={openEditDialog}
onDelete={openDeleteDialog}
onCreate={openCreateDialog}
/>
)}

<ProjectDialog
open={dialogOpen}
loading={loading}
project={selectedProject}
onClose={closeDialog}
onSubmit={handleSubmit}
onCreateActivity={(projectId,data)=>dispatch(createActivity(projectId,data))}
onUpdateActivity={(projectId,activityId,data)=>dispatch(updateActivity(projectId,activityId,data))}
onDeleteActivity={(projectId,activityId)=>dispatch(deleteActivity(projectId,activityId))}
onToggleActivityStatus={(projectId,activityId,status)=>dispatch(updateActivityStatus(projectId,activityId,status))}
onCreateTask={handleCreateTask}
onUpdateTask={handleUpdateTask}
onDeleteTask={handleDeleteTask}
onToggleTaskStatus={handleToggleTaskStatus}
/>

<DeleteProjectDialog
open={deleteDialogOpen}
loading={loading}
project={selectedProject}
onClose={closeDeleteDialog}
onConfirm={handleDelete}
/>

<Snackbar
open={snackbar.open}
autoHideDuration={3000}
onClose={closeSnackbar}
anchorOrigin={{
vertical:'bottom',
horizontal:'center'
}}
>
<Alert
onClose={closeSnackbar}
severity={snackbar.severity}
variant="filled"
sx={{width:'100%'}}
>
{snackbar.message}
</Alert>
</Snackbar>

</Container>
);

};

export default FarmProject;