import React from 'react';
import {Tabs,Tab} from '@mui/material';
import {useTranslation} from 'react-i18next';

const ProjectTabs=({
value,
onChange
})=>{

const{t}=useTranslation();

return(

<Tabs
value={value}
onChange={(e,v)=>onChange(v)}
variant="scrollable"
scrollButtons="auto"
allowScrollButtonsMobile
>

<Tab label={t('Project Details')}/>
<Tab label={t('Activities')}/>
<Tab label={t('Tasks')}/>
<Tab label={t('Expenses')}/>
<Tab label={t('Harvests')}/>
<Tab label={t('Reminders')}/>

</Tabs>

);

};

export default ProjectTabs;