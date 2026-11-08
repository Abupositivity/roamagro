import React from "react";

import {
    Grid,
    Card,
    CardContent,
    Typography,
    Stack,
} from "@mui/material";

import Inventory2Icon from "@mui/icons-material/Inventory2";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SellIcon from "@mui/icons-material/Sell";

import { useTranslation } from "react-i18next";

const SummaryCard = ({
    title,
    value,
    icon,
}) => (
    <Card
        elevation={2}
        sx={{
            height: "100%",
            borderRadius: 3,
            minWidth: 0,
        }}
    >
        <CardContent
            sx={{
                p: {
                    xs: 1,
                    sm: 2,
                },
                "&:last-child": {
                    pb: {
                        xs: 1,
                        sm: 2,
                    },
                },
            }}
        >
            <Stack
                spacing={{
                    xs: 0.75,
                    sm: 1,
                }}
                alignItems="center"
                justifyContent="center"
                sx={{
                    minHeight: {
                        xs: 90,
                        sm: 110,
                    },
                    minWidth: 0,
                }}
            >
                {icon}

                <Typography
                    fontWeight={700}
                    align="center"
                    sx={{
                        fontSize: {
                            xs: "1.25rem",
                            sm: "1.75rem",
                            md: "2rem",
                        },
                        lineHeight: 1.2,
                        overflowWrap: "anywhere",
                        fontVariantNumeric: "tabular-nums",
                    }}
                >
                    {value}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                    sx={{
                        fontSize: {
                            xs: "0.7rem",
                            sm: "0.875rem",
                        },
                        lineHeight: 1.3,
                        overflowWrap: "anywhere",
                    }}
                >
                    {title}
                </Typography>
            </Stack>
        </CardContent>
    </Card>
);

const MarketplaceSummaryCards = ({
    listings = [],
}) => {
    const { t } = useTranslation();

    const total = listings.length;

    const available = listings.filter(
        (item) => item.available
    ).length;

    const sold = total - available;

    return (
        <Grid
            container
            spacing={{
                xs: 1,
                sm: 2,
            }}
            sx={{ mb: 3 }}
        >
            <Grid item xs={4} md={3}>
                <SummaryCard
                    title={t("Total Listings")}
                    value={total}
                    icon={
                        <Inventory2Icon
                            color="primary"
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    sm: 32,
                                },
                            }}
                        />
                    }
                />
            </Grid>

            <Grid item xs={4} md={3}>
                <SummaryCard
                    title={t("Available")}
                    value={available}
                    icon={
                        <CheckCircleIcon
                            color="success"
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    sm: 32,
                                },
                            }}
                        />
                    }
                />
            </Grid>

            <Grid item xs={4} md={3}>
                <SummaryCard
                    title={t("Sold")}
                    value={sold}
                    icon={
                        <SellIcon
                            color="error"
                            sx={{
                                fontSize: {
                                    xs: 24,
                                    sm: 32,
                                },
                            }}
                        />
                    }
                />
            </Grid>
        </Grid>
    );
};

export default MarketplaceSummaryCards;