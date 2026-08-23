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

const DeleteExpenseDialog = ({
  open,
  loading = false,
  expense = null,
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
      <DialogTitle>{t("Delete Expense")}</DialogTitle>
      <DialogContent>
        <Typography>
          {t(
            "Are you sure you want to delete this expense? This action cannot be undone.",
          )}
        </Typography>
        {expense && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            <strong>{expense.category}</strong>
            {expense.amount !== undefined && (
              <> (₦{Number(expense.amount).toLocaleString()})</>
            )}
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

export default DeleteExpenseDialog;
