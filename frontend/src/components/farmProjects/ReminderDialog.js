import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

const ReminderDialog = ({
  open,
  loading = false,
  reminder = null,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    title: "",
    reminderDate: "",
  });
  useEffect(() => {
    if (reminder) {
      setForm({
        title: reminder.title || "",
        reminderDate: reminder.reminderDate
          ? new Date(reminder.reminderDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm({
        title: "",
        reminderDate: "",
      });
    }
  }, [reminder, open]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;
    onSubmit?.(form);
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {reminder ? t("Edit Reminder") : t("Add Reminder")}
        <IconButton disabled={loading} onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("Title")}
            name="title"
            value={form.title}
            onChange={handleChange}
            fullWidth
            required
          />
          <TextField
            label={t("Reminder Date")}
            name="reminderDate"
            type="date"
            value={form.reminderDate}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {reminder ? t("Update Reminder") : t("Add Reminder")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReminderDialog;
