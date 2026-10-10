
import React, { useRef, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { createAgriTip } from "../../redux/actions/agriFeedActions";
import compressImage from "../../utils/compressImage";

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

const priorities = ["Normal", "Important", "Urgent"];

const initialFormData = {
    title: "",
    content: "",
    category: "General",
    priority: "Normal",
    language: "English",
    region: "Nigeria",
    image: ""
};

const ExtensionTipForm = ({ onPublished }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const imageSelectionRef = useRef(0);

    const { creating, createError } = useSelector(
        (state) => state.agriFeed
    );

    const user = useSelector(
        (state) => state.auth.user || state.auth.currentUser
    );

    const isAdmin = user?.role === "admin";

    const [formData, setFormData] = useState(initialFormData);
    const [successMessage, setSuccessMessage] = useState("");
    const [imageError, setImageError] = useState("");
    const [imageProcessing, setImageProcessing] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]:
                name === "priority" && !isAdmin
                    ? "Normal"
                    : value
        }));

        setSuccessMessage("");
    };

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        const selectionId = ++imageSelectionRef.current;

        setImageError("");
        setImageProcessing(true);

        try {
            const image = await compressImage(file);

            if (selectionId !== imageSelectionRef.current) return;

            setFormData((previous) => ({
                ...previous,
                image
            }));
        } catch (error) {
            if (selectionId !== imageSelectionRef.current) return;

            setImageError(
                t(error.message || "Unable to process this image.")
            );
        } finally {
            if (selectionId === imageSelectionRef.current) {
                setImageProcessing(false);
            }
        }
    };

    const handleRemoveImage = () => {
        imageSelectionRef.current += 1;
        setImageProcessing(false);
        setImageError("");

        setFormData((previous) => ({
            ...previous,
            image: ""
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccessMessage("");

        if (imageProcessing || creating) return;

        const tipData = {
            ...formData,
            priority: isAdmin ? formData.priority : "Normal"
        };

        try {
            const result = await dispatch(createAgriTip(tipData));

            if (!result?.success) return;

            imageSelectionRef.current += 1;
            setFormData({ ...initialFormData });
            setImageError("");
            setSuccessMessage(
                t("Agricultural tip published successfully.")
            );

            if (onPublished) {
                onPublished(result.data);
            }
        } catch {
            // The Redux action should expose publication errors in createError.
        }
    };

    return (
        <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
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
                            onClose={() => setSuccessMessage("")}
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
                        <Alert severity="error">
                            {imageError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit}>
                        <Stack spacing={2}>
                            <TextField
                                fullWidth
                                required
                                label={t("Title")}
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                inputProps={{ maxLength: 150 }}
                            />

                            <FormControl fullWidth required>
                                <InputLabel>{t("Category")}</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    label={t("Category")}
                                    onChange={handleChange}
                                >
                                    {categories.map((category) => (
                                        <MenuItem
                                            key={category}
                                            value={category}
                                        >
                                            {t(category)}
                                        </MenuItem>
                                    ))}
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
                                    <InputLabel>{t("Priority")}</InputLabel>
                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        label={t("Priority")}
                                        onChange={handleChange}
                                    >
                                        {priorities.map((priority) => (
                                            <MenuItem
                                                key={priority}
                                                value={priority}
                                            >
                                                {t(priority)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl fullWidth>
                                <InputLabel>{t("Language")}</InputLabel>
                                <Select
                                    name="language"
                                    value={formData.language}
                                    label={t("Language")}
                                    onChange={handleChange}
                                >
                                    {["English", "Hausa"].map((language) => (
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

                            {formData.image && (
                                <Box>
                                    <CardMedia
                                        component="img"
                                        image={formData.image}
                                        alt={t(
                                            "Agricultural tip image preview"
                                        )}
                                        loading="lazy"
                                        sx={{
                                            width: "100%",
                                            maxHeight: 260,
                                            objectFit: "contain",
                                            borderRadius: 2
                                        }}
                                    />

                                    <Button
                                        color="error"
                                        onClick={handleRemoveImage}
                                    >
                                        {t("Remove image")}
                                    </Button>
                                </Box>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                hidden
                                onChange={handleImageChange}
                            />

                            <Button
                                variant="outlined"
                                startIcon={
                                    imageProcessing ? (
                                        <CircularProgress
                                            size={18}
                                            color="inherit"
                                        />
                                    ) : (
                                        <CameraAltIcon />
                                    )
                                }
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                disabled={imageProcessing || creating}
                            >
                                {imageProcessing
                                    ? t("Processing image...")
                                    : t(
                                          formData.image
                                              ? "Change image"
                                              : "Add photo or take a picture"
                                      )}
                            </Button>

                            <Box>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SendOutlinedIcon />}
                                    disabled={
                                        creating ||
                                        imageProcessing ||
                                        !formData.title.trim() ||
                                        !formData.content.trim()
                                    }
                                    sx={{ borderRadius: 2.5 }}
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