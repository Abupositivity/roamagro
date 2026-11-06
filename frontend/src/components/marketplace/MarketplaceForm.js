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
    CircularProgress,
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
import compressImage from '../../utils/compressImage';

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
    const imageSelectionRef = useRef(0);
    const imagesRef = useRef([]);

    const [images, setImages] = useState(
        Array.isArray(initialValues.images)
            ? initialValues.images.filter(Boolean)
            : []
    );
    const [imagePreviews, setImagePreviews] = useState([]);
    const [imageError, setImageError] = useState('');
    const [imageProcessing, setImageProcessing] = useState(false);
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

        imageSelectionRef.current += 1;

        const initialImages = Array.isArray(initialValues.images)
            ? initialValues.images.filter(Boolean)
            : [];

        imagesRef.current = initialImages;
        setImages(initialImages);
        setImageProcessing(false);
        setCoordinates(getCoordinates(initialValues.coordinates));
        setImageError('');
        setLocationError('');
        setLocationLoading(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [initialValues, reset]);

    useEffect(() => {
        const previews = images.map(image => {
            if (
                typeof File !== 'undefined' &&
                image instanceof File
            ) {
                return URL.createObjectURL(image);
            }

            return typeof image === 'string' ? image : '';
        });

        setImagePreviews(previews);

        return () => {
            images.forEach((image, index) => {
                if (
                    typeof File !== 'undefined' &&
                    image instanceof File
                ) {
                    URL.revokeObjectURL(previews[index]);
                }
            });
        };
    }, [images]);

    useEffect(() => {
        return () => {
            imageSelectionRef.current += 1;
        };
    }, []);

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
        event.target.value = '';

        if (!files.length) {
            return;
        }

        setImageError('');

        const remainingSlots = MAX_IMAGES - imagesRef.current.length;

        if (remainingSlots <= 0) {
            setImageError(t('You can add up to 3 images.'));
            return;
        }

        const selectedFiles = files.slice(0, remainingSlots);
        const selectionId = ++imageSelectionRef.current;

        setImageProcessing(true);

        try {
            const processedImages = await Promise.all(
                selectedFiles.map(file => compressImage(file))
            );

            if (selectionId !== imageSelectionRef.current) {
                return;
            }

            const updatedImages = [
                ...imagesRef.current,
                ...processedImages,
            ].slice(0, MAX_IMAGES);

            imagesRef.current = updatedImages;
            setImages(updatedImages);
        } catch (error) {
            if (selectionId !== imageSelectionRef.current) {
                return;
            }

            setImageError(
                t(
                    error.message ||
                    'Unable to add the selected image.'
                )
            );
        } finally {
            if (selectionId === imageSelectionRef.current) {
                setImageProcessing(false);
            }
        }
    };

    const handleRemoveImage = index => {
        imageSelectionRef.current += 1;
        setImageProcessing(false);

        const updatedImages = imagesRef.current.filter(
            (_, imageIndex) => imageIndex !== index
        );

        imagesRef.current = updatedImages;
        setImages(updatedImages);
        setImageError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const submitForm = data => {
        if (loading || imageProcessing || locationLoading) {
            return;
        }

        const cleanedData = {
            ...data,
            price: Number(data.price),
            quantity: Number(data.quantity),
            images: imagesRef.current.filter(Boolean),
        };

        if (coordinates) {
            cleanedData.coordinates = coordinates;
        } else {
            cleanedData.coordinates = null;
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
                                startIcon={<MyLocationIcon />}
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
                            accept="image/jpeg,image/png,image/webp"
                            capture="environment"
                            multiple
                            hidden
                            onChange={handleImageSelect}
                        />

                        <Button
                            variant="outlined"
                            startIcon={
                                imageProcessing
                                    ? <CircularProgress size={18} color="inherit" />
                                    : <CameraAltIcon />
                            }
                            onClick={() => fileInputRef.current?.click()}
                            disabled={
                                loading ||
                                imageProcessing ||
                                images.length >= MAX_IMAGES
                            }
                        >
                            {imageProcessing
                                ? t('Processing images...')
                                : images.length >= MAX_IMAGES
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
                                        key={index}
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
                                            src={imagePreviews[index] || ''}
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
                        disabled={
                            loading ||
                            locationLoading ||
                            imageProcessing
                        }
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