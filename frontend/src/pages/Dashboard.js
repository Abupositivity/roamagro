import React, { useCallback, useEffect, useRef } from "react";
import { Box, Stack, Typography, CircularProgress, Alert } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import PageLayout from "../components/layout/PageLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import SummaryCards from "../components/dashboard/SummaryCards";
import QuickActions from "../components/dashboard/QuickActions";
import RecentProjects from "../components/dashboard/RecentProjects";
import MarketplacePreview from "../components/dashboard/MarketplacePreview";
import PriceTicker from "../components/dashboard/PriceTicker";
import AgriFeed from "../components/community/AgriFeed";
import { refreshDashboard } from "../redux/actions/dashboardActions";

const REFRESH_INTERVAL = 60 * 1000;
const STALE_TIME = 30 * 1000;

const Dashboard = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const { loading, error, dashboard, lastUpdated } = useSelector(
        (state) => state.dashboard
    );
    const refreshInProgress = useRef(false);

    const refresh = useCallback(
        async (silent = true) => {
            if (
                refreshInProgress.current ||
                document.visibilityState !== "visible"
            ) {
                return;
            }

            refreshInProgress.current = true;

            try {
                await dispatch(refreshDashboard({ silent }));
            } finally {
                refreshInProgress.current = false;
            }
        },
        [dispatch]
    );

    useEffect(() => {
        refresh(false);
    }, [refresh]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            refresh(true);
        }, REFRESH_INTERVAL);

        return () => window.clearInterval(interval);
    }, [refresh]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState !== "visible") {
                return;
            }

            const updatedAt = lastUpdated || 0;

            if (!updatedAt || Date.now() - updatedAt >= STALE_TIME) {
                refresh(true);
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [lastUpdated, refresh]);

    useEffect(() => {
        const handleRefresh = (event) => {
            if (event.detail?.route !== "/dashboard") {
                return;
            }

            refresh(true);
        };

        window.addEventListener(
            "roamagro:refresh-page",
            handleRefresh
        );

        return () => {
            window.removeEventListener(
                "roamagro:refresh-page",
                handleRefresh
            );
        };
    }, [refresh]);

    if (loading && !dashboard) {
        return (
            <PageLayout>
                <Stack
                    alignItems="center"
                    justifyContent="center"
                    sx={{ minHeight: "50vh" }}
                >
                    <CircularProgress />
                </Stack>
            </PageLayout>
        );
    }

    if (error && !dashboard) {
        return (
            <PageLayout>
                <Alert severity="error">{error}</Alert>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Stack spacing={3}>
                <DashboardHeader />
                <SummaryCards />
                <QuickActions />
                <RecentProjects />
                <MarketplacePreview />
                <PriceTicker />
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                    >
                        {t("Agri-Feed")}🌱
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mb={3}
                    >
                        {t(
                            "Daily agricultural tips and best practices shared by agricultural experts."
                        )}
                    </Typography>
                    <AgriFeed />
                </Box>
            </Stack>
        </PageLayout>
    );
};

export default Dashboard;