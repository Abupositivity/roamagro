import React from "react";

import {
    Grid,
    Card,
    CardActionArea,
    CardContent,
    Typography,
    Stack,
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

    const actions = [

        {
            title: t("New Farm"),
            icon: <AgricultureIcon fontSize="large" color="success" />,
            route: "/farm-projects"
        },

        {
            title: t("Sell Produce"),
            icon: <StorefrontIcon fontSize="large" color="primary" />,
            route: "/marketplace"
        },

        {
            title: t("Update Price"),
            icon: <PriceCheckIcon fontSize="large" color="warning" />,
            route: "/price-index"
        },

        {
            title: t("Community"),
            icon: <ForumIcon fontSize="large" color="secondary" />,
            route: "/community"
        }

    ];

    return (

        <>

            <Typography
                variant="h6"
                fontWeight={700}
            >
                {t("Quick Actions")}
            </Typography>

            <Grid
                container
                spacing={2}
            >

                {actions.map((action) => (

                    <Grid
                        item
                        xs={6}
                        md={3}
                        key={action.title}
                    >

                        <Card
                            elevation={2}
                            sx={{
                                borderRadius: 3
                            }}
                        >

                            <CardActionArea
                                onClick={() =>
                                    navigate(action.route)
                                }
                            >

                                <CardContent>

                                    <Stack
                                        spacing={2}
                                        alignItems="center"
                                    >

                                        {action.icon}

                                        <Typography
                                            align="center"
                                            fontWeight={600}
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

export default QuickActions;