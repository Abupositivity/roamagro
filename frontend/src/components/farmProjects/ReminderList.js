import React from "react";
import { Alert, Grid } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReminderCard from "./ReminderCard";

const ReminderList = ({
  reminders = [],
  loading = false,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const { t } = useTranslation();

  if (!reminders.length) {
    return <Alert severity="info">{t("No reminders yet.")}</Alert>;
  }
  return (
    <Grid container spacing={3}>
      {reminders.map((reminder) => (
        <Grid item xs={12} md={6} lg={4} key={reminder._id}>
          <ReminderCard
            reminder={reminder}
            loading={loading}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default ReminderList;
