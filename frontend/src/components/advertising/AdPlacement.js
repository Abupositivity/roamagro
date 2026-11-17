import React, {
    useEffect,
    useRef,
    useState,
} from "react";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Chip,
    Grid,
} from "@mui/material";

import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";

import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import api from "../../services/api";
import AdvertisementCard from "./AdvertisementCard";

const DIRECT_PLACEMENTS = [
    "dashboard",
    "extension-dashboard",
];

const ADVERTISING_EMAIL = (
    process.env.REACT_APP_ADVERTISING_EMAIL || ""
).trim();

const AdPlacement = ({
    placement = "dashboard",
    children = null,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const containerRef = useRef(null);
    const trackedAdvertisementRef = useRef(null);

    const [advertisement, setAdvertisement] = useState(null);
    const [fetching, setFetching] = useState(false);
    const [fetchComplete, setFetchComplete] = useState(false);

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

    const isDirectPlacement =
        DIRECT_PLACEMENTS.includes(placement);

    const isPriceIndexFallback =
        placement === "price-index-fallback";

    useEffect(() => {
        let cancelled = false;

        trackedAdvertisementRef.current = null;

        setAdvertisement(null);
        setFetchComplete(false);
        setFetching(false);

        if (
            !adsEnabled ||
            !isDirectPlacement ||
            children
        ) {
            return undefined;
        }

        setFetching(true);

        const fetchAdvertisement = async () => {
            try {
                const response = await api.get(
                    `/advertisements/placement/${placement}`
                );

                if (cancelled) {
                    return;
                }

                setAdvertisement(
                    response.data?.data || null
                );
            } catch (requestError) {
                if (!cancelled) {
                    // Preserve fallback when no ad is available.
                    setAdvertisement(null);
                }
            } finally {
                if (!cancelled) {
                    setFetching(false);
                    setFetchComplete(true);
                }
            }
        };

        fetchAdvertisement();

        return () => {
            cancelled = true;
        };
    }, [
        adsEnabled,
        isDirectPlacement,
        placement,
        children,
    ]);

    useEffect(() => {
        if (
            !adsEnabled ||
            !advertisement?._id ||
            !containerRef.current
        ) {
            return undefined;
        }

        const advertisementId = advertisement._id;

        if (
            typeof IntersectionObserver === "undefined"
        ) {
            // Avoid counting an impression without
            // visibility confirmation.
            return undefined;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];

                if (
                    !entry?.isIntersecting ||
                    entry.intersectionRatio < 0.5
                ) {
                    return;
                }

                observer.disconnect();

                if (
                    trackedAdvertisementRef.current ===
                    advertisementId
                ) {
                    return;
                }

                trackedAdvertisementRef.current =
                    advertisementId;

                api.post(
                    `/advertisements/${advertisementId}/impression`
                ).catch(() => {
                    // Tracking must not affect the UI.
                });
            },
            {
                threshold: 0.5,
            }
        );

        observer.observe(containerRef.current);

        return () => {
            observer.disconnect();
        };
    }, [
        adsEnabled,
        advertisement,
    ]);

    const handleAdvertisementClick = () => {
        if (!advertisement?._id) {
            return;
        }

        api.post(
            `/advertisements/${advertisement._id}/click`
        ).catch(() => {
            // Do not interrupt the destination link.
        });
    };

    const handleAdvertisingInquiry = () => {
        if (!ADVERTISING_EMAIL) {
            return;
        }

        const subject = t(
            "Advertising Inquiry - RoamAgro"
        );

        const body = [
            t("Hello RoamAgro Team,"),
            "",
            t(
                "I am interested in advertising agricultural products or services on RoamAgro."
            ),
            "",
            t("Business Name:"),
            t("Product or Service:"),
            t("Target Location:"),
            t("Contact Information:"),
            "",
            t(
                "Please share information about advertising opportunities, pricing, and campaign requirements."
            ),
            "",
            t("Thank you."),
        ].join("\n");

        const mailtoUrl =
            `mailto:${ADVERTISING_EMAIL}` +
            `?subject=${encodeURIComponent(subject)}` +
            `&body=${encodeURIComponent(body)}`;

        window.location.href = mailtoUrl;
    };

    if (!adsEnabled) {
        return null;
    }

    // Preserve the existing ability to supply
    // custom sponsored content.
    if (children) {
        return (
            <Box
                component="aside"
                aria-label={t("Sponsored")}
                data-placement={placement}
                sx={{
                    width: "100%",
                    minWidth: 0,
                }}
            >
                <Card
                    variant="outlined"
                    sx={{
                        borderRadius: 3,
                        bgcolor: "background.paper",
                        overflow: "hidden",
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
    }

    // Only direct dashboard placements and
    // the dedicated Price Index fallback are supported.
    if (
        !isDirectPlacement &&
        !isPriceIndexFallback
    ) {
        return null;
    }

    // Avoid showing the fallback while
    // a direct advertisement is being fetched.
    if (
        isDirectPlacement &&
        (fetching || !fetchComplete)
    ) {
        return null;
    }

    // Display an eligible direct agricultural ad.
    if (
        isDirectPlacement &&
        advertisement
    ) {
        return (
            <Box
                ref={containerRef}
                component="aside"
                aria-label={t("Sponsored")}
                data-placement={placement}
                sx={{
                    width: "100%",
                    minWidth: 0,
                }}
            >
                <AdvertisementCard
                    advertisement={advertisement}
                    onClick={handleAdvertisementClick}
                />
            </Box>
        );
    }

    // Fallback:
    // Dashboard: Advertise with us + Premium.
    // Price Index: Premium only.
    return (
        <Box
            component="aside"
            aria-label={t("RoamAgro Promotions")}
            data-placement={placement}
            sx={{
                width: "100%",
                minWidth: 0,
            }}
        >
            <Grid container spacing={2}>
                {isDirectPlacement && (
                    <Grid item xs={12} md={6}>
                        <Card
                            variant="outlined"
                            sx={{
                                height: "100%",
                                borderRadius: 3,
                                overflow: "hidden",
                                bgcolor: "background.paper",
                            }}
                        >
                            <CardContent
                                sx={{
                                    p: { xs: 2, sm: 3 },
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    "&:last-child": {
                                        pb: { xs: 2, sm: 3 },
                                    },
                                }}
                            >
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    sx={{ mb: 1.5 }}
                                >
                                    <CampaignOutlinedIcon
                                        color="primary"
                                    />

                                    <Chip
                                        label={t(
                                            "Advertise on RoamAgro"
                                        )}
                                        color="primary"
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>

                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    gutterBottom
                                >
                                    {t(
                                        "Reach farmers and agribusiness customers"
                                    )}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2 }}
                                >
                                    {t(
                                        "Promote your agricultural products and services to farmers, buyers, and agribusinesses on RoamAgro."
                                    )}
                                </Typography>

                                <Box sx={{ flexGrow: 1 }} />

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={
                                        <EmailOutlinedIcon />
                                    }
                                    onClick={
                                        handleAdvertisingInquiry
                                    }
                                    disabled={
                                        !ADVERTISING_EMAIL
                                    }
                                    sx={{
                                        alignSelf: {
                                            xs: "stretch",
                                            sm: "flex-start",
                                        },
                                        textTransform: "none",
                                        fontWeight: 700,
                                        borderRadius: 2,
                                        minHeight: 44,
                                    }}
                                >
                                    {t("Advertise with us")}
                                </Button>

                                {!ADVERTISING_EMAIL && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ mt: 1 }}
                                    >
                                        {t(
                                            "Advertising inquiries are not yet configured."
                                        )}
                                    </Typography>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                <Grid
                    item
                    xs={12}
                    md={isDirectPlacement ? 6 : 12}
                >
                    <Card
                        variant="outlined"
                        sx={{
                            height: "100%",
                            borderRadius: 3,
                            overflow: "hidden",
                            borderColor: "primary.main",
                            background: (theme) =>
                                theme.palette.mode === "dark"
                                    ? "linear-gradient(135deg, #10271B 0%, #17221B 100%)"
                                    : "linear-gradient(135deg, #E8FFF1 0%, #FFFFFF 100%)",
                        }}
                    >
                        <CardContent
                            sx={{
                                p: { xs: 2, sm: 3 },
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                "&:last-child": {
                                    pb: { xs: 2, sm: 3 },
                                },
                            }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ mb: 1.5 }}
                            >
                                <WorkspacePremiumOutlinedIcon
                                    color="primary"
                                />

                                <Chip
                                    label={t(
                                        "RoamAgro Premium"
                                    )}
                                    color="primary"
                                    size="small"
                                    variant="outlined"
                                />
                            </Stack>

                            <Typography
                                variant="h6"
                                fontWeight={700}
                                gutterBottom
                            >
                                {t("Grow without limits")}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mb: 1.5 }}
                            >
                                {t(
                                    "Enjoy unlimited farm projects, unlimited marketplace listings, financial insights, and an ad-free experience."
                                )}
                            </Typography>

                            <Typography
                                variant="body2"
                                fontWeight={700}
                                color="primary.main"
                                sx={{ mb: 2 }}
                            >
                                {t("From ₦500/month")}
                            </Typography>

                            <Box sx={{ flexGrow: 1 }} />

                            <Button
                                variant="contained"
                                color="primary"
                                endIcon={<ArrowForwardIcon />}
                                onClick={() =>
                                    navigate("/subscription")
                                }
                                sx={{
                                    alignSelf: {
                                        xs: "stretch",
                                        sm: "flex-start",
                                    },
                                    textTransform: "none",
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    minHeight: 44,
                                }}
                            >
                                {t("Explore Premium")}
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
};

export default AdPlacement;