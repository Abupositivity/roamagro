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
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from "@mui/material";

import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AgricultureOutlinedIcon from "@mui/icons-material/AgricultureOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ReportProblemOutlinedIcon from "@mui/icons-material/ReportProblemOutlined";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import {
    useDispatch,
    useSelector,
} from "react-redux";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import PageLayout from "../components/layout/PageLayout";

import DashboardHeader from "../components/dashboard/DashboardHeader";
import SummaryCards from "../components/dashboard/SummaryCards";
import QuickActions from "../components/dashboard/QuickActions";
import RecentProjects from "../components/dashboard/RecentProjects";
import MarketplacePreview from "../components/dashboard/MarketplacePreview";
import PriceTicker from "../components/dashboard/PriceTicker";

import AgriFeed from "../components/community/AgriFeed";
import ExtensionTipForm from "../components/community/ExtensionTipForm";

import { refreshDashboard } from "../redux/actions/dashboardActions";

const REFRESH_INTERVAL = 60 * 1000;
const STALE_TIME = 30 * 1000;

const AdminDashboard = () => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const {
        loading,
        error,
        dashboard,
        lastUpdated,
    } = useSelector((state) => state.dashboard);

    const refreshInProgress = useRef(false);
    const mountedRef = useRef(true);

    const [feedRefreshKey, setFeedRefreshKey] = useState(0);

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
                        type: "/admin",
                        silent,
                    })
                );
            } finally {
                if (mountedRef.current) {
                    refreshInProgress.current = false;
                }
            }
        },
        [dispatch]
    );

    useEffect(() => {
        mountedRef.current = true;

        const loadDashboard = async () => {
            if (refreshInProgress.current) {
                return;
            }

            refreshInProgress.current = true;

            try {
                await dispatch(
                    refreshDashboard({
                        type: "/admin",
                        silent: false,
                    })
                );
            } finally {
                if (mountedRef.current) {
                    refreshInProgress.current = false;
                }
            }
        };

        loadDashboard();

        return () => {
            mountedRef.current = false;
        };
    }, [dispatch]);

    useEffect(() => {
        const interval = window.setInterval(() => {
            refresh(true);
        }, REFRESH_INTERVAL);

        return () => {
            window.clearInterval(interval);
        };
    }, [refresh]);

    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState !== "visible") {
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
            if (event.detail?.route !== "/admin/dashboard") {
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

    const handleTipPublished = async () => {
        setFeedRefreshKey((previous) => previous + 1);
        await refresh(true);
    };

    if (loading && !dashboard) {
        return (
            <PageLayout>
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="60vh"
                >
                    <CircularProgress />
                </Box>
            </PageLayout>
        );
    }

    if (error && !dashboard) {
        return (
            <PageLayout>
                <Alert severity="error">
                    {error}
                </Alert>
            </PageLayout>
        );
    }

    const summary =
        dashboard?.admin?.summary ||
        dashboard?.summary ||
        {};

    const cards = [
        {
            title: t("Total Users"),
            value: summary.totalUsers || 0,
            icon: <PeopleOutlinedIcon />,
        },
        {
            title: t("Farmers"),
            value: summary.farmers || 0,
            icon: <AgricultureOutlinedIcon />,
        },
        {
            title: t("Extension Officers"),
            value: summary.extensionOfficers || 0,
            icon: <GroupsOutlinedIcon />,
        },
        {
            title: t("Farm Projects"),
            value: summary.totalProjects || 0,
            icon: <AgricultureOutlinedIcon />,
        },
        {
            title: t("Marketplace Listings"),
            value: summary.totalListings || 0,
            icon: <StorefrontOutlinedIcon />,
        },
        {
            title: t("Community Posts"),
            value: summary.communityPosts || 0,
            icon: <GroupsOutlinedIcon />,
        },
        {
            title: t("Published Tips"),
            value: summary.publishedTips || 0,
            icon: <LightbulbOutlinedIcon />,
        },
    ];

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
                        variant="h4"
                        fontWeight={700}
                    >
                        {t("Admin Dashboard")}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        mt={1}
                    >
                        {t("Manage and monitor RoamAgro activity.")}
                    </Typography>
                </Box>

                <Grid container spacing={2}>
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
                                                justifyContent: "center",
                                                width: 45,
                                                height: 45,
                                                borderRadius: 2,
                                                bgcolor: "primary.main",
                                                color: "white",
                                            }}
                                        >
                                            {card.icon}
                                        </Box>

                                        <Box>
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
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Card
                    elevation={2}
                    sx={{
                        borderRadius: 3,
                        borderLeft: "5px solid",
                        borderColor: "warning.main",
                    }}
                >
                    <CardContent>
                        <Stack
                            direction={{
                                xs: "column",
                                sm: "row",
                            }}
                            spacing={2}
                            justifyContent="space-between"
                            alignItems={{
                                xs: "stretch",
                                sm: "center",
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2,
                                        bgcolor: "warning.light",
                                        color: "warning.dark",
                                        flexShrink: 0,
                                    }}
                                >
                                    <ReportProblemOutlinedIcon />
                                </Box>

                                <Box>
                                    <Typography
                                        variant="h6"
                                        fontWeight={800}
                                    >
                                        {t("User Reports")}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ mt: 0.25 }}
                                    >
                                        {t(
                                            "Review reports, add admin notes and manage reported accounts."
                                        )}
                                    </Typography>
                                </Box>
                            </Stack>

                            <Button
                                variant="contained"
                                endIcon={
                                    <ArrowForwardIosIcon
                                        sx={{
                                            fontSize: "12px!important",
                                        }}
                                    />
                                }
                                onClick={() => navigate("/admin/reports")}
                                sx={{
                                    borderRadius: 2.5,
                                    alignSelf: {
                                        xs: "flex-start",
                                        sm: "auto",
                                    },
                                }}
                            >
                                {t("Manage Reports")}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
                
                <Card
                    elevation={2}
                    sx={{ borderRadius: 3 }}
                >
                    <CardContent>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                        >
                            {t("Recent Users")}
                        </Typography>

                        <Stack spacing={2}>
                            {dashboard?.admin?.latestUsers?.length ? (
                                dashboard.admin.latestUsers.map((user) => (
                                    <Box
                                        key={user._id}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                    >
                                        <Box>
                                            <Typography fontWeight={600}>
                                                {user.name}
                                            </Typography>

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                            >
                                                {user.email}
                                            </Typography>
                                        </Box>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            {user.role}
                                        </Typography>
                                    </Box>
                                ))
                            ) : (
                                <Typography color="text.secondary">
                                    {t("No users available.")}
                                </Typography>
                            )}
                        </Stack>
                    </CardContent>
                </Card>

                <ExtensionTipForm onPublished={handleTipPublished} />

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

                    <AgriFeed refreshKey={feedRefreshKey} />
                </Box>
            </Stack>
        </PageLayout>
    );
};

export default AdminDashboard;