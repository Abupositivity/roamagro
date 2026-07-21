import React from "react";

import {
    Box,
    Chip,
    Typography,
    Stack,
} from "@mui/material";

import TrendingUpIcon
from "@mui/icons-material/TrendingUp";

import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const PriceTicker = () => {

    const { t } = useTranslation();

    const prices =
        useSelector(
            state =>
            state.priceIndex.priceIndex || []
        );

    return (

        <Box>

            <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
            >
                {t("Today's Prices")}
            </Typography>

            <Stack
                direction="row"
                spacing={1}
                sx={{
                    overflowX:"auto",
                    pb:1
                }}
            >

                {

                    prices.length===0 ?

                    <Typography
                        color="text.secondary"
                    >

                        {t("No market prices available")}

                    </Typography>

                    :

                    prices
                    .slice(0,10)
                    .map(price=>(

                        <Chip

                            key={price._id}

                            icon={<TrendingUpIcon/>}

                            color="success"

                            label={`${price.product}
                            ₦${price.price}`}

                        />

                    ))

                }

            </Stack>

        </Box>

    );

};

export default PriceTicker;