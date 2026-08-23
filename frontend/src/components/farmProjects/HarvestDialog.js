import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  IconButton,
  Stack,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useTranslation } from "react-i18next";

const HARVEST_UNITS = [
  "kg",
  "g",
  "bags",
  "baskets",
  "crates",
  "pieces",
  "litres",
  "tonnes",
  "other",
];

const HarvestDialog = ({
  open,
  loading = false,
  harvest = null,
  onClose,
  onSubmit,
}) => {
  const { t } = useTranslation();

  const [form, setForm] = useState({
    crop: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    harvestDate: "",
  });

  useEffect(() => {
    if (harvest) {
      setForm({
        crop: harvest.crop || "",
        quantity: harvest.quantity ?? "",
        unit: harvest.unit || "kg",
        pricePerUnit: harvest.pricePerUnit ?? "",
        harvestDate: harvest.harvestDate
          ? new Date(harvest.harvestDate).toISOString().split("T")[0]
          : "",
      });
    } else {
      setForm({
        crop: "",
        quantity: "",
        unit: "kg",
        pricePerUnit: "",
        harvestDate: "",
      });
    }
  }, [harvest, open]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (
      !form.crop.trim() ||
      form.quantity === "" ||
      Number(form.quantity) <= 0 ||
      form.pricePerUnit === "" ||
      Number(form.pricePerUnit) < 0
    )
      return;

    onSubmit?.({
      ...form,
      quantity: Number(form.quantity),
      pricePerUnit: Number(form.pricePerUnit),
    });
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
        {harvest ? t("Edit Harvest") : t("Add Harvest")}
        <IconButton onClick={onClose} disabled={loading}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <TextField
            label={t("Crop")}
            name="crop"
            value={form.crop}
            onChange={handleChange}
            fullWidth
            required
          />

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                label={t("Quantity")}
                name="quantity"
                type="number"
                value={form.quantity}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                select
                label={t("Unit")}
                name="unit"
                value={form.unit}
                onChange={handleChange}
                fullWidth
                required
              >
                {HARVEST_UNITS.map((unit) => (
                  <MenuItem key={unit} value={unit}>
                    {unit}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={6}>
              <TextField
                label={t("Price Per Unit")}
                name="pricePerUnit"
                type="number"
                value={form.pricePerUnit}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ min: 0 }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                label={t("Harvest Date")}
                type="date"
                name="harvestDate"
                value={form.harvestDate}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          {t("Cancel")}
        </Button>

        <Button variant="contained" disabled={loading} onClick={handleSubmit}>
          {harvest ? t("Update Harvest") : t("Add Harvest")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HarvestDialog;
