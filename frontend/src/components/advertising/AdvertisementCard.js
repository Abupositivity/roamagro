import React, { useState } from "react";

import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Stack,
} from "@mui/material";

import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";

import { useTranslation } from "react-i18next";

import {
    getFeedImage,
    getFeedImageSrcSet,
} from "../../utils/cloudinaryImage";

const ADVERTISEMENT_IMAGE_WIDTH = 480;

const ADVERTISEMENT_IMAGE_SIZES = [
    "auto",
    "(max-width: 599px) 90vw",
    "220px",
].join(", ");

const ADVERTISEMENT_IMAGE_STYLES = {
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
    display: "block",
};

const AdvertisementImage = ({
    source,
    alt,
}) => {
    const { t } = useTranslation();

    const [useOriginal, setUseOriginal] =
        useState(false);

    const [imageFailed, setImageFailed] =
        useState(false);

    const optimizedSource = getFeedImage(
        source,
        ADVERTISEMENT_IMAGE_WIDTH
    );

    const imageSource = useOriginal
        ? source
        : optimizedSource;

    const srcSet = useOriginal
        ? undefined
        : getFeedImageSrcSet(source);

    const handleImageError = () => {
        if (
            !useOriginal &&
            (optimizedSource !== source || srcSet)
        ) {
            setUseOriginal(true);
            return;
        }

        setImageFailed(true);
    };

    if (!source || imageFailed) {
        return (
            <Box
                role="img"
                aria-label={t("Image unavailable")}
                sx={{
                    ...ADVERTISEMENT_IMAGE_STYLES,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "text.secondary",
                    gap: 1,
                }}
            >
                <BrokenImageOutlinedIcon
                    fontSize="large"
                />

                <Typography variant="body2">
                    {t("Image unavailable")}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            key={useOriginal ? "original" : "optimized"}
            component="img"
            src={imageSource}
            srcSet={srcSet}
            sizes={
                srcSet
                    ? ADVERTISEMENT_IMAGE_SIZES
                    : undefined
            }
            alt={alt}
            loading="lazy"
            decoding="async"
            onError={handleImageError}
            sx={ADVERTISEMENT_IMAGE_STYLES}
        />
    );
};

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
                    <AdvertisementImage
                        key={imageUrl}
                        source={imageUrl}
                        alt={title}
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