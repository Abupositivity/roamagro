import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Button,
  IconButton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import { useTranslation } from "react-i18next";
import FarmProjectForm from "./FarmProjectForm";
import ActivityList from "./ActivityList";
import ActivityDialog from "./ActivityDialog";
import DeleteActivityDialog from "./DeleteActivityDialog";
import TaskList from "./TaskList";
import TaskDialog from "./TaskDialog";
import DeleteTaskDialog from "./DeleteTaskDialog";
import ExpenseSummary from "./ExpenseSummary";
import ExpenseList from "./ExpenseList";
import ExpenseDialog from "./ExpenseDialog";
import DeleteExpenseDialog from "./DeleteExpenseDialog";
import HarvestSummary from "./HarvestSummary";
import HarvestList from "./HarvestList";
import HarvestDialog from "./HarvestDialog";
import DeleteHarvestDialog from "./DeleteHarvestDialog";
import ReminderSummary from "./ReminderSummary";
import ReminderList from "./ReminderList";
import ReminderDialog from "./ReminderDialog";
import DeleteReminderDialog from "./DeleteReminderDialog";

const ProjectDialog = ({
  open,
  loading = false,
  project = null,
  mode = "create",
  onClose,
  onSubmit,
  onRefreshProject,
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
  onToggleReminder,
}) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState(0);

  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [deleteTaskDialogOpen, setDeleteTaskDialogOpen] = useState(false);

  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [deleteExpenseDialogOpen, setDeleteExpenseDialogOpen] = useState(false);

  const [harvestDialogOpen, setHarvestDialogOpen] = useState(false);
  const [selectedHarvest, setSelectedHarvest] = useState(null);
  const [deleteHarvestDialogOpen, setDeleteHarvestDialogOpen] = useState(false);

  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [deleteReminderDialogOpen, setDeleteReminderDialogOpen] =
    useState(false);

  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const isReadOnly = isView;

  useEffect(() => {
    if (!open) return;
    setTab(0);
    setActivityDialogOpen(false);
    setSelectedActivity(null);
    setDeleteDialogOpen(false);
    setTaskDialogOpen(false);
    setSelectedTask(null);
    setDeleteTaskDialogOpen(false);
    setExpenseDialogOpen(false);
    setSelectedExpense(null);
    setDeleteExpenseDialogOpen(false);
    setHarvestDialogOpen(false);
    setSelectedHarvest(null);
    setDeleteHarvestDialogOpen(false);
    setReminderDialogOpen(false);
    setSelectedReminder(null);
    setDeleteReminderDialogOpen(false);
  }, [open, mode, project?._id]);

  const refreshProject = async () => {
    if (!project?._id || !onRefreshProject) return;
    return onRefreshProject(project._id);
  };

  const handleSuccess = async (result) => {
    if (!result?.success) return result;
    await refreshProject();
    return result;
  };

  const handleSubmit = async (data) => {
    if (isReadOnly) return;
    return onSubmit?.(data);
  };

  const openCreateActivity = () => {
    if (isReadOnly || !project?._id) return;
    setSelectedActivity(null);
    setActivityDialogOpen(true);
  };

  const openEditActivity = (activity) => {
    if (isReadOnly) return;
    setSelectedActivity(activity);
    setActivityDialogOpen(true);
  };

  const closeActivityDialog = () => {
    if (loading) return;
    setActivityDialogOpen(false);
    setSelectedActivity(null);
  };

  const openDeleteActivity = (activity) => {
    if (isReadOnly) return;
    setSelectedActivity(activity);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    if (loading) return;
    setDeleteDialogOpen(false);
    setSelectedActivity(null);
  };

  const handleActivitySubmit = async (data) => {
    if (!project?._id || isReadOnly) return;
    const result = selectedActivity
      ? await onUpdateActivity?.(project._id, selectedActivity._id, data)
      : await onCreateActivity?.(project._id, data);
    if (result?.success) {
      await refreshProject();
      closeActivityDialog();
    }
    return result;
  };

  const handleDeleteActivity = async () => {
    if (!project?._id || !selectedActivity || isReadOnly) return;
    const result = await onDeleteActivity?.(project._id, selectedActivity._id);
    if (result?.success) {
      await refreshProject();
      closeDeleteDialog();
    }
    return result;
  };

  const handleToggleActivity = async (activity) => {
    if (!project?._id || isReadOnly) return;
    const result = await onToggleActivityStatus?.(
      project._id,
      activity._id,
      activity.status === "Completed" ? "Pending" : "Completed",
    );
    return handleSuccess(result);
  };

  const openCreateTask = () => {
    if (isReadOnly || !project?._id) return;
    setSelectedTask(null);
    setTaskDialogOpen(true);
  };

  const openEditTask = (task) => {
    if (isReadOnly) return;
    setSelectedTask(task);
    setTaskDialogOpen(true);
  };

  const closeTaskDialog = () => {
    if (loading) return;
    setTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const openDeleteTask = (task) => {
    if (isReadOnly) return;
    setSelectedTask(task);
    setDeleteTaskDialogOpen(true);
  };

  const closeDeleteTaskDialog = () => {
    if (loading) return;
    setDeleteTaskDialogOpen(false);
    setSelectedTask(null);
  };

  const handleTaskSubmit = async (data) => {
    if (!project?._id || isReadOnly) return;
    const result = selectedTask
      ? await onUpdateTask?.(project._id, selectedTask._id, data)
      : await onCreateTask?.(project._id, data);
    if (result?.success) {
      await refreshProject();
      closeTaskDialog();
    }
    return result;
  };

  const handleDeleteTask = async () => {
    if (!project?._id || !selectedTask || isReadOnly) return;
    const result = await onDeleteTask?.(project._id, selectedTask._id);
    if (result?.success) {
      await refreshProject();
      closeDeleteTaskDialog();
    }
    return result;
  };

  const handleToggleTask = async (task) => {
    if (!project?._id || isReadOnly) return;
    const result = await onToggleTaskStatus?.(
      project._id,
      task._id,
      task.status === "Completed" ? "Pending" : "Completed",
    );
    return handleSuccess(result);
  };

  const openCreateExpense = () => {
    if (isReadOnly || !project?._id) return;
    setSelectedExpense(null);
    setExpenseDialogOpen(true);
  };

  const openEditExpense = (expense) => {
    if (isReadOnly) return;
    setSelectedExpense(expense);
    setExpenseDialogOpen(true);
  };

  const closeExpenseDialog = () => {
    if (loading) return;
    setExpenseDialogOpen(false);
    setSelectedExpense(null);
  };

  const openDeleteExpense = (expense) => {
    if (isReadOnly) return;
    setSelectedExpense(expense);
    setDeleteExpenseDialogOpen(true);
  };

  const closeDeleteExpenseDialog = () => {
    if (loading) return;
    setDeleteExpenseDialogOpen(false);
    setSelectedExpense(null);
  };

  const handleExpenseSubmit = async (data) => {
    if (!project?._id || isReadOnly) return;
    const result = selectedExpense
      ? await onUpdateExpense?.(project._id, selectedExpense._id, data)
      : await onCreateExpense?.(project._id, data);
    if (result?.success) {
      await refreshProject();
      closeExpenseDialog();
    }
    return result;
  };

  const handleDeleteExpense = async () => {
    if (!project?._id || !selectedExpense || isReadOnly) return;
    const result = await onDeleteExpense?.(project._id, selectedExpense._id);
    if (result?.success) {
      await refreshProject();
      closeDeleteExpenseDialog();
    }
    return result;
  };

  const openCreateHarvest = () => {
    if (isReadOnly || !project?._id) return;
    setSelectedHarvest(null);
    setHarvestDialogOpen(true);
  };

  const openEditHarvest = (harvest) => {
    if (isReadOnly) return;
    setSelectedHarvest(harvest);
    setHarvestDialogOpen(true);
  };

  const closeHarvestDialog = () => {
    if (loading) return;
    setHarvestDialogOpen(false);
    setSelectedHarvest(null);
  };

  const openDeleteHarvest = (harvest) => {
    if (isReadOnly) return;
    setSelectedHarvest(harvest);
    setDeleteHarvestDialogOpen(true);
  };

  const closeDeleteHarvestDialog = () => {
    if (loading) return;
    setDeleteHarvestDialogOpen(false);
    setSelectedHarvest(null);
  };

  const handleHarvestSubmit = async (data) => {
    if (!project?._id || isReadOnly) return;
    const result = selectedHarvest
      ? await onUpdateHarvest?.(project._id, selectedHarvest._id, data)
      : await onCreateHarvest?.(project._id, data);
    if (result?.success) {
      await refreshProject();
      closeHarvestDialog();
    }
    return result;
  };

  const handleDeleteHarvest = async () => {
    if (!project?._id || !selectedHarvest || isReadOnly) return;
    const result = await onDeleteHarvest?.(project._id, selectedHarvest._id);
    if (result?.success) {
      await refreshProject();
      closeDeleteHarvestDialog();
    }
    return result;
  };

  const openCreateReminder = () => {
    if (isReadOnly || !project?._id) return;
    setSelectedReminder(null);
    setReminderDialogOpen(true);
  };

  const openEditReminder = (reminder) => {
    if (isReadOnly) return;
    setSelectedReminder(reminder);
    setReminderDialogOpen(true);
  };

  const closeReminderDialog = () => {
    if (loading) return;
    setReminderDialogOpen(false);
    setSelectedReminder(null);
  };

  const openDeleteReminder = (reminder) => {
    if (isReadOnly) return;
    setSelectedReminder(reminder);
    setDeleteReminderDialogOpen(true);
  };

  const closeDeleteReminderDialog = () => {
    if (loading) return;
    setDeleteReminderDialogOpen(false);
    setSelectedReminder(null);
  };

  const handleReminderSubmit = async (data) => {
    if (!project?._id || isReadOnly) return;
    const result = selectedReminder
      ? await onUpdateReminder?.(project._id, selectedReminder._id, data)
      : await onCreateReminder?.(project._id, data);
    if (result?.success) {
      await refreshProject();
      closeReminderDialog();
    }
    return result;
  };

  const handleDeleteReminder = async () => {
    if (!project?._id || !selectedReminder || isReadOnly) return;
    const result = await onDeleteReminder?.(project._id, selectedReminder._id);
    if (result?.success) {
      await refreshProject();
      closeDeleteReminderDialog();
    }
    return result;
  };

  const handleToggleReminder = async (reminder) => {
    if (!project?._id || isReadOnly) return;
    const result = await onToggleReminder?.(project._id, reminder._id);
    return handleSuccess(result);
  };

  const getTitle = () => {
    if (isCreate) return t("Create Farm Project");
    if (isView) return t("View Farm Project");
    return t("Edit Farm Project");
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="lg"
      scroll="paper"
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 3 },
          py: 2,
        }}
      >
        <Typography component="span" variant="h6" fontWeight={700}>
          {getTitle()}
        </Typography>
        <IconButton
          size="small"
          disabled={loading}
          onClick={onClose}
          aria-label={t("Close")}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {!isCreate && project && (
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            px: { xs: 0, sm: 2 },
          }}
        >
          <Tabs
            value={tab}
            onChange={(event, value) => setTab(value)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label={t("Project Details")} />
            <Tab label={t("Activities")} />
            <Tab label={t("Tasks")} />
            <Tab label={t("Expenses")} />
            <Tab label={t("Harvests")} />
            <Tab label={t("Reminders")} />
          </Tabs>
        </Box>
      )}

      <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
        {tab === 0 && (
          <FarmProjectForm
            loading={loading}
            initialValues={project}
            submitLabel={isEdit ? t("Update Project") : t("Create Project")}
            readOnly={isReadOnly}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        )}

        {tab === 1 && project && (
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("Activities")}
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={loading}
                  onClick={openCreateActivity}
                >
                  {t("Add Activity")}
                </Button>
              )}
            </Stack>
            <ActivityList
              activities={project.activities || []}
              loading={loading}
              onEdit={isReadOnly ? undefined : openEditActivity}
              onDelete={isReadOnly ? undefined : openDeleteActivity}
              onToggleStatus={isReadOnly ? undefined : handleToggleActivity}
            />
          </Box>
        )}

        {tab === 2 && project && (
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("Tasks")}
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={loading}
                  onClick={openCreateTask}
                >
                  {t("Add Task")}
                </Button>
              )}
            </Stack>
            <TaskList
              tasks={project.tasks || []}
              loading={loading}
              onEdit={isReadOnly ? undefined : openEditTask}
              onDelete={isReadOnly ? undefined : openDeleteTask}
              onToggleStatus={isReadOnly ? undefined : handleToggleTask}
            />
          </Box>
        )}

        {tab === 3 && project && (
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("Expenses")}
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={loading}
                  onClick={openCreateExpense}
                >
                  {t("Add Expense")}
                </Button>
              )}
            </Stack>
            <ExpenseSummary project={project} />
            <ExpenseList
              expenses={project.expenses || []}
              loading={loading}
              onEdit={isReadOnly ? undefined : openEditExpense}
              onDelete={isReadOnly ? undefined : openDeleteExpense}
            />
          </Box>
        )}

        {tab === 4 && project && (
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("Harvests")}
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={loading}
                  onClick={openCreateHarvest}
                >
                  {t("Add Harvest")}
                </Button>
              )}
            </Stack>
            <HarvestSummary project={project} />
            <HarvestList
              harvests={project.harvests || []}
              loading={loading}
              onEdit={isReadOnly ? undefined : openEditHarvest}
              onDelete={isReadOnly ? undefined : openDeleteHarvest}
            />
          </Box>
        )}

        {tab === 5 && project && (
          <Box>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", sm: "center" }}
              spacing={2}
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                {t("Reminders")}
              </Typography>
              {!isReadOnly && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  disabled={loading}
                  onClick={openCreateReminder}
                >
                  {t("Add Reminder")}
                </Button>
              )}
            </Stack>
            <ReminderSummary project={project} />
            <ReminderList
              reminders={project.reminders || []}
              loading={loading}
              onEdit={isReadOnly ? undefined : openEditReminder}
              onDelete={isReadOnly ? undefined : openDeleteReminder}
              onToggle={isReadOnly ? undefined : handleToggleReminder}
            />
          </Box>
        )}
      </DialogContent>

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
        onConfirm={handleDeleteActivity}
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
    </Dialog>
  );
};

export default ProjectDialog;