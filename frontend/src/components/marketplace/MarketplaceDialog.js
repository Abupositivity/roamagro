import React, {
    memo,
    useEffect,
    useState
} from "react";

import {
    Box,
    Dialog,
    DialogContent,
    IconButton
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";

import { useTranslation } from "react-i18next";

const ImagePreviewDialog = ({
    open,
    image,
    fallbackImage = "",
    alt = "Marketplace image preview",
    onClose
}) => {
    const { t } = useTranslation();

    const [imageFailed, setImageFailed] =
        useState(false);

    const [useFallback, setUseFallback] =
        useState(false);

    useEffect(() => {
        setImageFailed(false);
        setUseFallback(false);
    }, [
        image,
        fallbackImage,
        open
    ]);

    const displayImage = useFallback
        ? fallbackImage
        : image;

    const handleImageError = () => {
        if (
            !useFallback &&
            fallbackImage &&
            fallbackImage !== image
        ) {
            setUseFallback(true);
            return;
        }

        setImageFailed(true);
    };

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            onClose={onClose}
            aria-label={alt}
            slotProps={{
                paper: {
                    sx: {
                        overflow: "hidden",
                        bgcolor: "black"
                    }
                }
            }}
        >
            <IconButton
                onClick={onClose}
                aria-label={t("Close image preview")}
                sx={{
                    position: "absolute",
                    top: 8,
                    right: 8,
                    zIndex: 2,
                    color: "#202124",
                    bgcolor: "rgba(255,255,255,0.92)",
                    "&:hover": {
                        bgcolor: "#FFFFFF"
                    }
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent
                sx={{
                    p: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 160,
                    maxHeight: "80vh",
                    overflow: "hidden",
                    bgcolor: "black"
                }}
            >
                {open && (
                    displayImage && !imageFailed ? (
                        <Box
                            component="img"
                            key={displayImage}
                            src={displayImage}
                            alt={alt}
                            loading="eager"
                            decoding="async"
                            onError={handleImageError}
                            sx={{
                                display: "block",
                                width: "100%",
                                maxHeight: "80vh",
                                objectFit: "contain"
                            }}
                        />
                    ) : (
                        <Box
                            role="status"
                            sx={{
                                color: "#FFFFFF",
                                textAlign: "center",
                                p: 4
                            }}
                        >
                            {t("Image unavailable")}
                        </Box>
                    )
                )}
            </DialogContent>
        </Dialog>
    );
};

export default memo(ImagePreviewDialog);