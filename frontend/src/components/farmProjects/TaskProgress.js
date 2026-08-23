import React from "react";
import { Box, LinearProgress, Stack, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import { useTranslation } from "react-i18next";

const TaskProgress = ({ tasks = [] }) => {
  const { t } = useTranslation();
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "Completed").length;
  const pending = tasks.filter((task) => task.status !== "Completed").length;
  const progress = total ? Math.round((completed / total) * 100) : 0;
  return (
    <Box sx={{ mb: 3 }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography variant="subtitle1" fontWeight={700}>
          {t("Task Progress")}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {progress}%
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          height: 10,
          borderRadius: 5,
          mb: 2,
        }}
      />
      <Stack direction="row" spacing={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleIcon color="success" fontSize="small" />
          <Typography variant="body2">
            {completed} {t("Completed")}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <PendingActionsIcon color="warning" fontSize="small" />
          <Typography variant="body2">
            {pending} {t("Pending")}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="body2" fontWeight={600}>
            {total} {t("Total")}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default TaskProgress;
