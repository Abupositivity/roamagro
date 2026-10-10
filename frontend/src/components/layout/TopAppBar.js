
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Badge,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button
} from "@mui/material";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../redux/actions/authActions";
import { fetchUnreadCount } from "../../redux/actions/notificationActions";

const POLL_INTERVAL = 60 * 1000;

const TopAppBar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [anchorEl, setAnchorEl] = useState(null);
    const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

    const lastFetchAt = useRef(0);
    const requestInProgress = useRef(false);

    const user = useSelector((state) => state.auth?.user);
    const unreadCount = useSelector(
        (state) => state.notifications?.unreadCount || 0
    );

    const userKey = user?._id || user?.id || user?.email || (
        user ? "authenticated" : null
    );

    const open = Boolean(anchorEl);

    const refreshUnreadCount = useCallback(
        async (force = false) => {
            if (
                !userKey ||
                document.visibilityState !== "visible" ||
                requestInProgress.current
            ) {
                return;
            }

            const elapsed = Date.now() - lastFetchAt.current;

            if (!force && elapsed < POLL_INTERVAL) {
                return;
            }

            requestInProgress.current = true;

            try {
                const result = await dispatch(fetchUnreadCount());

                if (result?.success) {
                    lastFetchAt.current = Date.now();
                }
            } catch {
                // A later polling cycle can retry if the request fails.
            } finally {
                requestInProgress.current = false;
            }
        },
        [dispatch, userKey]
    );

    useEffect(() => {
        if (!userKey) {
            lastFetchAt.current = 0;
            return undefined;
        }

        refreshUnreadCount(true);

        const intervalId = window.setInterval(() => {
            refreshUnreadCount();
        }, POLL_INTERVAL);

        const handleVisibilityChange = () => {
            if (document.visibilityState !== "visible") {
                return;
            }

            const elapsed = Date.now() - lastFetchAt.current;

            if (!lastFetchAt.current || elapsed >= POLL_INTERVAL) {
                refreshUnreadCount(true);
            }
        };

        document.addEventListener(
            "visibilitychange",
            handleVisibilityChange
        );

        return () => {
            window.clearInterval(intervalId);
            document.removeEventListener(
                "visibilitychange",
                handleVisibilityChange
            );
        };
    }, [userKey, refreshUnreadCount]);

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogoutOpen = () => {
        handleClose();
        setLogoutDialogOpen(true);
    };

    const handleLogoutCancel = () => {
        setLogoutDialogOpen(false);
    };

    const handleLogoutConfirm = () => {
        setLogoutDialogOpen(false);
        dispatch(logout());
        navigate("/");
    };

    const handleNotifications = () => {
        navigate("/notifications");
    };

    const handleNavigate = (path) => {
        handleClose();
        navigate(path);
    };

    return (
        <>
            <AppBar
                position="fixed"
                elevation={1}
                color="inherit"
                sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    zIndex: (theme) => theme.zIndex.drawer + 1
                }}
            >
                <Toolbar
                    disableGutters
                    sx={{
                        minHeight: {
                            xs: "56px",
                            sm: "64px"
                        },
                        px: {
                            xs: 1,
                            sm: 2
                        },
                        gap: {
                            xs: 0.5,
                            sm: 1
                        }
                    }}
                >
                    <Typography
                        variant="h6"
                        noWrap
                        sx={{
                            flexGrow: 1,
                            flexShrink: 1,
                            minWidth: 0,
                            fontSize: {
                                xs: "1.05rem",
                                sm: "1.25rem"
                            },
                            fontWeight: 700,
                            color: "primary.main"
                        }}
                    >
                        RoamAgro
                    </Typography>

                    <Tooltip title={t("Notifications")}>
                        <IconButton
                            color="inherit"
                            onClick={handleNotifications}
                            aria-label={t("Notifications")}
                            sx={{
                                width: 44,
                                height: 44,
                                flexShrink: 0
                            }}
                        >
                            <Badge
                                badgeContent={
                                    unreadCount > 99 ? "99+" : unreadCount
                                }
                                color="error"
                                invisible={unreadCount === 0}
                            >
                                <NotificationsNoneIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={t("Account")}>
                        <IconButton
                            id="account-menu-button"
                            onClick={handleOpen}
                            aria-label={t("Account")}
                            aria-controls={open ? "account-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? "true" : undefined}
                            sx={{
                                width: 44,
                                height: 44,
                                flexShrink: 0
                            }}
                        >
                            <Avatar
                                src={user?.profilePhoto || undefined}
                                sx={{
                                    width: {
                                        xs: 32,
                                        sm: 36
                                    },
                                    height: {
                                        xs: 32,
                                        sm: 36
                                    },
                                    bgcolor: "primary.main"
                                }}
                            >
                                {user?.name ? (
                                    user.name.charAt(0).toUpperCase()
                                ) : (
                                    <AccountCircleIcon />
                                )}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        id="account-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        slotProps={{
                            paper: {
                                sx: {
                                    minWidth: 190,
                                    maxWidth: "calc(100vw - 24px)"
                                }
                            }
                        }}
                        MenuListProps={{
                            "aria-labelledby": "account-menu-button"
                        }}
                    >
                        <MenuItem
                            disabled
                            sx={{
                                fontWeight: 600,
                                opacity: 1
                            }}
                        >
                            {user?.name || t("Profile")}
                        </MenuItem>

                        <MenuItem onClick={() => handleNavigate("/profile")}>
                            {t("Profile")}
                        </MenuItem>

                        <MenuItem onClick={() => handleNavigate("/financial")}>
                            <AccountBalanceWalletIcon
                                fontSize="small"
                                sx={{ mr: 1 }}
                            />
                            {t("Financial Tracking")}
                        </MenuItem>

                        <MenuItem onClick={() => handleNavigate("/settings")}>
                            <SettingsIcon
                                fontSize="small"
                                sx={{ mr: 1 }}
                            />
                            {t("Settings")}
                        </MenuItem>

                        <MenuItem onClick={handleLogoutOpen}>
                            <LogoutIcon
                                fontSize="small"
                                sx={{ mr: 1 }}
                            />
                            {t("Logout")}
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Dialog
                open={logoutDialogOpen}
                onClose={handleLogoutCancel}
                fullWidth
                maxWidth="xs"
                slotProps={{
                    paper: {
                        sx: {
                            width: {
                                xs: "calc(100% - 32px)",
                                sm: "100%"
                            },
                            m: {
                                xs: 2,
                                sm: 3
                            }
                        }
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {t("Logout")}
                </DialogTitle>

                <DialogContent>
                    <Typography color="text.secondary">
                        {t(
                            "Are you sure you want to log out of your RoamAgro account?"
                        )}
                    </Typography>
                </DialogContent>

                <DialogActions
                    sx={{
                        p: 2,
                        gap: 1,
                        flexWrap: "wrap"
                    }}
                >
                    <Button
                        onClick={handleLogoutCancel}
                        variant="outlined"
                    >
                        {t("Cancel")}
                    </Button>

                    <Button
                        onClick={handleLogoutConfirm}
                        variant="contained"
                        color="error"
                        startIcon={<LogoutIcon />}
                    >
                        {t("Logout")}
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default memo(TopAppBar);