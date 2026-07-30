import React,{useState}from'react';
import{
Dialog,
DialogTitle,
DialogContent,
Tabs,
Tab,
Box,
Divider,
Button,
IconButton,
Stack,
Typography
}from'@mui/material';
import CloseIcon from'@mui/icons-material/Close';
import AddIcon from'@mui/icons-material/Add';
import {useTranslation}from'react-i18next';
import FarmProjectForm from'./FarmProjectForm';
import ActivityProgress from'./ActivityProgress';
import ActivityList from'./ActivityList';
import ActivityDialog from'./ActivityDialog';
import DeleteActivityDialog from'./DeleteActivityDialog';
import TaskProgress from'./TaskProgress';
import TaskList from'./TaskList';
import TaskDialog from'./TaskDialog';
import DeleteTaskDialog from'./DeleteTaskDialog';

const ProjectDialog=({
open,
loading=false,
project=null,
onClose,
onSubmit,
onCreateActivity,
onUpdateActivity,
onDeleteActivity,
onToggleActivityStatus,
onCreateTask,
onUpdateTask,
onDeleteTask,
onToggleTaskStatus
})=>{

const{t}=useTranslation();

const[tab,setTab]=useState(0);
const[activityDialogOpen,setActivityDialogOpen]=useState(false);
const[selectedActivity,setSelectedActivity]=useState(null);
const[deleteDialogOpen,setDeleteDialogOpen]=useState(false);
const[taskDialogOpen,setTaskDialogOpen]=useState(false);
const[selectedTask,setSelectedTask]=useState(null);
const[deleteTaskDialogOpen,setDeleteTaskDialogOpen]=useState(false);

const handleSubmit=data=>{
onSubmit?.(data);
};

const openCreateActivity=()=>{
setSelectedActivity(null);
setActivityDialogOpen(true);
};

const openEditActivity=activity=>{
setSelectedActivity(activity);
setActivityDialogOpen(true);
};

const closeActivityDialog=()=>{
if(loading)return;
setSelectedActivity(null);
setActivityDialogOpen(false);
};

const openDeleteActivity=activity=>{
setSelectedActivity(activity);
setDeleteDialogOpen(true);
};

const closeDeleteDialog=()=>{
if(loading)return;
setSelectedActivity(null);
setDeleteDialogOpen(false);
};

const handleActivitySubmit=data=>{
if(selectedActivity){
onUpdateActivity?.(
project._id,
selectedActivity._id,
data
);
}else{
onCreateActivity?.(
project._id,
data
);
}
closeActivityDialog();
};

const handleDelete=()=>{
if(selectedActivity){
onDeleteActivity?.(
project._id,
selectedActivity._id
);
}
closeDeleteDialog();
};

const openCreateTask=()=>{
setSelectedTask(null);
setTaskDialogOpen(true);
};

const openEditTask=task=>{
setSelectedTask(task);
setTaskDialogOpen(true);
};

const closeTaskDialog=()=>{
if(loading)return;
setSelectedTask(null);
setTaskDialogOpen(false);
};

const openDeleteTask=task=>{
setSelectedTask(task);
setDeleteTaskDialogOpen(true);
};

const closeDeleteTaskDialog=()=>{
if(loading)return;
setSelectedTask(null);
setDeleteTaskDialogOpen(false);
};

const handleTaskSubmit=data=>{
if(selectedTask){
onUpdateTask?.(
project._id,
selectedTask._id,
data
);
}else{
onCreateTask?.(
project._id,
data
);
}
closeTaskDialog();
};

const handleDeleteTask=()=>{
if(selectedTask){
onDeleteTask?.(
project._id,
selectedTask._id
);
}
closeDeleteTaskDialog();
};

return(
<>

<Dialog
open={open}
onClose={loading?undefined:onClose}
fullWidth
maxWidth="lg"
>

<DialogTitle
sx={{
display:'flex',
justifyContent:'space-between',
alignItems:'center'
}}
>

{project?
t('Edit Farm Project'):
t('Create Farm Project')
}

<IconButton
size="small"
disabled={loading}
onClick={onClose}
>
<CloseIcon/>
</IconButton>

</DialogTitle>

<Tabs
value={tab}
onChange={(e,v)=>setTab(v)}
variant="scrollable"
scrollButtons="auto"
>

<Tab label={t('Project Details')}/>
<Tab label={t('Activities')}/>
<Tab label={t('Tasks')}/>
<Tab label={t('Expenses')}/>
<Tab label={t('Harvests')}/>
<Tab label={t('Reminders')}/>

</Tabs>

<DialogContent dividers>

{tab===0&&(

<FarmProjectForm
loading={loading}
initialValues={project}
submitLabel={
project?
t('Update Project'):
t('Create Project')
}
onSubmit={handleSubmit}
/>

)}

{tab===1&&project&&(

<>

<ActivityProgress
activities={project.activities||[]}
/>

<Divider sx={{my:3}}/>

<Stack
direction="row"
justifyContent="space-between"
alignItems="center"
mb={2}
>

<Typography
variant="h6"
fontWeight={700}
>
{t('Activities')}
</Typography>

<Button
variant="contained"
startIcon={<AddIcon/>}
disabled={loading}
onClick={openCreateActivity}
>
{t('Add Activity')}
</Button>

</Stack>

<ActivityList
activities={project.activities||[]}
loading={loading}
onEdit={openEditActivity}
onDelete={openDeleteActivity}
onToggleStatus={activity=>
onToggleActivityStatus?.(
project._id,
activity._id,
activity.status==='Completed'
?'Pending'
:'Completed'
)
}
/>

<Divider sx={{my:4}}/>

<TaskProgress
tasks={project.tasks||[]}
/>

<Stack
direction="row"
justifyContent="space-between"
alignItems="center"
sx={{mb:2}}
>

<Typography
variant="h6"
fontWeight={700}
>
{t('Tasks')}
</Typography>

<Button
variant="contained"
startIcon={<AddIcon/>}
onClick={openCreateTask}
disabled={loading}
>
{t('Add Task')}
</Button>

</Stack>

<TaskList
tasks={project.tasks||[]}
loading={loading}
onEdit={openEditTask}
onDelete={openDeleteTask}
onToggleStatus={task=>
onToggleTaskStatus?.(
project._id,
task._id,
task.status==='Completed'
?'Pending'
:'Completed'
)
}
/>

</>

)}

{tab===2&&(
<Box py={6} textAlign="center">
<Typography variant="h6">
{t('Task Management')}
</Typography>
<Typography color="text.secondary">
{t('Coming in Commit 6.2')}
</Typography>
</Box>
)}

{tab===3&&(
<Box py={6} textAlign="center">
<Typography variant="h6">
{t('Expenses')}
</Typography>
<Typography color="text.secondary">
{t('Coming in Commit 6.3')}
</Typography>
</Box>
)}

{tab===4&&(
<Box py={6} textAlign="center">
<Typography variant="h6">
{t('Harvests')}
</Typography>
<Typography color="text.secondary">
{t('Coming in Commit 6.4')}
</Typography>
</Box>
)}

{tab===5&&(
<Box py={6} textAlign="center">
<Typography variant="h6">
{t('Reminders')}
</Typography>
<Typography color="text.secondary">
{t('Coming in Commit 6.5')}
</Typography>
</Box>
)}

</DialogContent>

</Dialog>

<ActivityDialog
open={activityDialogOpen}
loading={loading}
activity={selectedActivity}
onClose={closeActivityDialog}
onSubmit={handleActivitySubmit}
/>

<DeleteActivityDialog
open={deleteDialogOpen}
loading={loading}
activity={selectedActivity}
onClose={closeDeleteDialog}
onConfirm={handleDelete}
/>

<TaskDialog
open={taskDialogOpen}
loading={loading}
task={selectedTask}
onClose={closeTaskDialog}
onSubmit={handleTaskSubmit}
/>

<DeleteTaskDialog
open={deleteTaskDialogOpen}
loading={loading}
task={selectedTask}
onClose={closeDeleteTaskDialog}
onConfirm={handleDeleteTask}
/>

</>
);

};

export default ProjectDialog;