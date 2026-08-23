import React from "react";
import {
  Card,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  Typography,
  Button,
  Box,
} from "@mui/material";
import {
  CalendarMonth,
  LocationOn,
  Agriculture,
  TrendingUp,
  TaskAlt,
  Grass,
  NotificationsActive,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

const statusColor = {
  Planning: "default",
  Active: "success",
  Paused: "warning",
  Completed: "primary",
};

const priorityColor = {
  Low: "success",
  Medium: "warning",
  High: "error",
};

const currency = (value) => `₦${Number(value || 0).toLocaleString()}`;

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
};

const FarmProjectCard = ({ project, onView, onEdit, onDelete }) => {
  const { t } = useTranslation();

  const {
    name,
    description,
    crop,
    farmType,
    location,
    status,
    priority,
    progress,
    budget,
    financials = {},
    startDate,
    endDate,
    completedActivities = 0,
    pendingActivities = 0,
    harvests = [],
    reminders = [],
  } = project;

  const harvestCount = harvests.length;

  const pendingReminderCount = reminders.filter(
    (reminder) => !reminder.completed,
  ).length;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 3,
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          height: "100%",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {name}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              {farmType}
              {crop ? ` • ${crop}` : ""}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1} flexShrink={0}>
            <Chip
              label={t(status)}
              size="small"
              color={statusColor[status] || "default"}
            />

            <Chip
              label={t(priority)}
              size="small"
              color={priorityColor[priority] || "default"}
              variant="outlined"
            />
          </Stack>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {description || t("No description")}
        </Typography>

        <Divider />

        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOn fontSize="small" />
            <Typography variant="body2">
              {location || t("No location")}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonth fontSize="small" />
            <Typography variant="body2">
              {formatDate(startDate)} - {formatDate(endDate)}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Agriculture fontSize="small" />
            <Typography variant="body2">
              {t("Budget")}: {currency(budget)}
            </Typography>
          </Stack>
        </Stack>

        <Divider />

        <Box>
          <Stack direction="row" justifyContent="space-between" mb={1}>
            <Typography variant="body2">{t("Progress")}</Typography>

            <Typography variant="body2" fontWeight={700}>
              {progress || 0}%
            </Typography>
          </Stack>

          <LinearProgress
            variant="determinate"
            value={Math.min(100, Math.max(0, progress || 0))}
            sx={{
              height: 8,
              borderRadius: 5,
            }}
          />
        </Box>

        <Divider />

        <Stack direction="row" justifyContent="space-between">
          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              {t("Expenses")}
            </Typography>

            <Typography variant="subtitle2" fontWeight={700} color="error.main">
              {currency(financials.expenses)}
            </Typography>
          </Box>

          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              {t("Income")}
            </Typography>

            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="success.main"
            >
              {currency(financials.income)}
            </Typography>
          </Box>

          <Box textAlign="center">
            <Typography variant="caption" color="text.secondary">
              {t("Profit")}
            </Typography>

            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={
                (financials.profit || 0) >= 0 ? "success.main" : "error.main"
              }
            >
              {currency(financials.profit)}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TrendingUp fontSize="small" color="warning" />

            <Typography variant="body2">{pendingActivities}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <TaskAlt fontSize="small" color="success" />

            <Typography variant="body2">{completedActivities}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <Grass fontSize="small" color="success" />

            <Typography variant="body2">{harvestCount}</Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <NotificationsActive
              fontSize="small"
              color={pendingReminderCount > 0 ? "warning" : "disabled"}
            />

            <Typography
              variant="body2"
              color={
                pendingReminderCount > 0 ? "warning.main" : "text.secondary"
              }
            >
              {pendingReminderCount}
            </Typography>
          </Stack>
        </Stack>

        <Box display="flex" gap={1} mt="auto" pt={2}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => onView?.(project)}
          >
            {t("View")}
          </Button>

          <Button
            variant="outlined"
            fullWidth
            onClick={() => onEdit?.(project)}
          >
            {t("Edit")}
          </Button>

          <Button
            color="error"
            variant="outlined"
            fullWidth
            onClick={() => onDelete?.(project)}
          >
            {t("Delete")}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FarmProjectCard;
