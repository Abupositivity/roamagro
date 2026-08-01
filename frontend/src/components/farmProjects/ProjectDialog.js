import React,{useState}from'react';
import{
Dialog,
DialogTitle,
DialogContent,
Tabs,
Tab,
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
import ExpenseSummary from './ExpenseSummary';
import ExpenseList from './ExpenseList';
import ExpenseDialog from './ExpenseDialog';
import DeleteExpenseDialog from './DeleteExpenseDialog';
import HarvestSummary from './HarvestSummary';
import HarvestList from './HarvestList';
import HarvestDialog from './HarvestDialog';
import DeleteHarvestDialog from './DeleteHarvestDialog';
import ReminderSummary from './ReminderSummary';
import ReminderList from './ReminderList';
import ReminderDialog from './ReminderDialog';
import DeleteReminderDialog from './DeleteReminderDialog';

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
onToggleTaskStatus,
onCreateExpense,
onUpdateExpense,
onDeleteExpense,
onCreateHarvest,
onUpdateHarvest,
onDeleteHarvest,
onCreateReminder,
onUpdateReminder,
onDeleteReminder,
onToggleReminder
})=>{

const{t}=useTranslation();

const[tab,setTab]=useState(0);
const[activityDialogOpen,setActivityDialogOpen]=useState(false);
const[selectedActivity,setSelectedActivity]=useState(null);
const[deleteDialogOpen,setDeleteDialogOpen]=useState(false);
const[taskDialogOpen,setTaskDialogOpen]=useState(false);
const[selectedTask,setSelectedTask]=useState(null);
const[deleteTaskDialogOpen,setDeleteTaskDialogOpen]=useState(false);
const[expenseDialogOpen,setExpenseDialogOpen]=useState(false);
const[selectedExpense,setSelectedExpense]=useState(null);
const[deleteExpenseDialogOpen,setDeleteExpenseDialogOpen]=useState(false);
const[harvestDialogOpen,setHarvestDialogOpen]=useState(false);
const[selectedHarvest,setSelectedHarvest]=useState(null);
const[deleteHarvestDialogOpen,setDeleteHarvestDialogOpen]=useState(false);
const[reminderDialogOpen,setReminderDialogOpen]=useState(false);
const[selectedReminder,setSelectedReminder]=useState(null);
const[deleteReminderDialogOpen,setDeleteReminderDialogOpen]=useState(false);

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
onUpdateActivity?.( project._id, selectedActivity._id, data );
}else{
onCreateActivity?.( project._id, data );
}
closeActivityDialog();
};

const handleDelete=()=>{
if(selectedActivity){
onDeleteActivity?.( project._id, selectedActivity._id );
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
onUpdateTask?.( project._id, selectedTask._id, data );
}else{
onCreateTask?.( project._id, data );
}
closeTaskDialog();
};

const handleDeleteTask=()=>{
if(selectedTask){
onDeleteTask?.( project._id, selectedTask._id );
}
closeDeleteTaskDialog();
};

const openCreateExpense=()=>{
setSelectedExpense(null);
setExpenseDialogOpen(true);
};

const openEditExpense=expense=>{
setSelectedExpense(expense);
setExpenseDialogOpen(true);
};

const closeExpenseDialog=()=>{
if(loading)return;
setSelectedExpense(null);
setExpenseDialogOpen(false);
};

const openDeleteExpense=expense=>{
setSelectedExpense(expense);
setDeleteExpenseDialogOpen(true);
};

const closeDeleteExpenseDialog=()=>{
if(loading)return;
setSelectedExpense(null);
setDeleteExpenseDialogOpen(false);
};

const handleExpenseSubmit=data=>{
if(selectedExpense){
onUpdateExpense?.( project._id, selectedExpense._id, data );
}else{
onCreateExpense?.( project._id, data );
}
closeExpenseDialog();
};

const handleDeleteExpense=()=>{
if(selectedExpense){
onDeleteExpense?.( project._id, selectedExpense._id );
}
closeDeleteExpenseDialog();
};

const openCreateHarvest=()=>{
setSelectedHarvest(null);
setHarvestDialogOpen(true);
};

const openEditHarvest=harvest=>{
setSelectedHarvest(harvest);
setHarvestDialogOpen(true);
};

const closeHarvestDialog=()=>{
if(loading)return;
setSelectedHarvest(null);
setHarvestDialogOpen(false);
};

const openDeleteHarvest=harvest=>{
setSelectedHarvest(harvest);
setDeleteHarvestDialogOpen(true);
};
const closeDeleteHarvestDialog=()=>{
if(loading)return;
setSelectedHarvest(null);
setDeleteHarvestDialogOpen(false);
};

