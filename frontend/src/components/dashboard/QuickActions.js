import React, { useMemo } from "react";

import {
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Stack,
    Box,
} from "@mui/material";

import AgricultureIcon from "@mui/icons-material/Agriculture";
import StorefrontIcon from "@mui/icons-material/Storefront";
import PriceCheckIcon from "@mui/icons-material/PriceCheck";
import ForumIcon from "@mui/icons-material/Forum";

import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const QuickActions = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const actions = useMemo(
        () => [
            {
                title: t("New Farm Project"),
                icon: (
                    <AgricultureIcon
                        fontSize="large"
                        color="success"
                    />
                ),
                route: "/farm-projects",
            },
            {
                title: t("Sell/Buy Produce"),
                icon: (
                    <StorefrontIcon
                        fontSize="large"
                        color="primary"
                    />
                ),
                route: "/marketplace",
            },
            {
                title: t("Update Price"),
                icon: (
                    <PriceCheckIcon
                        fontSize="large"
                        color="warning"
                    />
                ),
                route: "/price-index",
            },
            {
                title: t("Community Discussions"),
                icon: (
                    <ForumIcon
                        fontSize="large"
                        color="secondary"
                    />
                ),
                route: "/community",
            },
        ],
        [t]
    );

    return (
        <>
            <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 1 }}
            >
                {t("Quick Actions")}
            </Typography>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                {actions.map((action) => (
                    <Grid
                        item
                        xs={6}
                        md={3}
                        key={action.route}
                        sx={{ display: "flex" }}
                    >
                        <Card
                            elevation={2}
                            sx={{
                                width: "100%",
                                height: "100%",
                                borderRadius: 3,
                                display: "flex",
                            }}
                        >
                            <CardActionArea
                                onClick={() =>
                                    navigate(action.route)
                                }
                                sx={{
                                    display: "flex",
                                    alignItems: "stretch",
                                    width: "100%",
                                    height: "100%",
                                }}
                            >
                                <CardContent
                                    sx={{
                                        width: "100%",
                                        p: {
                                            xs: 1.5,
                                            sm: 2,
                                        },
                                        "&:last-child": {
                                            pb: {
                                                xs: 1.5,
                                                sm: 2,
                                            },
                                        },
                                    }}
                                >
                                    <Stack
                                        spacing={{
                                            xs: 1,
                                            sm: 2,
                                        }}
                                        alignItems="center"
                                        justifyContent="center"
                                        sx={{
                                            height: "100%",
                                            minHeight: {
                                                xs: 100,
                                                sm: 120,
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                            }}
                                        >
                                            {action.icon}
                                        </Box>

                                        <Typography
                                            align="center"
                                            fontWeight={600}
                                            sx={{
                                                fontSize: {
                                                    xs: "0.8rem",
                                                    sm: "0.95rem",
                                                },
                                                lineHeight: 1.4,
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {action.title}
                                        </Typography>
                                    </Stack>
                                </CardContent>
                            </CardActionArea>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </>
    );
};

export default React.memo(QuickActions);