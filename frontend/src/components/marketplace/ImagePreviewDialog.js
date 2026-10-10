import React, { memo, useEffect, useState } from "react";
import {
    Box,
    Dialog,
    DialogContent,
    IconButton
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const ImagePreviewDialog = ({
    open,
    image,
    alt = "Marketplace image preview",
    onClose
}) => {
    const [imageFailed, setImageFailed] = useState(false);

    useEffect(() => {
        setImageFailed(false);
    }, [image]);

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
                aria-label="Close image preview"
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
                {image && !imageFailed ? (
                    <Box
                        component="img"
                        src={image}
                        alt={alt}
                        decoding="async"
                        onError={() => setImageFailed(true)}
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
                        Image unavailable
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default memo(ImagePreviewDialog);