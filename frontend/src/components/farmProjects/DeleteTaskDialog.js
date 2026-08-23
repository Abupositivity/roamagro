import React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const DeleteTaskDialog = ({
  open,
  loading = false,
  task = null,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle>{t("Delete Task")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {task
            ? t(
                'Are you sure you want to delete "{{title}}"? This action cannot be undone.',
                { title: task.title },
              )
            : t("Are you sure you want to delete this task?")}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          disabled={loading}
        >
          {t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteTaskDialog;
