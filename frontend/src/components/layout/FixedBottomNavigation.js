
import React, { memo, useCallback } from "react";
import {
    BottomNavigation,
    BottomNavigationAction,
    Paper,
    Box
} from "@mui/material";
import AgricultureIcon from "@mui/icons-material/Agriculture";
import StoreIcon from "@mui/icons-material/Store";
import PriceChangeIcon from "@mui/icons-material/PriceChange";
import GroupsIcon from "@mui/icons-material/Groups";
import {
    useNavigate,
    useLocation
} from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../../assets/images/logo.gif";

const routes = [
    "/dashboard",
    "/farm-projects",
    "/marketplace",
    "/price-index",
    "/community"
];

const FixedBottomNavigation = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    const activeRoute =
        routes.find(
            (route) =>
                location.pathname === route ||
                location.pathname.startsWith(`${route}/`)
        ) || false;

    const handleNavigation = useCallback(
        (route) => {
            if (!route) {
                return;
            }

            const isCurrentPage =
                location.pathname === route ||
                location.pathname.startsWith(`${route}/`);

            if (isCurrentPage) {
                window.scrollTo({
                    top: 0,
                    behavior: window.matchMedia(
                        "(prefers-reduced-motion: reduce)"
                    ).matches
                        ? "auto"
                        : "smooth"
                });

                window.dispatchEvent(
                    new CustomEvent("roamagro:refresh-page", {
                        detail: {
                            route,
                            timestamp: Date.now()
                        }
                    })
                );

                return;
            }

            navigate(route);
        },
        [location.pathname, navigate]
    );

    const getIconContainerSx = (route) => ({
        width: 38,
        height: 32,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 2,
        backgroundColor:
            activeRoute === route
                ? "rgba(0, 191, 99, 0.13)"
                : "transparent",
        transition: "background-color 0.2s ease",
        "& svg": {
            fontSize: {
                xs: 22,
                sm: 25
            },
            color:
                activeRoute === route
                    ? "primary.main"
                    : "text.secondary"
        }
    });

    const actionSx = {
        minWidth: 0,
        maxWidth: "none",
        flex: "1 1 0",
        px: 0,
        pt: 0.5,
        pb: 0.5,
        height: 68,
        color: "text.secondary",
        overflow: "hidden",
        "& .MuiBottomNavigationAction-label": {
            display: "block",
            width: "100%",
            maxWidth: "100%",
            fontSize: {
                xs: "0.62rem",
                sm: "0.7rem"
            },
            lineHeight: 1.2,
            fontWeight: 500,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            transition: "font-weight 0.2s ease"
        },
        "&.Mui-selected": {
            color: "primary.main"
        },
        "&.Mui-selected .MuiBottomNavigationAction-label": {
            fontSize: {
                xs: "0.62rem",
                sm: "0.7rem"
            },
            fontWeight: 700
        },
        "&:focus-visible": {
            outline: "2px solid",
            outlineColor: "primary.main",
            outlineOffset: "-3px"
        }
    };

    const navItems = [
        {
            route: routes[0],
            label: t("Home"),
            icon: (
                <Box
                    component="img"
                    src={logo}
                    alt=""
                    aria-hidden="true"
                    sx={{
                        width: 25,
                        height: 25,
                        objectFit: "contain"
                    }}
                />
            )
        },
        {
            route: routes[1],
            label: t("Farm Projects"),
            icon: <AgricultureIcon />
        },
        {
            route: routes[2],
            label: t("Marketplace"),
            icon: <StoreIcon />
        },
        {
            route: routes[3],
            label: t("Price Index"),
            icon: <PriceChangeIcon />
        },
        {
            route: routes[4],
            label: t("Community"),
            icon: <GroupsIcon />
        }
    ];

    return (
        <Paper
            component="nav"
            aria-label={t("Main navigation")}
            elevation={8}
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: (theme) => theme.zIndex.appBar,
                borderTop: "1px solid",
                borderColor: "divider",
                borderRadius: {
                    xs: "12px 12px 0 0",
                    sm: "14px 14px 0 0"
                },
                overflow: "hidden",
                backgroundColor: "background.paper",
                pb: "env(safe-area-inset-bottom, 0px)"
            }}
        >
            <BottomNavigation
                value={activeRoute}
                onChange={(event, value) => handleNavigation(value)}
                showLabels
                sx={{
                    height: 68,
                    width: "100%",
                    backgroundColor: "background.paper",
                    "& .MuiBottomNavigationAction-root": actionSx
                }}
            >
                {navItems.map((item) => (
                    <BottomNavigationAction
                        key={item.route}
                        label={item.label}
                        value={item.route}
                        aria-label={item.label}
                        icon={
                            <Box sx={getIconContainerSx(item.route)}>
                                {item.icon}
                            </Box>
                        }
                    />
                ))}
            </BottomNavigation>
        </Paper>
    );
};

export default memo(FixedBottomNavigation);