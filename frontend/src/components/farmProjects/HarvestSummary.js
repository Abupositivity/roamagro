import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
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
    <Card
      sx={{
        mb: { xs: 2, sm: 3 },
        width: "100%",
        minWidth: 0,
        borderRadius: 2,
      }}
    >
      <CardContent
        sx={{
          p: { xs: 2, sm: 3 },
          "&:last-child": {
            pb: { xs: 2, sm: 3 },
          },
        }}
      >
        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          alignItems="stretch"
        >
          {/* Harvest Count */}
          <Grid item xs={6} sm={4}>
            <Stack
              spacing={0.75}
              sx={{
                height: "100%",
                minWidth: 0,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: {
                    xs: "0.8rem",
                    sm: "0.875rem",
                  },
                  overflowWrap: "anywhere",
                }}
              >
                {t("Harvests")}
              </Typography>

              <Typography
                fontWeight={700}
                sx={{
                  fontSize: {
                    xs: "1.25rem",
                    sm: "1.5rem",
                  },
                  fontVariantNumeric: "tabular-nums",
                  overflowWrap: "anywhere",
                }}
              >
                {summary.count}
              </Typography>
            </Stack>
          </Grid>

          {/* Total Quantity */}
          <Grid item xs={6} sm={4}>
            <Stack
              spacing={0.75}
              sx={{
                height: "100%",
                minWidth: 0,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: {
                    xs: "0.8rem",
                    sm: "0.875rem",
                  },
                  overflowWrap: "anywhere",
                }}
              >
                {t("Quantity")}
              </Typography>

              <Typography
                fontWeight={700}
                sx={{
                  fontSize: {
                    xs: "1.25rem",
                    sm: "1.5rem",
                  },
                  fontVariantNumeric: "tabular-nums",
                  overflowWrap: "anywhere",
                }}
              >
                {summary.quantity.toLocaleString()}
              </Typography>
            </Stack>
          </Grid>

          {/* Total Income */}
          <Grid item xs={12} sm={4}>
            <Stack
              spacing={0.75}
              sx={{
                height: "100%",
                minWidth: 0,
              }}
            >
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: {
                    xs: "0.8rem",
                    sm: "0.875rem",
                  },
                  overflowWrap: "anywhere",
                }}
              >
                {t("Income")}
              </Typography>

              <Typography
                fontWeight={700}
                color="success.main"
                sx={{
                  fontSize: {
                    xs: "1.35rem",
                    sm: "1.5rem",
                  },
                  fontVariantNumeric: "tabular-nums",
                  overflowWrap: "anywhere",
                }}
              >
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