import React, { useEffect, useState } from "react";
import {
    Avatar,
    Box,
    CircularProgress,
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

import weatherService from "../../services/weatherService";

const DashboardHeader = () => {

    const { t } = useTranslation();

    const user = useSelector(
        (state) => state.auth.user
    );

    const [weather, setWeather] = useState(null);
    const [weatherLoading, setWeatherLoading] =
        useState(true);

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

    useEffect(() => {

        let mounted = true;

        const loadWeather = async () => {

            try {

                const data =
                    await weatherService.getWeather(
                        user?.location
                    );

                if (mounted) {
                    setWeather(data);
                }

            } catch (error) {

                console.warn(
                    "Weather unavailable:",
                    error.message
                );

            } finally {

                if (mounted) {
                    setWeatherLoading(false);
                }

            }

        };

        loadWeather();

        return () => {
            mounted = false;
        };

    }, [user?.location]);

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
                        {t("Welcome back")},{" "}
                        <strong>
                            {user?.name || t("Farmer")}
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
                        ? user.name
                            .charAt(0)
                            .toUpperCase()
                        : "R"}
                </Avatar>

            </Stack>

            <Box mt={3}>

                {weatherLoading ? (

                    <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                    >

                        <CircularProgress
                            size={20}
                        />

                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t("Loading weather...")}
                        </Typography>

                    </Stack>

                ) : weather ? (

                    <Box>

                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                            alignItems={{
                                xs: "flex-start",
                                sm: "center",
                            }}
                        >

                            <Chip
                                icon={
                                    <LocationOnOutlinedIcon />
                                }
                                label={
                                    weather.country
                                        ? `${weather.location}, ${weather.country}`
                                        : weather.location
                                }
                                color="success"
                                variant="outlined"
                            />

                            <Typography
                                variant="h6"
                                fontWeight={700}
                            >
                                {Math.round(
                                    weather.temperature
                                )}°C
                            </Typography>

                            <Typography
                                color="text.secondary"
                            >
                                {t(
                                    weather.condition
                                )}
                            </Typography>

                        </Stack>

                        {weather.forecast?.length > 0 && (

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row",
                                }}
                                spacing={1}
                                mt={2}
                            >

                                {weather.forecast.map(
                                    (day) => (

                                        <Chip
                                            key={day.date}
                                            label={`${new Date(
                                                day.date
                                            ).toLocaleDateString(
                                                undefined,
                                                {
                                                    weekday:
                                                        "short",
                                                }
                                            )}: ${Math.round(
                                                day.maxTemperature
                                            )}°/${Math.round(
                                                day.minTemperature
                                            )}°C`}
                                            variant="outlined"
                                            size="small"
                                        />

                                    )
                                )}

                            </Stack>

                        )}

                    </Box>

                ) : (

                    <Chip
                        label={t(
                            "Weather unavailable"
                        )}
                        color="default"
                        variant="outlined"
                    />

                )}

            </Box>

        </Paper>

    );
};

export default DashboardHeader;