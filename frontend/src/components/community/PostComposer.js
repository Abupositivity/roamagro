import React, {
    useRef,
    useState,
} from 'react';

import {
    Box,
    Button,
    Card,
    CardContent,
    IconButton,
    Stack,
    TextField,
    Typography,
    MenuItem,
} from '@mui/material';

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';

import { useTranslation } from 'react-i18next';

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

const MAX_IMAGE_SIZE = 1200;
const IMAGE_QUALITY = 0.75;

const compressImage = (file) =>
    new Promise((resolve, reject) => {
        if (
            !file?.type?.startsWith(
                'image/'
            )
        ) {
            reject(
                new Error(
                    'Please select an image file.'
                )
            );
            return;
        }

        const reader =
            new FileReader();

        reader.onload = (event) => {
            const image = new Image();

            image.onload = () => {
                let width = image.width;
                let height = image.height;

                if (
                    width >
                        MAX_IMAGE_SIZE ||
                    height >
                        MAX_IMAGE_SIZE
                ) {
                    if (width > height) {
                        height =
                            (height / width) *
                            MAX_IMAGE_SIZE;
                        width =
                            MAX_IMAGE_SIZE;
                    } else {
                        width =
                            (width / height) *
                            MAX_IMAGE_SIZE;
                        height =
                            MAX_IMAGE_SIZE;
                    }
                }

                const canvas =
                    document.createElement(
                        'canvas'
                    );

                canvas.width =
                    Math.round(width);

                canvas.height =
                    Math.round(height);

                const context =
                    canvas.getContext(
                        '2d'
                    );

                if (!context) {
                    reject(
                        new Error(
                            'Unable to process image.'
                        )
                    );
                    return;
                }

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                try {
                    resolve(
                        canvas.toDataURL(
                            'image/jpeg',
                            IMAGE_QUALITY
                        )
                    );
                } catch {
                    reject(
                        new Error(
                            'Unable to compress image.'
                        )
                    );
                }
            };

            image.onerror = () => {
                reject(
                    new Error(
                        'Unable to process image.'
                    )
                );
            };

            image.src =
                event.target.result;
        };

        reader.onerror = () => {
            reject(
                new Error(
                    'Unable to read image.'
                )
            );
        };

        reader.readAsDataURL(file);
    });

const PostComposer = ({
    formData,
    loading,
    onChange,
    onSubmit,
}) => {
    const { t } = useTranslation();

    const fileInputRef =
        useRef(null);

    const [imageError, setImageError] =
        useState('');

    const handleImageSelect = async (
        event
    ) => {
        const file =
            event.target.files?.[0];

        if (!file) {
            return;
        }

        setImageError('');

        try {
            const image =
                await compressImage(
                    file
                );

            onChange({
                target: {
                    name: 'image',
                    value: image,
                },
            });
        } catch (error) {
            setImageError(
                error.message ||
                    t(
                        'Unable to add image.'
                    )
            );
        }

        event.target.value = '';
    };

    const handleRemoveImage = () => {
        onChange({
            target: {
                name: 'image',
                value: '',
            },
        });

        setImageError('');
    };

    return (
        <Card
            elevation={2}
            sx={{
                borderRadius: 3,
                mb: 4,
            }}
        >
            <CardContent>
                <Typography
                    variant="h6"
                    gutterBottom
                >
                    {t(
                        'Share with the Community'
                    )}
                </Typography>

                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        label={t('Title')}
                        name="title"
                        value={
                            formData.title
                        }
                        onChange={onChange}
                    />

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label={t(
                            'What would you like to share?'
                        )}
                        name="content"
                        value={
                            formData.content
                        }
                        onChange={onChange}
                    />

                    <TextField
                        select
                        fullWidth
                        label={t('Category')}
                        name="category"
                        value={
                            formData.category
                        }
                        onChange={onChange}
                    >
                        {categories.map(
                            (category) => (
                                <MenuItem
                                    key={
                                        category
                                    }
                                    value={
                                        category
                                    }
                                >
                                    {t(
                                        category
                                    )}
                                </MenuItem>
                            )
                        )}
                    </TextField>

                    <Box>
                        <Typography
                            variant="subtitle2"
                            fontWeight={600}
                            mb={0.5}
                        >
                            {t(
                                'Photo (optional)'
                            )}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={1.5}
                        >
                            {t(
                                'Add a photo or capture one with your camera.'
                            )}
                        </Typography>

                        <input
                            ref={
                                fileInputRef
                            }
                            type="file"
                            accept="image/*"
                            capture="environment"
                            hidden
                            onChange={
                                handleImageSelect
                            }
                        />

                        {!formData.image && (
                            <Button
                                variant="outlined"
                                startIcon={
                                    <CameraAltIcon />
                                }
                                onClick={() =>
                                    fileInputRef.current?.click()
                                }
                                disabled={
                                    loading
                                }
                            >
                                {t(
                                    'Add Photo'
                                )}
                            </Button>
                        )}

                        {imageError && (
                            <Typography
                                variant="body2"
                                color="error"
                                mt={1}
                            >
                                {
                                    imageError
                                }
                            </Typography>
                        )}

                        {formData.image && (
                            <Box
                                sx={{
                                    position:
                                        'relative',
                                    mt: 2,
                                    width:
                                        '100%',
                                    maxWidth: 400,
                                    borderRadius: 2,
                                    overflow:
                                        'hidden',
                                }}
                            >
                                <Box
                                    component="img"
                                    src={
                                        formData.image
                                    }
                                    alt={t(
                                        'Community post'
                                    )}
                                    sx={{
                                        width:
                                            '100%',
                                        maxHeight: 250,
                                        objectFit:
                                            'cover',
                                        display:
                                            'block',
                                    }}
                                />

                                <IconButton
                                    size="small"
                                    onClick={
                                        handleRemoveImage
                                    }
                                    disabled={
                                        loading
                                    }
                                    aria-label={t(
                                        'Remove photo'
                                    )}
                                    sx={{
                                        position:
                                            'absolute',
                                        top: 8,
                                        right: 8,
                                        backgroundColor:
                                            'rgba(255,255,255,0.9)',
                                        '&:hover':
                                            {
                                                backgroundColor:
                                                    'white',
                                            },
                                    }}
                                >
                                    <DeleteIcon fontSize="small" />
                                </IconButton>
                            </Box>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        size="large"
                        onClick={onSubmit}
                        disabled={loading}
                    >
                        {loading
                            ? t('Posting...')
                            : t('Post')}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
};

export default PostComposer;