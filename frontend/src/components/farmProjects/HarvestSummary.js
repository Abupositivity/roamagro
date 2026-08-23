import React, { useMemo } from "react";
import { Card, CardContent, Grid, Stack, Typography } from "@mui/material";
import { useTranslation } from "react-i18next";

const HarvestSummary = ({ project }) => {
  const { t } = useTranslation();
  const summary = useMemo(() => {
    const harvests = project?.harvests || [];
    const quantity = harvests.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );
    const income = harvests.reduce(
      (sum, item) => sum + (item.totalValue || 0),
      0,
    );
    return {
      count: harvests.length,
      quantity,
      income,
    };
  }, [project]);
  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={4}>
            <Stack spacing={1}>
              <Typography color="text.secondary">{t("Harvests")}</Typography>
              <Typography variant="h5" fontWeight={700}>
                {summary.count}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack spacing={1}>
              <Typography color="text.secondary">{t("Quantity")}</Typography>
              <Typography variant="h5" fontWeight={700}>
                {summary.quantity.toLocaleString()}
              </Typography>
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack spacing={1}>
              <Typography color="text.secondary">{t("Income")}</Typography>
              <Typography variant="h5" fontWeight={700} color="success.main">
                ₦{summary.income.toLocaleString()}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default HarvestSummary;
