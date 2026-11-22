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
import AddPhotoAlternateOutlinedIcon from '@mui/icons-material/AddPhotoAlternateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import LocationOffIcon from '@mui/icons-material/LocationOff';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useTranslation } from 'react-i18next';

import {
    useForm,
    Controller,
} from 'react-hook-form';

import compressImage, {
    MAX_IMAGE_SIZE_MB,
    validateImageFile,
} from '../../utils/compressImage';

import {
    getMarketplaceThumbnail,
} from '../../utils/cloudinaryImage';

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

const getImageSource = image => {
    if (typeof image === 'string') {
        return image;
    }

    if (
        image &&
        typeof image === 'object' &&
        !(
            typeof Blob !== 'undefined' &&
            image instanceof Blob
        )
    ) {
        return (
            image.secure_url ||
            image.url ||
            image.src ||
            ''
        );
    }

    return '';
};

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

const MarketplacePhotoPreview = ({
    source,
    alt,
    onRemove,
    disabled,
}) => {
    const { t } = useTranslation();

    const [useOriginal, setUseOriginal] =
        useState(false);

    const [failed, setFailed] =
        useState(false);

    const [loaded, setLoaded] =
        useState(false);

    const [retryCount, setRetryCount] =
        useState(0);

    const optimizedSource = source
        ? getMarketplaceThumbnail(source, 240)
        : '';

    const displaySource = useOriginal
        ? source
        : optimizedSource;

    useEffect(() => {
        setUseOriginal(false);
        setFailed(false);
        setLoaded(false);
        setRetryCount(0);
    }, [source]);

    const handleError = () => {
        setLoaded(false);

        if (
            !useOriginal &&
            optimizedSource !== source
        ) {
            setUseOriginal(true);
            return;
        }

        setFailed(true);
    };

    const handleRetry = () => {
        setUseOriginal(false);
        setFailed(false);
        setLoaded(false);

        setRetryCount(previous => previous + 1);
    };

    return (
        <Box
            sx={{
                position: 'relative',
                flexShrink: 0,
                width: 110,
                height: 90,
                borderRadius: 2,
                overflow: 'hidden',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
            }}
        >
            {!failed && displaySource ? (
                <>
                    <Box
                        component="img"
                        key={`${displaySource}-${retryCount}`}
                        src={displaySource}
                        alt={alt}
                        loading="eager"
                        decoding="async"
                        onLoad={() => setLoaded(true)}
                        onError={handleError}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            display: 'block',
                        }}
                    />

                    {!loaded && (
                        <Box
                            role="status"
                            sx={{
                                position: 'absolute',
                                inset: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'action.hover',
                                pointerEvents: 'none',
                            }}
                        >
                            <CircularProgress size={22} />
                        </Box>
                    )}
                </>
            ) : (
                <Stack
                    spacing={0.5}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                        width: '100%',
                        height: '100%',
                        color: 'text.secondary',
                        px: 1,
                    }}
                >
                    <BrokenImageOutlinedIcon
                        fontSize="small"
                    />

                    <Button
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={handleRetry}
                        sx={{
                            minWidth: 0,
                            p: 0.25,
                            fontSize: '0.7rem',
                        }}
                    >
                        {t('Retry')}
                    </Button>
                </Stack>
            )}

            <IconButton
                size="small"
                aria-label={t('Remove photo')}
                onClick={onRemove}
                disabled={disabled}
                sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 28,
                    height: 28,
                    zIndex: 2,
                    backgroundColor:
                        'rgba(255,255,255,0.92)',
                    '&:hover': {
                        backgroundColor: 'white',
                    },
                }}
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

