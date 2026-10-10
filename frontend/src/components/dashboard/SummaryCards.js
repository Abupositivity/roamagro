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

    const projectCount = useSelector(
        state => state.farmProjects.projects?.length || 0
    );

    const marketplaceCount = useSelector(
        state => state.marketplace.listings?.length || 0
    );

    const priceCount = useSelector(
        state => state.priceIndex.priceIndex?.length || 0
    );

    const cards = [
        {
            title: t("Farm Projects"),
            value: projectCount,
            icon: <AgricultureIcon color="success" />
        },
        {
            title: t("Marketplace Listings"),
            value: marketplaceCount,
            icon: <StorefrontIcon color="primary" />
        },
        {
            title: t("Price Updates"),
            value: priceCount,
            icon: <PriceCheckIcon color="warning" />
        },
        {
            title: t("Revenue"),
            value: "₦0",
            icon: <AttachMoneyIcon color="secondary" />
        }
    ];

    return (
        <>
            <Typography
                variant="h6"
                fontWeight={700}
            >
                {t("Summary")}
            </Typography>

            <Grid container spacing={2}>
                {cards.map(card => (
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
        </>
    );
};

export default React.memo(SummaryCards);