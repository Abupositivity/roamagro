import React from "react";
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Chip,
  Checkbox,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

const ReminderCard = ({
  reminder,
  loading = false,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Stack spacing={1} flex={1}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Checkbox
                checked={reminder.completed}
                disabled={loading}
                onChange={() => onToggle?.(reminder)}
              />
              <Typography
                variant="h6"
                sx={{
                  textDecoration: reminder.completed ? "line-through" : "none",
                }}
              >
                {reminder.title}
              </Typography>
            </Stack>
            <Chip
              label={reminder.completed ? t("Completed") : t("Pending")}
              color={reminder.completed ? "success" : "warning"}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              {new Date(reminder.reminderDate).toLocaleDateString()}
            </Typography>
          </Stack>
          <Stack direction="row">
            <IconButton
              size="small"
              disabled={loading}
              onClick={() => onEdit?.(reminder)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              disabled={loading}
              onClick={() => onDelete?.(reminder)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ReminderCard;
