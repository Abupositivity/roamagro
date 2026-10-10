import React, { memo, useCallback, useState } from "react";
import { Box } from "@mui/material";
import ImagePreviewDialog from "./ImagePreviewDialog";

const PLACEHOLDER = `data:image/svg+xml,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
  <rect width="600" height="400" fill="#edf3ee"/>
  <g fill="none" stroke="#8ba894" stroke-width="8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="220" y="105" width="160" height="130" rx="12"/>
    <circle cx="270" cy="145" r="12"/>
    <path d="M235 215l48-48 32 30 24-22 26 40"/>
  </g>
  <text x="300" y="285" font-family="Arial,sans-serif" font-size="30" font-weight="600" text-anchor="middle" fill="#42634d">RoamAgro</text>
  <text x="300" y="320" font-family="Arial,sans-serif" font-size="18" text-anchor="middle" fill="#607568">Image unavailable</text>
</svg>
`)}`;

const MarketplaceImage = ({ images = [], title = "Marketplace listing" }) => {
    const [open, setOpen] = useState(false);
    const [failedImages, setFailedImages] = useState({});
    const image = Array.isArray(images)
        ? images.find((item) => typeof item === "string" && item.trim()) || ""
        : "";

    const displayImage = !image || failedImages[image] ? PLACEHOLDER : image;

    const handleImageError = useCallback(() => {
        if (image && !failedImages[image]) {
            setFailedImages((previous) => ({
                ...previous,
                [image]: true
            }));
        }
    }, [image, failedImages]);

    const handleOpen = useCallback(() => {
        if (displayImage !== PLACEHOLDER) {
            setOpen(true);
        }
    }, [displayImage]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Box
                onClick={handleOpen}
                role={displayImage !== PLACEHOLDER ? "button" : undefined}
                tabIndex={displayImage !== PLACEHOLDER ? 0 : undefined}
                onKeyDown={(event) => {
                    if (
                        displayImage !== PLACEHOLDER &&
                        (event.key === "Enter" || event.key === " ")
                    ) {
                        event.preventDefault();
                        handleOpen();
                    }
                }}
                aria-label={displayImage !== PLACEHOLDER ? `Preview ${title} image` : undefined}
                sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "3 / 2",
                    overflow: "hidden",
                    cursor: displayImage !== PLACEHOLDER ? "pointer" : "default",
                    bgcolor: "action.hover",
                    "&:focus-visible": {
                        outline: "2px solid",
                        outlineColor: "primary.main",
                        outlineOffset: "-2px"
                    }
                }}
            >
                <Box
                    component="img"
                    src={displayImage}
                    alt={displayImage === PLACEHOLDER ? "" : title}
                    loading="lazy"
                    decoding="async"
                    onError={handleImageError}
                    sx={{
                        display: "block",
                        width: "100%",
                        height: "100%",
                        objectFit: "cover"
                    }}
                />
            </Box>

            <ImagePreviewDialog
                open={open}
                image={displayImage}
                alt={title}
                onClose={handleClose}
            />
        </>
    );
};

export default memo(MarketplaceImage);