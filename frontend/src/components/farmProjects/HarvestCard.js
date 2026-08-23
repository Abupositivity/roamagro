import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

const HarvestCard = ({ harvest, loading = false, onEdit, onDelete }) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between">
          <Stack spacing={1} flex={1}>
            <Typography variant="h6" fontWeight={700}>
              {harvest.crop}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`${harvest.quantity} ${harvest.unit}`}
                size="small"
              />
              <Chip
                label={`₦${Number(harvest.pricePerUnit).toLocaleString()}/${harvest.unit}`}
                size="small"
              />
              <Chip
                color="success"
                label={`₦${Number(harvest.totalValue).toLocaleString()}`}
                size="small"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {harvest.harvestDate
                ? new Date(harvest.harvestDate).toLocaleDateString()
                : t("No Date")}
            </Typography>
          </Stack>
          <Stack direction="row">
            <IconButton
              size="small"
              disabled={loading}
              onClick={() => onEdit?.(harvest)}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              disabled={loading}
              onClick={() => onDelete?.(harvest)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default HarvestCard;
