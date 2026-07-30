import React from'react';
import{
Alert,
Stack
}from'@mui/material';
import {useTranslation}from'react-i18next';
import TaskCard from'./TaskCard';

const TaskList=({
tasks=[],
loading=false,
onEdit,
onDelete,
onToggleStatus
})=>{
const{t}=useTranslation();
if(!tasks.length){
return(
<Alert
severity="info"
sx={{mt:2}}
>
{t('No tasks added yet.')}
</Alert>
);
}
return(
<Stack spacing={2}>
{tasks.map(task=>(
<TaskCard
key={task._id}
task={task}
loading={loading}
onEdit={onEdit}
onDelete={onDelete}
onToggleStatus={onToggleStatus}
/>

))}
</Stack>
);
};

export default TaskList;