const handleHarvestSubmit=data=>{
if(selectedHarvest){
onUpdateHarvest?.( project._id, selectedHarvest._id, data );
}else{
onCreateHarvest?.( project._id, data );
}
closeHarvestDialog();
};

const handleDeleteHarvest=()=>{
if(selectedHarvest){
onDeleteHarvest?.( project._id, selectedHarvest._id );
}
closeDeleteHarvestDialog();
};

const openCreateReminder=()=>{
setSelectedReminder(null);
setReminderDialogOpen(true);
};

const openEditReminder=reminder=>{
setSelectedReminder(reminder);
setReminderDialogOpen(true);
};

const closeReminderDialog=()=>{
if(loading)return;
setSelectedReminder(null);
setReminderDialogOpen(false);
};

const openDeleteReminder=reminder=>{
setSelectedReminder(reminder);
setDeleteReminderDialogOpen(true);
};

const closeDeleteReminderDialog=()=>{
if(loading)return;
setSelectedReminder(null);
setDeleteReminderDialogOpen(false);
};

const handleReminderSubmit=data=>{
if(selectedReminder){
onUpdateReminder?.( project._id, selectedReminder._id, data );
}else{
onCreateReminder?.( project._id, data );
}
closeReminderDialog();
};

const handleDeleteReminder=()=>{
if(selectedReminder){
onDeleteReminder?.( project._id, selectedReminder._id );
}
closeDeleteReminderDialog();
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
</>
)}

{tab===2&&project&&(
<>
<TaskProgress
tasks={project.tasks||[]}
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
{t('Tasks')}
</Typography>
<Button
variant="contained"
startIcon={<AddIcon/>}
disabled={loading}
onClick={openCreateTask}
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

{tab===3&&(
<>
<ExpenseSummary
project={project}
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
{t('Expenses')}
</Typography>
<Button
variant="contained"
startIcon={<AddIcon/>}
disabled={loading}
onClick={openCreateExpense}
>
{t('Add Expense')}
</Button>
</Stack>
<ExpenseList
expenses={project?.expenses||[]}
loading={loading}
onEdit={openEditExpense}
onDelete={openDeleteExpense}
/>
</>
)}

{tab===4&&(
<>
<HarvestSummary
project={project}
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
{t('Harvests')}
</Typography>
<Button
variant="contained"
startIcon={<AddIcon/>}
disabled={loading}
onClick={openCreateHarvest}
>
{t('Add Harvest')}
</Button>
</Stack>
<HarvestList
harvests={project?.harvests||[]}
loading={loading}
onEdit={openEditHarvest}
onDelete={openDeleteHarvest}
/>
</>
)}

{tab===5&&(
<>
<ReminderSummary
project={project}
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
{t('Reminders')}
</Typography>
<Button
variant="contained"
startIcon={<AddIcon/>}
disabled={loading}
onClick={openCreateReminder}
>
{t('Add Reminder')}
</Button>
</Stack>
<ReminderList
reminders={project?.reminders||[]}
loading={loading}
onEdit={openEditReminder}
onDelete={openDeleteReminder}
onToggle={reminder=>
onToggleReminder?.(
project._id,
reminder._id
)
}
/>
</>
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

<ExpenseDialog
open={expenseDialogOpen}
loading={loading}
expense={selectedExpense}
onClose={closeExpenseDialog}
onSubmit={handleExpenseSubmit}
/>
<DeleteExpenseDialog
open={deleteExpenseDialogOpen}
loading={loading}
expense={selectedExpense}
onClose={closeDeleteExpenseDialog}
onConfirm={handleDeleteExpense}
/>

<HarvestDialog
open={harvestDialogOpen}
loading={loading}
harvest={selectedHarvest}
onClose={closeHarvestDialog}
onSubmit={handleHarvestSubmit}
/>
<DeleteHarvestDialog
open={deleteHarvestDialogOpen}
loading={loading}
harvest={selectedHarvest}
onClose={closeDeleteHarvestDialog}
onConfirm={handleDeleteHarvest}
/>

<ReminderDialog
open={reminderDialogOpen}
loading={loading}
reminder={selectedReminder}
onClose={closeReminderDialog}
onSubmit={handleReminderSubmit}
/>
<DeleteReminderDialog
open={deleteReminderDialogOpen}
loading={loading}
reminder={selectedReminder}
onClose={closeDeleteReminderDialog}
onConfirm={handleDeleteReminder}
/>

</>
);

};

export default ProjectDialog;