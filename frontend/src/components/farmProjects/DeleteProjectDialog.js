import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const DeleteProjectDialog = ({
  open,
  project,
  loading = false,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      fullWidth
      maxWidth="xs"
    >
      <DialogTitle>{t("Delete Farm Project")}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {project ? (
            <>
              {t("Are you sure you want to delete")}{" "}
              <Typography component="span" fontWeight={700}>
                {project.name}
              </Typography>
              ?
              <br />
              <br />
              {t("This action cannot be undone.")}
            </>
          ) : (
            t("No project selected.")
          )}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={!project || loading}
          onClick={onConfirm}
          startIcon={
            loading ? <CircularProgress size={18} color="inherit" /> : undefined
          }
        >
          {loading ? t("Deleting...") : t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteProjectDialog;
