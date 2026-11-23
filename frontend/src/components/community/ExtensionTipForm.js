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
    CardMedia,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography
} from "@mui/material";

import SendOutlinedIcon from "@mui/icons-material/SendOutlined";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import BrokenImageOutlinedIcon from "@mui/icons-material/BrokenImageOutlined";

import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

import { createAgriTip } from "../../redux/actions/agriFeedActions";

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

const priorities = [
    "Normal",
    "Important",
    "Urgent"
];

const initialFormData = {
    title: "",
    content: "",
    category: "General",
    priority: "Normal",
    language: "English",
    region: "Nigeria",
    image: ""
};

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

const ExtensionTipForm = ({ onPublished }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);
    const imageSelectionRef = useRef(0);

    const { creating, createError } = useSelector(
        state => state.agriFeed
    );

    const user = useSelector(
        state =>
            state.auth.user ||
            state.auth.currentUser
    );

    const isAdmin = user?.role === "admin";

    const [formData, setFormData] = useState({
        ...initialFormData
    });

    const [successMessage, setSuccessMessage] =
        useState("");

    const [imageError, setImageError] =
        useState("");

    const [imageProcessing, setImageProcessing] =
        useState(false);

    const [imagePreview, setImagePreview] =
        useState("");

    const [previewFailed, setPreviewFailed] =
        useState(false);

    // Generate previews for local Files, Blobs,
    // image URLs, and supported image objects.
    useEffect(() => {
        const image = formData.image;

        setPreviewFailed(false);

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

    // Prevent stale image processing results
    // from updating an unmounted component.
    useEffect(() => {
        return () => {
            imageSelectionRef.current += 1;
        };
    }, []);

    const handleChange = event => {
        const { name, value } = event.target;

        setFormData(previous => ({
            ...previous,
            [name]:
                name === "priority" && !isAdmin
                    ? "Normal"
                    : value
        }));

        setSuccessMessage("");
    };

    const handleImageChange = async event => {
        const file = event.target.files?.[0];

        event.target.value = "";

        if (
            !file ||
            imageProcessing ||
            creating
        ) {
            return;
        }

        const selectionId =
            ++imageSelectionRef.current;

        setImageError("");
        setSuccessMessage("");

        // Use the same validation rules as
        // Marketplace and Post Composer.
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

            if (
                typeof File === "undefined" ||
                !(compressedImage instanceof File)
            ) {
                throw new Error(
                    "Unable to process the selected image."
                );
            }

            // Replace the previous image only after
            // successful processing.
            setFormData(previous => ({
                ...previous,
                image: compressedImage
            }));

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
                    "Unable to process this image."
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
        setSuccessMessage("");

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = "";
        }

        setFormData(previous => ({
            ...previous,
            image: ""
        }));

        setImagePreview("");
        setPreviewFailed(false);
    };

    const handleSubmit = async event => {
        event.preventDefault();

        setSuccessMessage("");

        if (imageProcessing || creating) {
            return;
        }

        const tipData = {
            ...formData,
            priority: isAdmin
                ? formData.priority
                : "Normal"
        };

        try {
            const result = await dispatch(
                createAgriTip(tipData)
            );

            if (!result?.success) {
                return;
            }

            // Invalidate pending image selections.
            imageSelectionRef.current += 1;

            setFormData({
                ...initialFormData
            });

            setImageError("");
            setImageProcessing(false);
            setPreviewFailed(false);

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            if (cameraInputRef.current) {
                cameraInputRef.current.value = "";
            }

            setSuccessMessage(
                t(
                    "Agricultural tip published successfully."
                )
            );

            if (onPublished) {
                onPublished(result.data);
            }
        } catch {
            // Redux exposes publication errors
            // through createError.
        }
    };

    return (
        <Card
            elevation={2}
            sx={{ borderRadius: 3 }}
        >
            <CardContent>
                <Stack spacing={3}>
                    <Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                        >
                            {t("Post Agricultural Tip")} 🌱
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                        >
                            {t(
                                "Share useful agricultural knowledge and advice with farmers."
                            )}
                        </Typography>
                    </Box>

                    {successMessage && (
                        <Alert
                            severity="success"
                            onClose={() =>
                                setSuccessMessage("")
                            }
                        >
                            {successMessage}
                        </Alert>
                    )}

                    {createError && (
                        <Alert severity="error">
                            {createError}
                        </Alert>
                    )}

                    {imageError && (
                        <Alert
                            severity="error"
                            sx={{
                                whiteSpace: "pre-line",
                                overflowWrap: "anywhere"
                            }}
                        >
                            {imageError}
                        </Alert>
                    )}

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                    >
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                required
                                label={t("Title")}
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                inputProps={{
                                    maxLength: 150
                                }}
                            />

                            <FormControl
                                fullWidth
                                required
                            >
                                <InputLabel>
                                    {t("Category")}
                                </InputLabel>

                                <Select
                                    name="category"
                                    value={formData.category}
                                    label={t("Category")}
                                    onChange={handleChange}
                                >
                                    {categories.map(
                                        category => (
                                            <MenuItem
                                                key={category}
                                                value={category}
                                            >
                                                {t(category)}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                required
                                multiline
                                minRows={5}
                                label={t("Content")}
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder={t(
                                    "Write your agricultural advice here..."
                                )}
                            />

                            {isAdmin && (
                                <FormControl fullWidth>
                                    <InputLabel>
                                        {t("Priority")}
                                    </InputLabel>

                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        label={t("Priority")}
                                        onChange={handleChange}
                                    >
                                        {priorities.map(
                                            priority => (
                                                <MenuItem
                                                    key={priority}
                                                    value={priority}
                                                >
                                                    {t(priority)}
                                                </MenuItem>
                                            )
                                        )}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl fullWidth>
                                <InputLabel>
                                    {t("Language")}
                                </InputLabel>

                                <Select
                                    name="language"
                                    value={formData.language}
                                    label={t("Language")}
                                    onChange={handleChange}
                                >
                                    {[
                                        "English",
                                        "Hausa"
                                    ].map(language => (
                                        <MenuItem
                                            key={language}
                                            value={language}
                                        >
                                            {t(language)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label={t("Region")}
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                            />

                            <Box>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={600}
                                    mb={0.5}
                                >
                                    {t("Photo (optional)")}
                                </Typography>

                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    display="block"
                                    mb={1.5}
                                >
                                    {t(
                                        "Maximum {{max}} MB per photo.",
                                        {
                                            max: MAX_IMAGE_SIZE_MB
                                        }
                                    )}
                                </Typography>

                                {imagePreview && (
                                    <Box mb={2}>
                                        {!previewFailed ? (
                                            <CardMedia
                                                component="img"
                                                image={imagePreview}
                                                alt={t(
                                                    "Agricultural tip image preview"
                                                )}
                                                loading="eager"
                                                onError={() =>
                                                    setPreviewFailed(
                                                        true
                                                    )
                                                }
                                                sx={{
                                                    width: "100%",
                                                    maxHeight: 260,
                                                    objectFit:
                                                        "contain",
                                                    borderRadius: 2,
                                                    bgcolor:
                                                        "action.hover"
                                                }}
                                            />
                                        ) : (
                                            <Stack
                                                spacing={1}
                                                alignItems="center"
                                                sx={{
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
                                            </Stack>
                                        )}

                                        <Button
                                            color="error"
                                            onClick={
                                                handleRemoveImage
                                            }
                                            disabled={
                                                creating ||
                                                imageProcessing
                                            }
                                            sx={{ mt: 1 }}
                                        >
                                            {t("Remove image")}
                                        </Button>
                                    </Box>
                                )}

                                {/* Gallery selection */}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={
                                        handleImageChange
                                    }
                                />

                                {/* Rear camera capture */}
                                <input
                                    ref={cameraInputRef}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    hidden
                                    onChange={
                                        handleImageChange
                                    }
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
                                            imageProcessing ||
                                            creating
                                        }
                                        fullWidth
                                        sx={{
                                            minHeight: 44
                                        }}
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
                                            imageProcessing ||
                                            creating
                                        }
                                        fullWidth
                                        sx={{
                                            minHeight: 44
                                        }}
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
                            </Box>

                            <Box>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={
                                        creating ? (
                                            <CircularProgress
                                                size={18}
                                                color="inherit"
                                            />
                                        ) : (
                                            <SendOutlinedIcon />
                                        )
                                    }
                                    disabled={
                                        creating ||
                                        imageProcessing ||
                                        !formData.title.trim() ||
                                        !formData.content.trim()
                                    }
                                    sx={{
                                        borderRadius: 2.5
                                    }}
                                >
                                    {creating
                                        ? t("Publishing...")
                                        : t("Publish Tip")}
                                </Button>
                            </Box>
                        </Stack>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default ExtensionTipForm;