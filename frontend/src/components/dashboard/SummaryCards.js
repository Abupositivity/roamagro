import React from "react";
import {
    Grid,
    Paper,
    Typography,
    Stack,
} from "@mui/material";

import AgricultureIcon from "@mui/icons-material/Agriculture";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";

import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const SummaryCards = () => {

    const { t } = useTranslation();

    const projects =
        useSelector(state => state.farmProjects.projects);

    const marketplace =
        useSelector(state => state.marketplace.listings);

    const prices =
        useSelector(state => state.priceIndex.priceIndex);

    const cards = [

        {
            title: t("Farm Projects"),
            value: projects?.length || 0,
            icon: <AgricultureIcon color="success" />
        },

        {
            title: t("Marketplace"),
            value: marketplace?.length || 0,
            icon: <StorefrontIcon color="primary" />
        },

        {
            title: t("Price Updates"),
            value: prices?.length || 0,
            icon: <PriceCheckIcon color="warning" />
        },

        {
            title: t("Revenue"),
            value: "₦0",
            icon: <AttachMoneyIcon color="secondary" />
        }

    ];

    return (

        <Grid container spacing={2}>

            {cards.map((card) => (

                <Grid
                    item
                    xs={6}
                    md={3}
                    key={card.title}
                >

                    <Paper
                        elevation={2}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            height: "100%"
                        }}
                    >

                        <Stack spacing={1}>

                            {card.icon}

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {card.title}
                            </Typography>

                            <Typography
                                variant="h5"
                                fontWeight={700}
                            >
                                {card.value}
                            </Typography>

                        </Stack>

                    </Paper>

                </Grid>

            ))}

        </Grid>

    );

};

export default SummaryCards;