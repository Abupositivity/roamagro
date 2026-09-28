import React, { useRef, useState } from 'react';

import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CardMedia,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
    Typography,
} from '@mui/material';

import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import { createAgriTip } from '../../redux/actions/agriFeedActions';

const MAX_IMAGE_SIZE = 1200;
const IMAGE_QUALITY = 0.75;

const categories = [
    'Crop Production',
    'Livestock',
    'Poultry',
    'Soil Health',
    'Pest Control',
    'Diseases',
    'Climate',
    'Weather',
    'Market Prices',
    'Government Support',
    'Mechanization',
    'Agribusiness',
    'Finance',
    'Technology',
    'General',
];

const priorities = ['Normal', 'Important', 'Urgent'];

const compressImage = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {
                const scale = Math.min(
                    1,
                    MAX_IMAGE_SIZE / Math.max(image.width, image.height)
                );

                const canvas = document.createElement('canvas');

                canvas.width = Math.round(image.width * scale);
                canvas.height = Math.round(image.height * scale);

                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0, canvas.width, canvas.height);

                resolve(canvas.toDataURL('image/jpeg', IMAGE_QUALITY));
            };

            image.onerror = reject;
            image.src = reader.result;
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const initialFormData = {
    title: '',
    content: '',
    category: 'General',
    priority: 'Normal',
    language: 'English',
    region: 'Nigeria',
    image: '',
};

const ExtensionTipForm = ({ onPublished }) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);

    const { creating, createError } = useSelector(
        (state) => state.agriFeed
    );

    const user = useSelector(
        (state) => state.auth.user || state.auth.currentUser
    );

    const isAdmin = user?.role === 'admin';

    const [formData, setFormData] = useState(initialFormData);
    const [successMessage, setSuccessMessage] = useState('');
    const [imageError, setImageError] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: name === 'priority' && !isAdmin ? 'Normal' : value,
        }));

        setSuccessMessage('');
    };

    const handleImageChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setImageError(t('Please select an image file.'));
            return;
        }

        try {
            setImageError('');
            const image = await compressImage(file);
            setFormData((previous) => ({ ...previous, image }));
        } catch {
            setImageError(t('Unable to process this image.'));
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSuccessMessage('');

        const tipData = {
            ...formData,
            priority: isAdmin ? formData.priority : 'Normal',
        };

        const result = await dispatch(createAgriTip(tipData));

        if (!result.success) return;

        setFormData({ ...initialFormData });
        setSuccessMessage(t('Agricultural tip published successfully.'));

        if (onPublished) {
            onPublished(result.data);
        }
    };

    return (
        <Card elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
                <Stack spacing={3}>
                    <Box>
                        <Typography variant="h6" fontWeight={700}>
                            {t('Post Agricultural Tip')} 🌱
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mt={0.5}
                        >
                            {t('Share useful agricultural knowledge and advice with farmers.')}
                        </Typography>
                    </Box>

                    {successMessage && (
                        <Alert
                            severity="success"
                            onClose={() => setSuccessMessage('')}
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
                                label={t('Title')}
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                inputProps={{ maxLength: 150 }}
                            />

                            <FormControl fullWidth required>
                                <InputLabel>{t('Category')}</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    label={t('Category')}
                                    onChange={handleChange}
                                >
                                    {categories.map((category) => (
                                        <MenuItem key={category} value={category}>
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
                                label={t('Content')}
                                name="content"
                                value={formData.content}
                                onChange={handleChange}
                                placeholder={t('Write your agricultural advice here...')}
                            />

                            {isAdmin && (
                                <FormControl fullWidth>
                                    <InputLabel>{t('Priority')}</InputLabel>
                                    <Select
                                        name="priority"
                                        value={formData.priority}
                                        label={t('Priority')}
                                        onChange={handleChange}
                                    >
                                        {priorities.map((priority) => (
                                            <MenuItem key={priority} value={priority}>
                                                {t(priority)}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            )}

                            <FormControl fullWidth>
                                <InputLabel>{t('Language')}</InputLabel>
                                <Select
                                    name="language"
                                    value={formData.language}
                                    label={t('Language')}
                                    onChange={handleChange}
                                >
                                    {['English', 'Hausa'].map((language) => (
                                        <MenuItem key={language} value={language}>
                                            {t(language)}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <TextField
                                fullWidth
                                label={t('Region')}
                                name="region"
                                value={formData.region}
                                onChange={handleChange}
                            />

                            {formData.image && (
                                <Box>
                                    <CardMedia
                                        component="img"
                                        image={formData.image}
                                        alt={t('Agricultural tip image preview')}
                                        sx={{
                                            maxHeight: 260,
                                            objectFit: 'contain',
                                            borderRadius: 2,
                                        }}
                                    />

                                    <Button
                                        color="error"
                                        onClick={() =>
                                            setFormData((previous) => ({
                                                ...previous,
                                                image: '',
                                            }))
                                        }
                                    >
                                        {t('Remove image')}
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
                                startIcon={<CameraAltIcon />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {t(formData.image ? 'Change image' : 'Add photo or take a picture')}
                            </Button>

                            <Box>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    startIcon={<SendOutlinedIcon />}
                                    disabled={
                                        creating ||
                                        !formData.title.trim() ||
                                        !formData.content.trim()
                                    }
                                    sx={{ borderRadius: 2.5 }}
                                >
                                    {creating ? t('Publishing...') : t('Publish Tip')}
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