import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import PageLayout from "../components/layout/PageLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import QuickActions from "../components/dashboard/QuickActions";
import RecentProjects from "../components/dashboard/RecentProjects";
import MarketplacePreview from "../components/dashboard/MarketplacePreview";
import PriceTicker from "../components/dashboard/PriceTicker";

import AgriFeed from "../components/community/AgriFeed";
import ExtensionTipForm from "../components/community/ExtensionTipForm";

import {
    refreshDashboard,
} from "../redux/actions/dashboardActions";

const REFRESH_INTERVAL = 60 * 1000;
const STALE_TIME = 30 * 1000;

const ExtensionDashboard = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const {
        loading,
        error,
        dashboard,
        lastUpdated,
    } = useSelector(
        (state) => state.dashboard
    );

    const refreshInProgress = useRef(false);

    const [
        feedRefreshKey,
        setFeedRefreshKey,
    ] = useState(0);

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
                await dispatch(
                    refreshDashboard({
                        type: "/extension",
                        silent,
                    })
                );
            } finally {
                refreshInProgress.current = false;
            }
        },
        [dispatch]
    );

    useEffect(() => {
        refresh(true);
    }, [refresh]);

    useEffect(() => {
        const interval = window.setInterval(
            () => refresh(true),
            REFRESH_INTERVAL
        );

        return () => {
            window.clearInterval(interval);
        };
    }, [refresh]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (
                document.visibilityState !== "visible"
            ) {
                return;
            }

            const updatedAt = lastUpdated || 0;

            if (
                !updatedAt ||
                Date.now() - updatedAt >= STALE_TIME
            ) {
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
            if (
                event.detail?.route ===
                "/extension/dashboard"
            ) {
                refresh(true);
            }
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

    const handleTipPublished = async () => {
        setFeedRefreshKey(
            (previous) => previous + 1
        );

        await refresh(true);
    };

    const handleRetry = () => {
        refresh(true);
    };

    const summary =
        dashboard?.extension?.summary ||
        dashboard?.summary ||
        {};

    const cards = [
        {
            title: t("Total Farmers"),
            value: summary.totalFarmers ?? 0,
            icon: <GroupsOutlinedIcon />,
        },
        {
            title: t("Community Posts"),
            value: summary.communityPosts ?? 0,
            icon: <ForumOutlinedIcon />,
        },
        {
            title: t("Published Tips"),
            value: summary.publishedTips ?? 0,
            icon: <LightbulbOutlinedIcon />,
        },
    ];

    return (
        <PageLayout>
            <Stack spacing={3}>
                {error && (
                    <Alert
                        severity="warning"
                        action={
                            <Button
                                color="inherit"
                                size="small"
                                startIcon={<RefreshIcon />}
                                disabled={loading}
                                onClick={handleRetry}
                            >
                                {t("Retry")}
                            </Button>
                        }
                    >
                        {t(
                            "Some dashboard information could not be updated."
                        )}
                    </Alert>
                )}

                <DashboardHeader />
                <QuickActions />
                <RecentProjects />
                <MarketplacePreview />
                <PriceTicker />

                <Box>
                    <Typography
                        variant="h5"
                        fontWeight={700}
                    >
                        {t(
                            "Extension Officer Dashboard"
                        )}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                    >
                        {t(
                            "Support farmers, share agricultural knowledge, and monitor activities."
                        )}
                    </Typography>
                </Box>

                <Grid
                    container
                    spacing={{ xs: 1.5, sm: 2 }}
                >
                    {cards.map((card) => (
                        <Grid
                            item
                            xs={12}
                            sm={6}
                            md={4}
                            key={card.title}
                        >
                            <Card
                                elevation={2}
                                sx={{
                                    height: "100%",
                                    borderRadius: 3,
                                }}
                            >
                                <CardContent>
                                    <Stack
                                        direction="row"
                                        spacing={2}
                                        alignItems="center"
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent:
                                                    "center",
                                                width: 45,
                                                height: 45,
                                                flexShrink: 0,
                                                borderRadius: 2,
                                                bgcolor:
                                                    "primary.main",
                                                color: "white",
                                            }}
                                        >
                                            {card.icon}
                                        </Box>

                                        <Box
                                            sx={{
                                                minWidth: 0,
                                            }}
                                        >
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    overflowWrap:
                                                        "anywhere",
                                                }}
                                            >
                                                {card.title}
                                            </Typography>

                                            <Typography
                                                variant="h5"
                                                fontWeight={700}
                                            >
                                                {card.value}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <ExtensionTipForm
                    onPublished={
                        handleTipPublished
                    }
                />

                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                    >
                        {t("Agri-Feed")} 🌱
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

                    <AgriFeed
                        refreshKey={
                            feedRefreshKey
                        }
                    />
                </Box>
            </Stack>
        </PageLayout>
    );
};

export default ExtensionDashboard;