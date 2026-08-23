import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const DeleteHarvestDialog = ({
  open,
  loading = false,
  harvest = null,
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
      <DialogTitle>{t("Delete Harvest")}</DialogTitle>
      <DialogContent>
        <Typography>
          {t("Are you sure you want to delete this harvest?")}
        </Typography>
        {harvest && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>{harvest.crop}</strong>
            {" • "}
            {harvest.quantity} {harvest.unit}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button
          variant="contained"
          color="error"
          disabled={loading}
          onClick={onConfirm}
        >
          {t("Delete")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteHarvestDialog;
