import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState
} from "react";

import {
    Box,
    IconButton,
    Typography
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import ImagePreviewDialog from "./ImagePreviewDialog";

import {
    getMarketplaceThumbnail,
    getMarketplaceSrcSet,
    getImagePreview
} from "../../utils/cloudinaryImage";

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

const IMAGE_SIZES = [
    "(min-width: 1536px) 350px",
    "(min-width: 1200px) 25vw",
    "(min-width: 900px) 33vw",
    "(min-width: 600px) 50vw",
    "100vw"
].join(", ");

const MarketplaceImage = ({
    images = [],
    title = "Marketplace listing"
}) => {
    const [open, setOpen] = useState(false);

    const [activeIndex, setActiveIndex] =
        useState(0);

    const [failedImages, setFailedImages] =
        useState({});

    const [
        originalFallbacks,
        setOriginalFallbacks
    ] = useState({});

    const validImages = useMemo(() => {
        if (!Array.isArray(images)) {
            return [];
        }

        return images.filter(
            image =>
                typeof image === "string" &&
                image.trim().length > 0
        );
    }, [images]);

    const imageCount = validImages.length;

    useEffect(() => {
        setActiveIndex(0);
        setOpen(false);
        setFailedImages({});
        setOriginalFallbacks({});
    }, [validImages]);

    const currentIndex = Math.min(
        activeIndex,
        Math.max(0, imageCount - 1)
    );

    const currentImage =
        validImages[currentIndex] || "";

    const useOriginal = Boolean(
        originalFallbacks[currentImage]
    );

    const thumbnail = useMemo(
        () => getMarketplaceThumbnail(
            currentImage,
            480
        ),
        [currentImage]
    );

    const displayImage =
        !currentImage || failedImages[currentImage]
            ? PLACEHOLDER
            : useOriginal
                ? currentImage
                : thumbnail;

    const imageSrcSet = useMemo(() => {
        if (
            !currentImage ||
            useOriginal ||
            failedImages[currentImage]
        ) {
            return undefined;
        }

        return getMarketplaceSrcSet(currentImage);
    }, [
        currentImage,
        useOriginal,
        failedImages
    ]);

    const previewImage = useMemo(() => {
        if (
            !currentImage ||
            displayImage === PLACEHOLDER
        ) {
            return "";
        }

        return getImagePreview(
            currentImage,
            1200
        );
    }, [
        currentImage,
        displayImage
    ]);

    const hasMultipleImages = imageCount > 1;

    const handleImageError = useCallback(() => {
        if (
            !currentImage ||
            displayImage === PLACEHOLDER
        ) {
            return;
        }

        // Attempt the original image if the
        // optimized Cloudinary request fails.
        if (
            !useOriginal &&
            (
                thumbnail !== currentImage ||
                imageSrcSet
            )
        ) {
            setOriginalFallbacks(previous => ({
                ...previous,
                [currentImage]: true
            }));

            return;
        }

        // If the original also fails,
        // display the local placeholder.
        setFailedImages(previous => ({
            ...previous,
            [currentImage]: true
        }));
    }, [
        currentImage,
        displayImage,
        thumbnail,
        imageSrcSet,
        useOriginal
    ]);

    const handlePrevious = useCallback(event => {
        event?.stopPropagation();

        if (imageCount <= 1) return;

        setActiveIndex(previous =>
            (previous - 1 + imageCount) % imageCount
        );
    }, [imageCount]);

    const handleNext = useCallback(event => {
        event?.stopPropagation();

        if (imageCount <= 1) return;

        setActiveIndex(previous =>
            (previous + 1) % imageCount
        );
    }, [imageCount]);

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
                sx={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "3 / 2",
                    overflow: "hidden",
                    bgcolor: "action.hover"
                }}
            >
                <Box
                    onClick={handleOpen}
                    role={
                        displayImage !== PLACEHOLDER
                            ? "button"
                            : undefined
                    }
                    tabIndex={
                        displayImage !== PLACEHOLDER
                            ? 0
                            : undefined
                    }
                    onKeyDown={event => {
                        if (
                            displayImage !== PLACEHOLDER &&
                            (
                                event.key === "Enter" ||
                                event.key === " "
                            )
                        ) {
                            event.preventDefault();
                            handleOpen();
                        }
                    }}
                    aria-label={
                        displayImage !== PLACEHOLDER
                            ? `Preview ${title} image ${currentIndex + 1}`
                            : undefined
                    }
                    sx={{
                        width: "100%",
                        height: "100%",
                        cursor:
                            displayImage !== PLACEHOLDER
                                ? "pointer"
                                : "default",
                        "&:focus-visible": {
                            outline: "2px solid",
                            outlineColor: "primary.main",
                            outlineOffset: "-2px"
                        }
                    }}
                >
                    <Box
                        component="img"
                        key={`${currentImage}-${displayImage}`}
                        src={displayImage}
                        srcSet={imageSrcSet}
                        sizes={
                            imageSrcSet
                                ? IMAGE_SIZES
                                : undefined
                        }
                        width={480}
                        height={320}
                        alt={
                            displayImage === PLACEHOLDER
                                ? ""
                                : `${title} - ${currentIndex + 1}`
                        }
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

                {hasMultipleImages && (
                    <>
                        <IconButton
                            size="small"
                            onClick={handlePrevious}
                            aria-label="Previous photo"
                            sx={{
                                position: "absolute",
                                left: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                bgcolor: "rgba(0,0,0,0.55)",
                                color: "white",
                                "&:hover": {
                                    bgcolor: "rgba(0,0,0,0.75)"
                                }
                            }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={handleNext}
                            aria-label="Next photo"
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: "50%",
                                transform: "translateY(-50%)",
                                bgcolor: "rgba(0,0,0,0.55)",
                                color: "white",
                                "&:hover": {
                                    bgcolor: "rgba(0,0,0,0.75)"
                                }
                            }}
                        >
                            <ChevronRightIcon />
                        </IconButton>

                        <Box
                            sx={{
                                position: "absolute",
                                bottom: 8,
                                right: 8,
                                px: 1.2,
                                py: 0.4,
                                borderRadius: 2,
                                bgcolor: "rgba(0,0,0,0.65)",
                                pointerEvents: "none"
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: "white",
                                    fontWeight: 700
                                }}
                            >
                                {currentIndex + 1} / {imageCount}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>

            <ImagePreviewDialog
                open={open}
                image={previewImage}
                fallbackImage={currentImage}
                alt={`${title} - ${currentIndex + 1}`}
                onClose={handleClose}
            />
        </>
    );
};

export default memo(MarketplaceImage);