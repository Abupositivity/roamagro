
import React, {
    useEffect,
    useRef,
    useState,
} from 'react';
import {
    Grid,
    TextField,
    MenuItem,
    Button,
    Box,
    Typography,
    IconButton,
    Stack,
    Alert,
} from '@mui/material';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteIcon from '@mui/icons-material/Delete';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import { useTranslation } from 'react-i18next';
import {
    useForm,
    Controller,
} from 'react-hook-form';

const categories = [
    'Crop',
    'Fruit',
    'Vegetable',
    'Livestock',
    'Poultry',
    'Fishery',
    'Equipment',
    'Farm Input',
    'Service',
    'Other',
];

const units = [
    'Bag(s)',
    'Kg(s)',
    'Bunch(es)',
    'Piece(s)',
    'Crate(s)',
    'Basket(s)',
    'Carton(s)',
    'Litre(s)',
    'Tonne(s)',
    'Pack(s)',
    'Animal(s)',
    'Seedling(s)',
    'Other(s)',
];

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE = 1200;
const IMAGE_QUALITY = 0.75;

const compressImage = file =>
    new Promise((resolve, reject) => {
        if (!file?.type?.startsWith('image/')) {
            reject(new Error('Please select an image file.'));
            return;
        }

        const reader = new FileReader();

        reader.onload = event => {
            const image = new Image();

            image.onload = () => {
                let width = image.width;
                let height = image.height;

                if (
                    width > MAX_IMAGE_SIZE ||
                    height > MAX_IMAGE_SIZE
                ) {
                    if (width > height) {
                        height = (height / width) * MAX_IMAGE_SIZE;
                        width = MAX_IMAGE_SIZE;
                    } else {
                        width = (width / height) * MAX_IMAGE_SIZE;
                        height = MAX_IMAGE_SIZE;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = Math.round(width);
                canvas.height = Math.round(height);

                const context = canvas.getContext('2d');

                if (!context) {
                    reject(new Error('Unable to process image.'));
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
                    reject(new Error('Unable to compress image.'));
                }
            };

            image.onerror = () => {
                reject(new Error('Unable to process image.'));
            };

            image.src = event.target.result;
        };

        reader.onerror = () => {
            reject(new Error('Unable to read image.'));
        };

        reader.readAsDataURL(file);
    });

const getCoordinates = values => {
    const latitude = Number(values?.latitude);
    const longitude = Number(values?.longitude);

    if (
        values?.latitude === undefined ||
        values?.latitude === null ||
        values?.longitude === undefined ||
        values?.longitude === null ||
        values?.latitude === '' ||
        values?.longitude === '' ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
    ) {
        return null;
    }

    return { latitude, longitude };
};

const MarketplaceForm = ({
    initialValues = {},
    loading = false,
    submitLabel = 'Create Listing',
    onSubmit,
}) => {
    const { t } = useTranslation();
    const fileInputRef = useRef(null);

    const [images, setImages] = useState(
        Array.isArray(initialValues.images)
            ? initialValues.images.filter(Boolean)
            : []
    );
    const [imageError, setImageError] = useState('');
    const [coordinates, setCoordinates] = useState(
        getCoordinates(initialValues.coordinates)
    );
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState('');

    const {
        handleSubmit,
        control,
        reset,
    } = useForm({
        defaultValues: {
            title: '',
            description: '',
            category: 'Crop',
            price: '',
            quantity: 1,
            unit: 'Bag(s)',
            location: '',
            available: true,
            ...initialValues,
        },
    });

    useEffect(() => {
        reset({
            title: '',
            description: '',
            category: 'Crop',
            price: '',
            quantity: 1,
            unit: 'Bag(s)',
            location: '',
            available: true,
            ...initialValues,
        });

        setImages(
            Array.isArray(initialValues.images)
                ? initialValues.images.filter(Boolean)
                : []
        );
        setCoordinates(getCoordinates(initialValues.coordinates));
        setImageError('');
        setLocationError('');
        setLocationLoading(false);
    }, [initialValues, reset]);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(
                t('Location is not supported by this browser.')
            );
            return;
        }

        setLocationLoading(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            position => {
                setCoordinates({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
                setLocationLoading(false);
            },
            () => {
                setLocationError(
                    t('Could not access your location. You can enter your town or village instead.')
                );
                setLocationLoading(false);
            },
            {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 300000,
            }
        );
    };

    const handleClearCoordinates = () => {
        setCoordinates(null);
        setLocationError('');
    };

    const handleImageSelect = async event => {
        const files = Array.from(event.target.files || []);

        if (!files.length) {
            return;
        }

        setImageError('');

        const remainingSlots = MAX_IMAGES - images.length;

        if (remainingSlots <= 0) {
            setImageError(t('You can add up to 3 images.'));
            event.target.value = '';
            return;
        }

        const selectedFiles = files.slice(0, remainingSlots);

        try {
            const processedImages = await Promise.all(
                selectedFiles.map(compressImage)
            );

            setImages(previous => [
                ...previous,
                ...processedImages,
            ]);
        } catch (error) {
            setImageError(
                error.message ||
                t('Unable to add the selected image.')
            );
        }

        event.target.value = '';
    };

    const handleRemoveImage = index => {
        setImages(previous =>
            previous.filter((_, imageIndex) => imageIndex !== index)
        );
        setImageError('');
    };

    const submitForm = data => {
        const cleanedData = {
            ...data,
            price: Number(data.price),
            quantity: Number(data.quantity),
            images: images.filter(Boolean),
        };

        if (coordinates) {
            cleanedData.coordinates = coordinates;
        } else {
            delete cleanedData.coordinates;
        }

        onSubmit(cleanedData);
    };

    return (
        <form onSubmit={handleSubmit(submitForm)}>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <Controller
                        name="title"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t('Title')}
                                fullWidth
                                required
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Controller
                        name="description"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                label={t('Product Description')}
                                multiline
                                rows={4}
                                fullWidth
                                required
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Controller
                        name="category"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                select
                                fullWidth
                                label={t('Category')}
                                {...field}
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
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Controller
                        name="price"
                        control={control}
                        rules={{
                            required: true,
                            min: 1,
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="number"
                                fullWidth
                                required
                                inputProps={{
                                    min: 1,
                                    step: 'any',
                                }}
                                label={t('Price')}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Controller
                        name="quantity"
                        control={control}
                        rules={{ min: 1 }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                type="number"
                                fullWidth
                                inputProps={{
                                    min: 1,
                                    step: 'any',
                                }}
                                label={t('Quantity')}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12} md={6}>
                    <Controller
                        name="unit"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                select
                                fullWidth
                                label={t('Unit')}
                                {...field}
                            >
                                {units.map(unit => (
                                    <MenuItem key={unit} value={unit}>
                                        {t(unit)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        )}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Controller
                        name="location"
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                fullWidth
                                label={t('Location')}
                                placeholder={t('e.g. Kuje, Abuja')}
                                helperText={t(
                                    'Enter your town, village, LGA, or state. Coordinates are optional.'
                                )}
                            />
                        )}
                    />
                </Grid>

                <Grid item xs={12}>
                    <Box
                        sx={{
                            p: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                        }}
                    >
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            mb={0.5}
                        >
                            {t('Help nearby buyers find your listing')}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                        >
                            {t(
                                'You can optionally share your device location. You do not need to enter coordinates yourself.'
                            )}
                        </Typography>

                        <Stack
                            direction={{
                                xs: 'column',
                                sm: 'row',
                            }}
                            spacing={1}
                            alignItems={{
                                xs: 'stretch',
                                sm: 'center',
                            }}
                        >
                            <Button
                                variant="outlined"
                                startIcon={
                                    <MyLocationIcon />
                                }
                                onClick={handleUseMyLocation}
                                disabled={loading || locationLoading}
                            >
                                {locationLoading
                                    ? t('Getting location...')
                                    : coordinates
                                        ? t('Update coordinates')
                                        : t('Use my location (optional)')}
                            </Button>

                            {coordinates && (
                                <Button
                                    color="inherit"
                                    startIcon={<LocationOffIcon />}
                                    onClick={handleClearCoordinates}
                                    disabled={loading || locationLoading}
                                >
                                    {t('Remove coordinates')}
                                </Button>
                            )}
                        </Stack>

                        {coordinates && (
                            <Alert severity="success" sx={{ mt: 2 }}>
                                {t(
                                    'Location coordinates added. Nearby buyers may see this listing higher in their results.'
                                )}
                            </Alert>
                        )}

                        {locationError && (
                            <Alert severity="info" sx={{ mt: 2 }}>
                                {locationError}
                            </Alert>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Box>
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                            mb={0.5}
                        >
                            {t('Product Photos')}
                        </Typography>

                        <Typography
                            variant="body2"
                            color="text.secondary"
                            mb={2}
                        >
                            {t('Add up to 3 photos of your product.')}
                        </Typography>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            multiple
                            hidden
                            onChange={handleImageSelect}
                        />

                        <Button
                            variant="outlined"
                            startIcon={<CameraAltIcon />}
                            onClick={() => fileInputRef.current?.click()}
                            disabled={loading || images.length >= MAX_IMAGES}
                        >
                            {images.length >= MAX_IMAGES
                                ? t('3 Photos Added')
                                : t('Add Photo')}
                        </Button>

                        {imageError && (
                            <Typography
                                variant="body2"
                                color="error"
                                mt={1}
                            >
                                {imageError}
                            </Typography>
                        )}

                        {images.length > 0 && (
                            <Stack
                                direction="row"
                                spacing={1}
                                mt={2}
                                sx={{
                                    overflowX: 'auto',
                                    pb: 1,
                                }}
                            >
                                {images.map((image, index) => (
                                    <Box
                                        key={`${index}-${image.slice(0, 20)}`}
                                        sx={{
                                            position: 'relative',
                                            minWidth: 100,
                                            width: 100,
                                            height: 80,
                                            borderRadius: 2,
                                            overflow: 'hidden',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={image}
                                            alt={`${t('Product')} ${index + 1}`}
                                            sx={{
                                                width: '100%',
                                                height: '100%',
                                                objectFit: 'cover',
                                                display: 'block',
                                            }}
                                        />

                                        <IconButton
                                            size="small"
                                            aria-label={t('Remove photo')}
                                            onClick={() => handleRemoveImage(index)}
                                            disabled={loading}
                                            sx={{
                                                position: 'absolute',
                                                top: 2,
                                                right: 2,
                                                width: 28,
                                                height: 28,
                                                backgroundColor: 'rgba(255,255,255,0.9)',
                                                '&:hover': {
                                                    backgroundColor: 'white',
                                                },
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </Box>
                </Grid>

                <Grid item xs={12}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || locationLoading}
                        fullWidth
                        size="large"
                    >
                        {t(submitLabel)}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default MarketplaceForm;