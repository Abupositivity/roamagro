import React, { useEffect } from "react";
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

import { fetchDashboard } from "../redux/actions/dashboardActions";

const Dashboard = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        loading,
        error,
    } = useSelector((state) => state.dashboard);

    useEffect(() => {
        dispatch(fetchDashboard());
    }, [dispatch]);

    if (loading) {
        return (
            <PageLayout>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                >
                    <CircularProgress color="primary" />
                </Box>
            </PageLayout>
        );
    }

    if (error) {
        return (
            <PageLayout>
                <Alert severity="error">
                    {error}
                </Alert>
            </PageLayout>
        );
    }

    return (
        <PageLayout>
            <Stack spacing={3}>

                {/* Dashboard Header */}
                <DashboardHeader />

                {/* Summary Cards */}
                <SummaryCards />

                {/* Quick Actions */}
                <QuickActions />

                {/* Recent Farm Projects */}
                <RecentProjects />

                {/* Marketplace Preview */}
                <MarketplacePreview />

                {/* Latest Price Updates */}
                <PriceTicker />

                {/* Community Feed */}
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                    >
                        {t("Agri-Feed")}
                    </Typography>

                    <AgriFeed />
                </Box>

            </Stack>
        </PageLayout>
    );
};

export default Dashboard;