import React, {
    useEffect,
    useRef,
    useState
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    IconButton,
    Stack,
    TextField,
    Typography,
    MenuItem
} from "@mui/material";

import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";

import { useTranslation } from "react-i18next";

import compressImage, {
    MAX_IMAGE_SIZE_MB,
    validateImageFile
} from "../../utils/compressImage";

const categories = [
    "Crop Production",
    "Livestock",
    "Poultry",
    "Soil Health",
    "Pest Control",
    "Diseases",
    "Climate",
    "Weather",
    "Market Prices",
    "Government Support",
    "Mechanization",
    "Agribusiness",
    "Finance",
    "Technology",
    "General"
];

const getImageSource = image => {
    if (typeof image === "string") {
        return image;
    }

    if (
        image &&
        typeof image === "object" &&
        !(
            typeof Blob !== "undefined" &&
            image instanceof Blob
        )
    ) {
        return (
            image.secure_url ||
            image.url ||
            image.src ||
            ""
        );
    }

    return "";
};

const PostComposer = ({
    formData,
    loading,
    posting,
    onChange,
    onSubmit,
    error
}) => {
    const { t } = useTranslation();

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const imageSelectionRef = useRef(0);

    const [imageError, setImageError] =
        useState("");

    const [imageProcessing, setImageProcessing] =
        useState(false);

    const [imagePreview, setImagePreview] =
        useState("");

    const [previewFailed, setPreviewFailed] =
        useState(false);

    const [previewRetry, setPreviewRetry] =
        useState(0);

    // Generate previews for local images and
    // clean up temporary object URLs.
    useEffect(() => {
        const image = formData.image;

        if (
            typeof Blob !== "undefined" &&
            image instanceof Blob
        ) {
            const previewUrl =
                URL.createObjectURL(image);

            setImagePreview(previewUrl);

            return () => {
                URL.revokeObjectURL(previewUrl);
            };
        }

        setImagePreview(getImageSource(image));

        return undefined;
    }, [formData.image]);

    // Reset preview errors when the image changes.
    useEffect(() => {
        setPreviewFailed(false);
        setPreviewRetry(0);
    }, [imagePreview]);

    // Prevent stale image processing results
    // from updating an unmounted component.
    useEffect(() => {
        return () => {
            imageSelectionRef.current += 1;
        };
    }, []);

    const handleImageSelect = async event => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (
            !file ||
            imageProcessing ||
            posting ||
            loading
        ) {
            return;
        }

        const selectionId =
            ++imageSelectionRef.current;

        setImageError("");

        // Use the shared validation rules.
        try {
            validateImageFile(file);
        } catch (validationError) {
            setImageError(
                t(
                    validationError.message ||
                    "Please select a valid image."
                )
            );

            return;
        }

        setImageProcessing(true);

        try {
            const compressedImage =
                await compressImage(file);

            if (
                selectionId !== imageSelectionRef.current
            ) {
                return;
            }

            // compressImage returns a File object.
            if (
                typeof File === "undefined" ||
                !(compressedImage instanceof File)
            ) {
                throw new Error(
                    "Unable to process the selected image."
                );
            }

            // Keep the previous image until the
            // replacement is successfully processed.
            onChange({
                target: {
                    name: "image",
                    value: compressedImage
                }
            });

            setImageError("");
        } catch (processingError) {
            if (
                selectionId !== imageSelectionRef.current
            ) {
                return;
            }

            setImageError(
                t(
                    processingError.message ||
                    "Unable to add image."
                )
            );
        } finally {
            if (
                selectionId === imageSelectionRef.current
            ) {
                setImageProcessing(false);
            }
        }
    };

    const handleRemoveImage = () => {
        imageSelectionRef.current += 1;

        setImageProcessing(false);
        setImageError("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }

        onChange({
            target: {
                name: "image",
                value: ""
            }
        });

        setPreviewFailed(false);
        setPreviewRetry(0);
    };

    const handleSubmit = event => {
        event.preventDefault();

        if (
            posting ||
            loading ||
            imageProcessing
        ) {
            return;
        }

        onSubmit();
    };

    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                mb: 4
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {t("Share with the Community")}
                </Typography>

                <Box
                    component="form"
                    onSubmit={handleSubmit}
                >
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label={t("Title")}
                            name="title"
                            value={formData.title}
                            onChange={onChange}
                            disabled={posting}
                            error={Boolean(error?.title)}
                            helperText={
                                error?.title || ""
                            }
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t(
                                "What would you like to share?"
                            )}
                            name="content"
                            value={formData.content}
                            onChange={onChange}
                            disabled={posting}
                            error={Boolean(error?.content)}
                            helperText={
                                error?.content || ""
                            }
                        />

                        <TextField
                            select
                            fullWidth
                            label={t("Category")}
                            name="category"
                            value={formData.category}
                            onChange={onChange}
                            disabled={posting}
                        >
                            {categories.map(category => (
                                <MenuItem
                                    key={category}
                                    value={category}
                                >
                                    {t(category)}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box>
                            <Typography
                                variant="subtitle2"
                                fontWeight={600}
                                mb={0.5}
                            >
                                {t("Photo (optional)")}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                mb={0.5}
                            >
                                {t(
                                    "Add a photo or capture one with your camera."
                                )}
                            </Typography>

                            <Typography
                                variant="caption"
                                color="text.secondary"
                                display="block"
                                mb={1.5}
                            >
                                {t(
                                    "Supported formats: JPG, PNG, WebP. Maximum {{max}} MB per photo.",
                                    {
                                        max: MAX_IMAGE_SIZE_MB
                                    }
                                )}
                            </Typography>

                            {/* Gallery selection */}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                hidden
                                onChange={handleImageSelect}
                            />

                            {/* Rear camera capture */}
                            <input
                                ref={cameraInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                capture="environment"
                                hidden
                                onChange={handleImageSelect}
                            />

                            <Stack
                                direction={{
                                    xs: "column",
                                    sm: "row"
                                }}
                                spacing={1}
                            >
                                <Button
                                    variant="outlined"
                                    startIcon={
                                        imageProcessing ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        ) : (
                                            <AddPhotoAlternateOutlinedIcon />
                                        )
                                    }
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    disabled={
                                        posting ||
                                        loading ||
                                        imageProcessing
                                    }
                                    fullWidth
                                    sx={{ minHeight: 44 }}
                                >
                                    {imageProcessing
                                        ? t(
                                            "Processing image..."
                                        )
                                        : t(
                                            formData.image
                                                ? "Change Photo"
                                                : "Choose Photo"
                                        )}
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={
                                        <CameraAltIcon />
                                    }
                                    onClick={() =>
                                        cameraInputRef.current?.click()
                                    }
                                    disabled={
                                        posting ||
                                        loading ||
                                        imageProcessing
                                    }
                                    fullWidth
                                    sx={{ minHeight: 44 }}
                                >
                                    {t("Take Photo")}
                                </Button>
                            </Stack>

                            {imageProcessing && (
                                <Stack
                                    direction="row"
                                    spacing={1}
                                    alignItems="center"
                                    mt={1}
                                    role="status"
                                >
                                    <CircularProgress
                                        size={16}
                                    />

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {t(
                                            "Processing image..."
                                        )}
                                    </Typography>
                                </Stack>
                            )}

                            {imageError && (
                                <Alert
                                    severity="error"
                                    role="alert"
                                    sx={{
                                        mt: 1.5,
                                        whiteSpace:
                                            "pre-line",
                                        overflowWrap:
                                            "anywhere"
                                    }}
                                >
                                    {imageError}
                                </Alert>
                            )}

                            {imagePreview && (
                                <Box
                                    sx={{
                                        position:
                                            "relative",
                                        mt: 2,
                                        width: "100%",
                                        maxWidth: 400,
                                        borderRadius: 2,
                                        overflow: "hidden",
                                        bgcolor:
                                            "action.hover"
                                    }}
                                >
                                    {!previewFailed ? (
                                        <Box
                                            component="img"
                                            key={`${imagePreview}-${previewRetry}`}
                                            src={imagePreview}
                                            alt={t(
                                                "Community post"
                                            )}
                                            loading="eager"
                                            decoding="async"
                                            onError={() =>
                                                setPreviewFailed(
                                                    true
                                                )
                                            }
                                            sx={{
                                                display:
                                                    "block",
                                                width: "100%",
                                                maxHeight: 250,
                                                objectFit:
                                                    "contain"
                                            }}
                                        />
                                    ) : (
                                        <Stack
                                            spacing={1}
                                            alignItems="center"
                                            justifyContent="center"
                                            sx={{
                                                minHeight: 180,
                                                p: 3,
                                                border:
                                                    "1px solid",
                                                borderColor:
                                                    "divider",
                                                borderRadius: 2
                                            }}
                                        >
                                            <BrokenImageOutlinedIcon
                                                color="disabled"
                                                fontSize="large"
                                            />

                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                textAlign="center"
                                            >
                                                {t(
                                                    "Unable to display image preview."
                                                )}
                                            </Typography>

                                            <Button
                                                size="small"
                                                startIcon={
                                                    <RefreshIcon />
                                                }
                                                onClick={() => {
                                                    setPreviewFailed(
                                                        false
                                                    );

                                                    setPreviewRetry(
                                                        previous =>
                                                            previous + 1
                                                    );
                                                }}
                                            >
                                                {t("Retry")}
                                            </Button>
                                        </Stack>
                                    )}

                                    <IconButton
                                        size="small"
                                        onClick={
                                            handleRemoveImage
                                        }
                                        disabled={
                                            posting ||
                                            loading ||
                                            imageProcessing
                                        }
                                        aria-label={t(
                                            "Remove photo"
                                        )}
                                        sx={{
                                            position:
                                                "absolute",
                                            top: 8,
                                            right: 8,
                                            backgroundColor:
                                                "rgba(255,255,255,0.9)",
                                            "&:hover": {
                                                backgroundColor:
                                                    "white"
                                            }
                                        }}
                                    >
                                        <DeleteIcon
                                            fontSize="small"
                                        />
                                    </IconButton>
                                </Box>
                            )}
                        </Box>

                        {error?.general && (
                            <Typography
                                variant="body2"
                                color="error"
                                role="alert"
                            >
                                {error.general}
                            </Typography>
                        )}

                        <Button
                            variant="contained"
                            size="large"
                            type="submit"
                            disabled={
                                posting ||
                                loading ||
                                imageProcessing
                            }
                        >
                            {posting
                                ? t("Posting...")
                                : t("Post")}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PostComposer;