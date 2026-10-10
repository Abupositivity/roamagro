import React, { useMemo } from "react";
import {
    Paper,
    Typography,
    Stack,
    Button,
    Divider,
} from "@mui/material";
import StorefrontIcon from "@mui/icons-material/Storefront";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const MarketplacePreview = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const listings = useSelector(
        state => state.marketplace.listings || []
    );

    const recentListings = useMemo(
        () => listings.slice(0, 5),
        [listings]
    );

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: 3
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                mb={2}
            >
                <Typography
                    variant="h6"
                    fontWeight={700}
                >
                    {t("Recent Listings")}
                </Typography>

                <Button
                    size="small"
                    onClick={() => navigate("/marketplace")}
                >
                    {t("See All")}
                </Button>
            </Stack>

            {recentListings.length === 0 ? (
                <Typography color="text.secondary">
                    {t("No marketplace listings")}
                </Typography>
            ) : (
                recentListings.map(item => (
                    <React.Fragment key={item._id}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            py={1}
                        >
                            <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                            >
                                <StorefrontIcon color="primary" />

                                <Typography>
                                    {item.title}
                                </Typography>
                            </Stack>

                            <Typography fontWeight={700}>
                                ₦
                                {typeof item.price === "number"
                                    ? item.price.toLocaleString()
                                    : "0"}
                            </Typography>
                        </Stack>

                        <Divider />
                    </React.Fragment>
                ))
            )}
        </Paper>
    );
};

export default React.memo(MarketplacePreview);