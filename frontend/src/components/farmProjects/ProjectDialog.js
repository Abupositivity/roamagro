import React from 'react';
import {
Dialog,
DialogTitle,
DialogContent,
IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import {useTranslation} from 'react-i18next';
import FarmProjectForm from './FarmProjectForm';

const ProjectDialog=({
open,
loading=false,
project=null,
onClose,
onSubmit
})=>{

const{t}=useTranslation();
const handleSubmit=(data)=>{
onSubmit?.(data);
};
return(
<Dialog
open={open}
onClose={loading?undefined:onClose}
fullWidth
maxWidth="md"
>
<DialogTitle
sx={{
display:'flex',
justifyContent:'space-between',
alignItems:'center'
}}
>
{project
?t('Edit Farm Project')
:t('Create Farm Project')
}
<IconButton
onClick={onClose}
disabled={loading}
size="small"
>
<CloseIcon/>
</IconButton>
</DialogTitle>
<DialogContent dividers>
<FarmProjectForm
loading={loading}
initialValues={project}
submitLabel={
project
?'Update Project'
:'Create Project'
}
onSubmit={handleSubmit}
/>
</DialogContent>
</Dialog>
);
};

export default ProjectDialog;