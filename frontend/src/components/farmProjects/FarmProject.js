import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Snackbar,
    Stack,
    Typography
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';

import {
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
    updateTaskStatus,

    createExpense,
    updateExpense,
    deleteExpense,

    createHarvest,
    updateHarvest,
    deleteHarvest,

    createReminder,
    updateReminder,
    deleteReminder,
    toggleReminder
} from '../../redux/actions/farmProjectsActions';

import ProjectList from './ProjectList';
import ProjectDialog from './ProjectDialog';
import DeleteProjectDialog from './DeleteProjectDialog';


const FarmProject = () => {

    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        projects,
        loading,
        error
    } = useSelector(
        state => state.farmProjects
    );


    // ============================================================
    // PROJECT DIALOG STATE
    // ============================================================

    const [dialogOpen, setDialogOpen] = useState(false);

    const [dialogMode, setDialogMode] = useState('create');

    const [deleteDialogOpen, setDeleteDialogOpen] =
        useState(false);

    const [selectedProject, setSelectedProject] =
        useState(null);


    // ============================================================
    // SNACKBAR
    // ============================================================

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });


    // ============================================================
    // LOAD PROJECTS
    // ============================================================

    useEffect(() => {

        dispatch(fetchFarmProjects());

    }, [dispatch]);


    // ============================================================
    // SNACKBAR
    // ============================================================

    const showSnackbar = (success, message) => {

        setSnackbar({
            open: true,
            severity: success ? 'success' : 'error',
            message
        });
    };


    const closeSnackbar = () => {

        setSnackbar(prev => ({
            ...prev,
            open: false
        }));
    };


    // ============================================================
    // PROJECT DIALOG
    // ============================================================

    const openCreateDialog = () => {

        setSelectedProject(null);
        setDialogMode('create');
        setDialogOpen(true);
    };


    const openEditDialog = project => {

        setSelectedProject(project);
        setDialogMode('edit');
        setDialogOpen(true);
    };


    const openViewDialog = project => {

        setSelectedProject(project);
        setDialogMode('view');
        setDialogOpen(true);
    };


    const closeDialog = () => {

        if (loading) return;

        setDialogOpen(false);
        setSelectedProject(null);
        setDialogMode('create');
    };


    // ============================================================
    // PROJECT CRUD
    // ============================================================

    const handleSubmit = async data => {

        let result;

        if (
            dialogMode === 'edit' &&
            selectedProject
        ) {

            result = await dispatch(
                updateFarmProject(
                    selectedProject._id,
                    data
                )
            );

        } else {

            result = await dispatch(
                createFarmProject(data)
            );
        }


        showSnackbar(
            result.success,
            result.success
                ? (
                    dialogMode === 'edit'
                        ? t('Project updated successfully.')
                        : t('Project created successfully.')
                )
                : result.message
        );


        if (result.success) {

            setDialogOpen(false);
            setSelectedProject(null);
            setDialogMode('create');
        }


        return result;
    };


    // ============================================================
    // DELETE PROJECT
    // ============================================================

    const openDeleteDialog = project => {

        setSelectedProject(project);
        setDeleteDialogOpen(true);
    };


    const closeDeleteDialog = () => {

        if (loading) return;

        setDeleteDialogOpen(false);
        setSelectedProject(null);
    };


    const handleDelete = async () => {

        if (!selectedProject) return;

        const result = await dispatch(
            deleteFarmProject(
                selectedProject._id
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Project deleted successfully.')
                : result.message
        );


        if (result.success) {

            setDeleteDialogOpen(false);
            setSelectedProject(null);
        }


        return result;
    };


    // ============================================================
    // ACTIVITIES
    // ============================================================

    const handleCreateActivity = async (
        projectId,
        data
    ) => {

        const result = await dispatch(
            createActivity(
                projectId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Activity created successfully.')
                : result.message
        );


        return result;
    };


    const handleUpdateActivity = async (
        projectId,
        activityId,
        data
    ) => {

        const result = await dispatch(
            updateActivity(
                projectId,
                activityId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Activity updated successfully.')
                : result.message
        );


        return result;
    };


    const handleDeleteActivity = async (
        projectId,
        activityId
    ) => {

        const result = await dispatch(
            deleteActivity(
                projectId,
                activityId
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Activity deleted successfully.')
                : result.message
        );


        return result;
    };


    const handleUpdateActivityStatus = async (
        projectId,
        activityId,
        status
    ) => {

        const result = await dispatch(
            updateActivityStatus(
                projectId,
                activityId,
                status
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Activity status updated successfully.')
                : result.message
        );


        return result;
    };


    // ============================================================
    // TASKS
    // ============================================================

    const handleCreateTask = async (
        projectId,
        data
    ) => {

        const result = await dispatch(
            createTask(
                projectId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Task created successfully.')
                : result.message
        );


        return result;
    };


    const handleUpdateTask = async (
        projectId,
        taskId,
        data
    ) => {

        const result = await dispatch(
            updateTask(
                projectId,
                taskId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Task updated successfully.')
                : result.message
        );


        return result;
    };


    const handleDeleteTask = async (
        projectId,
        taskId
    ) => {

        const result = await dispatch(
            deleteTask(
                projectId,
                taskId
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Task deleted successfully.')
                : result.message
        );


        return result;
    };


    const handleUpdateTaskStatus = async (
        projectId,
        taskId,
        status
    ) => {

        const result = await dispatch(
            updateTaskStatus(
                projectId,
                taskId,
                status
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Task status updated successfully.')
                : result.message
        );


        return result;
    };


    // ============================================================
    // EXPENSES
    // ============================================================

    const handleCreateExpense = async (
        projectId,
        data
    ) => {

        const result = await dispatch(
            createExpense(
                projectId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Expense added successfully.')
                : result.message
        );


        return result;
    };


    const handleUpdateExpense = async (
        projectId,
        expenseId,
        data
    ) => {

        const result = await dispatch(
            updateExpense(
                projectId,
                expenseId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Expense updated successfully.')
                : result.message
        );


        return result;
    };


    const handleDeleteExpense = async (
        projectId,
        expenseId
    ) => {

        const result = await dispatch(
            deleteExpense(
                projectId,
                expenseId
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Expense deleted successfully.')
                : result.message
        );


        return result;
    };


    // ============================================================
    // HARVESTS
    // ============================================================

    const handleCreateHarvest = async (
        projectId,
        data
    ) => {

        const result = await dispatch(
            createHarvest(
                projectId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Harvest added successfully.')
                : result.message
        );


        return result;
    };


    const handleUpdateHarvest = async (
        projectId,
        harvestId,
        data
    ) => {

        const result = await dispatch(
            updateHarvest(
                projectId,
                harvestId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Harvest updated successfully.')
                : result.message
        );


        return result;
    };


    const handleDeleteHarvest = async (
        projectId,
        harvestId
    ) => {

        const result = await dispatch(
            deleteHarvest(
                projectId,
                harvestId
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Harvest deleted successfully.')
                : result.message
        );


        return result;
    };


    // ============================================================
    // REMINDERS
    // ============================================================

    const handleCreateReminder = async (
        projectId,
        data
    ) => {

        const result = await dispatch(
            createReminder(
                projectId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Reminder created successfully.')
                : result.message
        );


        return result;
    };


    const handleUpdateReminder = async (
        projectId,
        reminderId,
        data
    ) => {

        const result = await dispatch(
            updateReminder(
                projectId,
                reminderId,
                data
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Reminder updated successfully.')
                : result.message
        );


        return result;
    };


    const handleDeleteReminder = async (
        projectId,
        reminderId
    ) => {

        const result = await dispatch(
            deleteReminder(
                projectId,
                reminderId
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Reminder deleted successfully.')
                : result.message
        );


        return result;
    };


    const handleToggleReminder = async (
        projectId,
        reminderId
    ) => {

        const result = await dispatch(
            toggleReminder(
                projectId,
                reminderId
            )
        );


        showSnackbar(
            result.success,
            result.success
                ? t('Reminder updated successfully.')
                : result.message
        );


        return result;
    };


    // ============================================================
    // RENDER
    // ============================================================

    return (
        <Container
            maxWidth="xl"
            sx={{
                py: 3,
                pb: 12
            }}
        >

            <Stack
                direction={{
                    xs: 'column',
                    sm: 'row'
                }}
                justifyContent="space-between"
                alignItems={{
                    xs: 'flex-start',
                    sm: 'center'
                }}
                spacing={2}
                mb={4}
            >

                <Typography
                    variant="h4"
                    component="h1"
                >
                    {t('Farm Projects')}
                </Typography>


                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                    disabled={loading}
                >
                    {t('New Project')}
                </Button>

            </Stack>


            {loading && projects.length === 0 && (
                <Box
                    display="flex"
                    justifyContent="center"
                    py={6}
                >
                    <CircularProgress />
                </Box>
            )}


            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 3 }}
                >
                    {error}
                </Alert>
            )}


            {!loading && !error && (
                <ProjectList
                    projects={projects}
                    onView={openViewDialog}
                    onEdit={openEditDialog}
                    onDelete={openDeleteDialog}
                />
            )}


            <ProjectDialog
                open={dialogOpen}
                loading={loading}
                project={selectedProject}
                mode={dialogMode}

                onClose={closeDialog}
                onSubmit={handleSubmit}

                onCreateActivity={handleCreateActivity}
                onUpdateActivity={handleUpdateActivity}
                onDeleteActivity={handleDeleteActivity}
                onToggleActivityStatus={
                    handleUpdateActivityStatus
                }

                onCreateTask={handleCreateTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onToggleTaskStatus={
                    handleUpdateTaskStatus
                }

                onCreateExpense={handleCreateExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}

                onCreateHarvest={handleCreateHarvest}
                onUpdateHarvest={handleUpdateHarvest}
                onDeleteHarvest={handleDeleteHarvest}

                onCreateReminder={handleCreateReminder}
                onUpdateReminder={handleUpdateReminder}
                onDeleteReminder={handleDeleteReminder}
                onToggleReminder={handleToggleReminder}
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
                    vertical: 'bottom',
                    horizontal: 'center'
                }}
            >

                <Alert
                    onClose={closeSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>

            </Snackbar>

        </Container>
    );
};


export default FarmProject;