const MarketplaceForm = ({
    initialValues = {},
    loading = false,
    submitLabel = 'Create Listing',
    onSubmit,
}) => {
    const { t } = useTranslation();

    const fileInputRef = useRef(null);
    const cameraInputRef = useRef(null);

    const imageSelectionRef = useRef(0);
    const imagesRef = useRef([]);

    const [images, setImages] = useState(
        Array.isArray(initialValues.images)
            ? initialValues.images.filter(Boolean)
            : []
    );

    const [imagePreviews, setImagePreviews] =
        useState([]);

    const [imageError, setImageError] =
        useState('');

    const [imageProcessing, setImageProcessing] =
        useState(false);

    const [coordinates, setCoordinates] = useState(
        getCoordinates(initialValues.coordinates)
    );

    const [locationLoading, setLocationLoading] =
        useState(false);

    const [locationError, setLocationError] =
        useState('');

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

        const initialImages = Array.isArray(
            initialValues.images
        )
            ? initialValues.images.filter(Boolean)
            : [];

        imagesRef.current = initialImages;

        setImages(initialImages);
        setImageProcessing(false);

        setCoordinates(
            getCoordinates(initialValues.coordinates)
        );

        setImageError('');
        setLocationError('');
        setLocationLoading(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    }, [initialValues, reset]);

    // Generate previews for local Files and Blobs,
    // as well as stored image URLs and objects.
    useEffect(() => {
        const objectUrls = [];

        const previews = images.map(image => {
            if (
                typeof Blob !== 'undefined' &&
                image instanceof Blob
            ) {
                const objectUrl =
                    URL.createObjectURL(image);

                objectUrls.push(objectUrl);

                return objectUrl;
            }

            return getImageSource(image);
        });

        setImagePreviews(previews);

        return () => {
            objectUrls.forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [images]);

    // Invalidate pending compression on unmount.
    useEffect(() => {
        return () => {
            imageSelectionRef.current += 1;
        };
    }, []);

    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            setLocationError(
                t(
                    'Location is not supported by this browser.'
                )
            );
            return;
        }

        setLocationLoading(true);
        setLocationError('');

        navigator.geolocation.getCurrentPosition(
            position => {
                setCoordinates({
                    latitude:
                        position.coords.latitude,
                    longitude:
                        position.coords.longitude,
                });

                setLocationLoading(false);
            },
            () => {
                setLocationError(
                    t(
                        'Could not access your location. You can enter your town or village instead.'
                    )
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
        const files = Array.from(
            event.target.files || []
        );

        event.target.value = '';

        if (
            !files.length ||
            imageProcessing ||
            loading
        ) {
            return;
        }

        setImageError('');

        const remainingSlots =
            MAX_IMAGES - imagesRef.current.length;

        if (remainingSlots <= 0) {
            setImageError(
                t('You can add up to 3 images.')
            );
            return;
        }

        const selectedFiles = files.slice(
            0,
            remainingSlots
        );

        const errors = [];

        if (files.length > remainingSlots) {
            errors.push(
                t(
                    'You can add only {{count}} more photo(s). Extra photos were not selected.',
                    {
                        count: remainingSlots,
                    }
                )
            );
        }

        // Validate all selected files using the
        // shared compression utility rules.
        const validFiles = selectedFiles.filter(file => {
            try {
                validateImageFile(file);
                return true;
            } catch (validationError) {
                errors.push(
                    t(
                        validationError.message ||
                        'Please select a valid image.'
                    )
                );

                return false;
            }
        });

        if (!validFiles.length) {
            setImageError(errors.join('\n'));
            return;
        }

        const selectionId =
            ++imageSelectionRef.current;

        setImageProcessing(true);

        try {
            // Compress each image independently.
            // One failure should not discard
            // successfully processed images.
            const results = await Promise.allSettled(
                validFiles.map(file =>
                    compressImage(file)
                )
            );

            if (
                selectionId !== imageSelectionRef.current
            ) {
                return;
            }

            const successfulImages = [];

            results.forEach((result, index) => {
                const file = validFiles[index];

                if (
                    result.status === 'fulfilled' &&
                    typeof File !== 'undefined' &&
                    result.value instanceof File
                ) {
                    successfulImages.push(
                        result.value
                    );

                    return;
                }

                const reason =
                    result.status === 'rejected'
                        ? result.reason
                        : new Error(
                            'Unable to process the selected image.'
                        );

                errors.push(
                    t(
                        reason?.message ||
                        'Could not process {{name}}. Please choose another photo.',
                        {
                            name: file.name,
                        }
                    )
                );
            });

            if (successfulImages.length > 0) {
                const updatedImages = [
                    ...imagesRef.current,
                    ...successfulImages,
                ].slice(0, MAX_IMAGES);

                imagesRef.current = updatedImages;
                setImages(updatedImages);
            }

            setImageError(
                errors.length > 0
                    ? errors.join('\n')
                    : ''
            );
        } catch {
            if (
                selectionId !== imageSelectionRef.current
            ) {
                return;
            }

            setImageError(
                t(
                    'Unable to process the selected photos. Please try again.'
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

    const handleRemoveImage = index => {
        imageSelectionRef.current += 1;
        setImageProcessing(false);

        const updatedImages =
            imagesRef.current.filter(
                (_, imageIndex) =>
                    imageIndex !== index
            );

        imagesRef.current = updatedImages;

        setImages(updatedImages);
        setImageError('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        if (cameraInputRef.current) {
            cameraInputRef.current.value = '';
        }
    };

    const submitForm = data => {
        if (
            loading ||
            imageProcessing ||
            locationLoading
        ) {
            return;
        }

        const cleanedData = {
            ...data,
            price: Number(data.price),
            quantity: Number(data.quantity),
            images: imagesRef.current.filter(Boolean),
            coordinates: coordinates || null,
        };

        onSubmit(cleanedData);
    };

    const imageLimitReached =
        images.length >= MAX_IMAGES;

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
                                {...field}
                                select
                                fullWidth
                                label={t('Category')}
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
                                {...field}
                                select
                                fullWidth
                                label={t('Unit')}
                            >
                                {units.map(unit => (
                                    <MenuItem
                                        key={unit}
                                        value={unit}
                                    >
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
                                placeholder={t(
                                    'e.g. Kuje, Abuja'
                                )}
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
                            {t(
                                'Help nearby buyers find your listing'
                            )}
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
                                disabled={
                                    loading || locationLoading
                                }
                            >
                                {locationLoading
                                    ? t('Getting location...')
                                    : coordinates
                                      ? t('Update coordinates')
                                      : t(
                                            'Use my location (optional)'
                                        )}
                            </Button>

                            {coordinates && (
                                <Button
                                    color="inherit"
                                    startIcon={
                                        <LocationOffIcon />
                                    }
                                    onClick={
                                        handleClearCoordinates
                                    }
                                    disabled={
                                        loading ||
                                        locationLoading
                                    }
                                >
                                    {t('Remove coordinates')}
                                </Button>
                            )}
                        </Stack>

                        {coordinates && (
                            <Alert
                                severity="success"
                                sx={{ mt: 2 }}
                            >
                                {t(
                                    'Location coordinates added. Nearby buyers may see this listing higher in their results.'
                                )}
                            </Alert>
                        )}

                        {locationError && (
                            <Alert
                                severity="info"
                                sx={{ mt: 2 }}
                            >
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
                            mb={1}
                        >
                            {t(
                                'Add up to 3 photos of your product.'
                            )}
                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mb={2}
                        >
                            {t(
                                'Supported formats: JPG, PNG, WebP. Maximum {{max}} MB per photo.',
                                {
                                    max: MAX_IMAGE_SIZE_MB,
                                }
                            )}
                        </Typography>

                        {/* Gallery: multiple photos */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            hidden
                            onChange={handleImageSelect}
                        />

                        {/* Camera: one photo at a time */}
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
                                xs: 'column',
                                sm: 'row',
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
                                    loading ||
                                    imageProcessing ||
                                    imageLimitReached
                                }
                                fullWidth
                                sx={{ minHeight: 44 }}
                            >
                                {imageProcessing
                                    ? t('Processing images...')
                                    : imageLimitReached
                                      ? t('3 Photos Added')
                                      : t('Choose Photos')}
                            </Button>

                            <Button
                                variant="outlined"
                                startIcon={<CameraAltIcon />}
                                onClick={() =>
                                    cameraInputRef.current?.click()
                                }
                                disabled={
                                    loading ||
                                    imageProcessing ||
                                    imageLimitReached
                                }
                                fullWidth
                                sx={{ minHeight: 44 }}
                            >
                                {t('Take Photo')}
                            </Button>
                        </Stack>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            mt={1}
                        >
                            {images.length}/{MAX_IMAGES}{' '}
                            {t('photos added')}
                        </Typography>

                        {imageProcessing && (
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                mt={1}
                                role="status"
                            >
                                <CircularProgress size={16} />

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('Processing images...')}
                                </Typography>
                            </Stack>
                        )}

                        {imageError && (
                            <Alert
                                severity="error"
                                role="alert"
                                sx={{
                                    mt: 2,
                                    whiteSpace: 'pre-line',
                                    overflowWrap: 'anywhere',
                                }}
                            >
                                {imageError}
                            </Alert>
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
                                    <MarketplacePhotoPreview
                                        key={`${index}-${imagePreviews[index] || ''}`}
                                        source={
                                            imagePreviews[index] ||
                                            getImageSource(image)
                                        }
                                        alt={`${t('Product')} ${index + 1}`}
                                        onRemove={() =>
                                            handleRemoveImage(index)
                                        }
                                        disabled={
                                            loading ||
                                            imageProcessing
                                        }
                                    />
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
                        {loading ? (
                            <CircularProgress
                                size={24}
                                color="inherit"
                            />
                        ) : (
                            t(submitLabel)
                        )}
                    </Button>
                </Grid>
            </Grid>
        </form>
    );
};

export default MarketplaceForm;