import React from "react";

import {
    Box,
    Card,
    CardContent,
    Typography,
} from "@mui/material";

import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

const AdPlacement = ({
    placement = "dashboard",
    children = null,
}) => {
    const { t } = useTranslation();

    const isAuthenticated = useSelector(
        (state) => state.auth.isAuthenticated
    );

    const {
        data: subscription,
        loaded,
        loading,
        error,
    } = useSelector(
        (state) => state.subscription
    );

    const adsEnabled =
        isAuthenticated &&
        loaded &&
        !loading &&
        !error &&
        subscription?.features?.adsEnabled === true;

    if (!adsEnabled || !children) {
        return null;
    }

    return (
        <Box
            component="aside"
            aria-label={t("Sponsored")}
            data-placement={placement}
            sx={{
                width: "100%",
            }}
        >
            <Card
                variant="outlined"
                sx={{
                    borderRadius: 2,
                    bgcolor: "background.paper",
                }}
            >
                <CardContent>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: "block",
                            mb: 1,
                        }}
                    >
                        {t("Sponsored")}
                    </Typography>

                    {children}
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdPlacement;