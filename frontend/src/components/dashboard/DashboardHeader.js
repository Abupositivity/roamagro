import React from "react";
import {
    Avatar,
    Box,
    Paper,
    Stack,
    Typography,
    Chip,
} from "@mui/material";

import WbSunnyOutlinedIcon from "@mui/icons-material/WbSunnyOutlined";
import CloudOutlinedIcon from "@mui/icons-material/CloudOutlined";
import NightsStayOutlinedIcon from "@mui/icons-material/NightsStayOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const DashboardHeader = () => {

    const { t } = useTranslation();

    const user = useSelector(
        (state) => state.auth.user
    );

    const hour = new Date().getHours();

    const greeting =
        hour < 12
            ? t("Good Morning")
            : hour < 17
            ? t("Good Afternoon")
            : t("Good Evening");

    const greetingIcon =
        hour < 12 ? (
            <WbSunnyOutlinedIcon color="warning" />
        ) : hour < 17 ? (
            <CloudOutlinedIcon color="primary" />
        ) : (
            <NightsStayOutlinedIcon color="secondary" />
        );

    return (

        <Paper
            elevation={2}
            sx={{
                p: 3,
                borderRadius: 3,
            }}
        >

            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
            >

                <Box>

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >

                        {greetingIcon}

                        <Typography
                            variant="h5"
                            fontWeight={700}
                        >
                            {greeting}
                        </Typography>

                    </Stack>

                    <Typography
                        variant="body1"
                        color="text.secondary"
                        mt={1}
                    >
                        {t("Welcome back")},
                        {" "}
                        <strong>
                            {user?.name || "Farmer"}
                        </strong>
                    </Typography>

                </Box>

                <Avatar
                    sx={{
                        width: 60,
                        height: 60,
                        bgcolor: "primary.main",
                        fontSize: 24,
                    }}
                >
                    {user?.name
                        ? user.name.charAt(0).toUpperCase()
                        : "R"}
                </Avatar>

            </Stack>

            <Stack
                direction={{
                    xs: "column",
                    sm: "row",
                }}
                spacing={2}
                mt={3}
            >

                <Chip
                    icon={<LocationOnOutlinedIcon />}
                    label={t("Northern Nigeria")}
                    color="primary"
                    variant="outlined"
                />

                <Chip
                    label={t("Weather integration coming soon")}
                    color="success"
                    variant="outlined"
                />

                <Chip
                    label={t("Market updates available")}
                    color="warning"
                    variant="outlined"
                />

            </Stack>

        </Paper>

    );
};

export default DashboardHeader;