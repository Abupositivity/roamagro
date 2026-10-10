
import React, { useRef, useState } from "react";
import {
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
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
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
    const imageSelectionRef = useRef(0);

    const [imageError, setImageError] = useState("");
    const [imageProcessing, setImageProcessing] = useState(false);

    const handleImageSelect = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        const selectionId = ++imageSelectionRef.current;

        setImageError("");
        setImageProcessing(true);

        try {
            const image = await compressImage(file);

            if (selectionId !== imageSelectionRef.current) return;

            onChange({
                target: {
                    name: "image",
                    value: image
                }
            });
        } catch (error) {
            if (selectionId !== imageSelectionRef.current) return;

            setImageError(
                t(error.message || "Unable to add image.")
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

        onChange({
            target: {
                name: "image",
                value: ""
            }
        });
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (posting || imageProcessing) return;

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
                <Typography variant="h6" gutterBottom>
                    {t("Share with the Community")}
                </Typography>

                <Box component="form" onSubmit={handleSubmit}>
                    <Stack spacing={2}>
                        <TextField
                            fullWidth
                            label={t("Title")}
                            name="title"
                            value={formData.title}
                            onChange={onChange}
                            disabled={posting}
                            error={Boolean(error?.title)}
                            helperText={error?.title || ""}
                        />

                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label={t("What would you like to share?")}
                            name="content"
                            value={formData.content}
                            onChange={onChange}
                            disabled={posting}
                            error={Boolean(error?.content)}
                            helperText={error?.content || ""}
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
                            {categories.map((category) => (
                                <MenuItem key={category} value={category}>
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
                                mb={1.5}
                            >
                                {t(
                                    "Add a photo or capture one with your camera."
                                )}
                            </Typography>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                capture="environment"
                                hidden
                                onChange={handleImageSelect}
                            />

                            {!formData.image && (
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
                                    disabled={posting || imageProcessing}
                                >
                                    {imageProcessing
                                        ? t("Processing image...")
                                        : t("Add Photo")}
                                </Button>
                            )}

                            {imageError && (
                                <Typography
                                    variant="body2"
                                    color="error"
                                    mt={1}
                                    role="alert"
                                >
                                    {imageError}
                                </Typography>
                            )}

                            {formData.image && (
                                <Box
                                    sx={{
                                        position: "relative",
                                        mt: 2,
                                        width: "100%",
                                        maxWidth: 400,
                                        borderRadius: 2,
                                        overflow: "hidden"
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={formData.image}
                                        alt={t("Community post")}
                                        loading="lazy"
                                        sx={{
                                            display: "block",
                                            width: "100%",
                                            maxHeight: 250,
                                            objectFit: "cover"
                                        }}
                                    />

                                    <IconButton
                                        size="small"
                                        onClick={handleRemoveImage}
                                        disabled={posting}
                                        aria-label={t("Remove photo")}
                                        sx={{
                                            position: "absolute",
                                            top: 8,
                                            right: 8,
                                            backgroundColor:
                                                "rgba(255,255,255,0.9)",
                                            "&:hover": {
                                                backgroundColor: "white"
                                            }
                                        }}
                                    >
                                        <DeleteIcon fontSize="small" />
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
                            disabled={posting || imageProcessing}
                        >
                            {posting ? t("Posting...") : t("Post")}
                        </Button>
                    </Stack>
                </Box>
            </CardContent>
        </Card>
    );
};

export default PostComposer;