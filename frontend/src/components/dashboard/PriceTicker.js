import React, { useMemo } from "react";
import {
    Box,
    Chip,
    Typography,
    Stack,
} from "@mui/material";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const PriceTicker = () => {
    const { t } = useTranslation();

    const prices = useSelector(
        state => state.priceIndex.priceIndex || []
    );

    const recentPrices = useMemo(
        () => prices.slice(0, 10),
        [prices]
    );

    return (
        <Box>
            <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
            >
                {t("Recent Prices")}
            </Typography>

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    overflowX: "auto",
                    pb: 1
                }}
            >
                {recentPrices.length === 0 ? (
                    <Typography color="text.secondary">
                        {t("No market prices available")}
                    </Typography>
                ) : (
                    recentPrices.map(price => (
                        <Chip
                            key={price._id}
                            icon={<TrendingUpIcon />}
                            color="success"
                            label={`${price.product} ₦${
                                typeof price.price === "number"
                                    ? price.price.toLocaleString()
                                    : "0"
                            }`}
                        />
                    ))
                )}
            </Stack>
        </Box>
    );
};

export default React.memo(PriceTicker);