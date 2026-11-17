import React from "react";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
    Chip,
} from "@mui/material";

import WorkspacePremiumOutlinedIcon from
    "@mui/icons-material/WorkspacePremiumOutlined";
import ArrowForwardIcon from
    "@mui/icons-material/ArrowForward";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const PremiumPromotion = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Box
            component="aside"
            aria-label={t("Upgrade to Premium")}
            sx={{ width: "100%", minWidth: 0 }}
        >
            <Card
                variant="outlined"
                sx={{
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
                        "&:last-child": {
                            pb: { xs: 2, sm: 3 },
                        },
                    }}
                >
                    <Stack
                        direction={{
                            xs: "column",
                            sm: "row",
                        }}
                        spacing={2}
                        alignItems={{
                            xs: "stretch",
                            sm: "center",
                        }}
                        justifyContent="space-between"
                    >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
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
                                    label={t("RoamAgro Premium")}
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
                            >
                                {t("From ₦500/month")}
                            </Typography>
                        </Box>

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
                                    sm: "center",
                                },
                                flexShrink: 0,
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 2,
                                minHeight: 44,
                                px: 2.5,
                            }}
                        >
                            {t("Explore Premium")}
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    );
};

export default PremiumPromotion;