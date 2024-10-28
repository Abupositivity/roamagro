import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFarmProjects, createFarmProject, updateFarmProject } from '../../redux/actions/farmProjectsActions';
import { Container, Grid, TextField, Button, Typography, Paper } from '@mui/material';

const FarmProject = () => {
  const dispatch = useDispatch();
  const { projects } = useSelector((state) => state.farmProjects);

  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: '',
  });

  useEffect(() => {
    dispatch(fetchFarmProjects());
  }, [dispatch]);

  const handleChange = (e) => {
    setNewProject({ ...newProject, [e.target.name]: e.target.value });
  };

  const handleCreate = () => {
    dispatch(createFarmProject(newProject));
    setNewProject({ name: '', description: '', startDate: '', endDate: '', budget: '' });
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>
        Farm Projects
      </Typography>
      <Paper sx={{ padding: 3, marginBottom: 3 }}>
        <Typography variant="h6" gutterBottom>
          Create New Project
        </Typography>
        <form>
          <TextField label="Project Name" name="name" value={newProject.name} onChange={handleChange} fullWidth margin="normal" />
          <TextField label="Description" name="description" value={newProject.description} onChange={handleChange} fullWidth margin="normal" multiline rows={3} />
          <TextField label="Start Date" name="startDate" type="date" value={newProject.startDate} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="End Date" name="endDate" type="date" value={newProject.endDate} onChange={handleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
          <TextField label="Budget" name="budget" value={newProject.budget} onChange={handleChange} fullWidth margin="normal" />
          <Button onClick={handleCreate} color="primary" variant="contained" sx={{ mt: 2 }}>
            Create Project
          </Button>
        </form>
      </Paper>
      <Grid container spacing={3}>
        {projects.map((project) => (
          <Grid item xs={12} md={6} key={project._id}>
            <Paper sx={{ padding: 3 }}>
              <Typography variant="h6">{project.name}</Typography>
              <Typography>{project.description}</Typography>
              <Typography>Start Date: {new Date(project.startDate).toLocaleDateString()}</Typography>
              <Typography>End Date: {new Date(project.endDate).toLocaleDateString()}</Typography>
              <Typography>Budget: ${project.budget}</Typography>
              <Button onClick={() => dispatch(updateFarmProject(project._id, newProject))} color="secondary" sx={{ mt: 1 }}>
                Edit
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default FarmProject;