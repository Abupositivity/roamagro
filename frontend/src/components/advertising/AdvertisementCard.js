import React from "react";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
} from "@mui/material";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useTranslation } from "react-i18next";

const AdvertisementCard = ({
    advertisement,
    onClick,
}) => {
    const { t } = useTranslation();

    if (!advertisement) {
        return null;
    }

    const {
        title,
        description,
        advertiserName,
        imageUrl,
        destinationUrl,
    } = advertisement;

    const handleClick = () => {
        if (!destinationUrl) {
            return;
        }

        // Do not make navigation depend on tracking success.
        onClick?.();

        window.open(
            destinationUrl,
            "_blank",
            "noopener,noreferrer"
        );
    };

    return (
        <Card
            variant="outlined"
            sx={{
                width: "100%",
                minWidth: 0,
                borderRadius: 3,
                overflow: "hidden",
                bgcolor: "background.paper",
            }}
        >
            <CardContent
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    "&:last-child": {
                        pb: { xs: 2, sm: 2.5 },
                    },
                }}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mb: 1.5 }}
                >
                    {t("Sponsored")}
                </Typography>

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
                >
                    <Box
                        component="img"
                        src={imageUrl}
                        alt={title}
                        loading="lazy"
                        sx={{
                            width: {
                                xs: "100%",
                                sm: 220,
                            },
                            height: {
                                xs: 180,
                                sm: 150,
                            },
                            objectFit: "cover",
                            borderRadius: 2,
                            flexShrink: 0,
                            bgcolor: "action.hover",
                        }}
                    />

                    <Box
                        sx={{
                            flex: 1,
                            minWidth: 0,
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="primary.main"
                            fontWeight={700}
                        >
                            {advertiserName}
                        </Typography>

                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ mt: 0.5, mb: 1 }}
                        >
                            {title}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                mb: 2,
                                overflowWrap: "anywhere",
                            }}
                        >
                            {description}
                        </Typography>

                        <Button
                            variant="contained"
                            color="primary"
                            endIcon={<OpenInNewIcon />}
                            onClick={handleClick}
                            sx={{
                                textTransform: "none",
                                fontWeight: 700,
                                borderRadius: 2,
                                minHeight: 44,
                            }}
                        >
                            {t("Learn More")}
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default AdvertisementCard;