
import React, {
    memo,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Box,
    Button,
    CircularProgress,
    IconButton,
    Typography,
} from '@mui/material';

import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useTranslation } from 'react-i18next';

import ImagePreviewDialog from './ImagePreviewDialog';

import {
    getMarketplaceThumbnail,
    getMarketplaceSrcSet,
    getImagePreview,
} from '../../utils/cloudinaryImage';

const IMAGE_SIZES = [
    '(min-width: 1536px) 350px',
    '(min-width: 1200px) 25vw',
    '(min-width: 900px) 33vw',
    '(min-width: 600px) 50vw',
    '100vw',
].join(', ');

const EMPTY_IMAGES = [];

const MarketplaceImage = ({
    images = EMPTY_IMAGES,
    title = 'Marketplace listing',
}) => {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [imageStates, setImageStates] = useState({});

    const validImages = useMemo(
        () =>
            Array.isArray(images)
                ? images.filter(
                      image =>
                          typeof image === 'string' &&
                          image.trim().length > 0
                  )
                : [],
        [images]
    );

    const imageKey = JSON.stringify(validImages);

    useEffect(() => {
        setActiveIndex(0);
        setOpen(false);
        setImageStates({});
    }, [imageKey]);

    const imageCount = validImages.length;

    const currentIndex = Math.min(
        activeIndex,
        Math.max(0, imageCount - 1)
    );

    const currentImage = validImages[currentIndex] || '';

    const currentState = imageStates[currentImage] || {};

    const useOriginal = Boolean(currentState.useOriginal);
    const imageFailed = Boolean(currentState.failed);
    const retryCount = currentState.retryCount || 0;

    const thumbnail = useMemo(
        () =>
            currentImage
                ? getMarketplaceThumbnail(currentImage, 480)
                : '',
        [currentImage]
    );

    const imageSrcSet = useMemo(
        () =>
            currentImage && !useOriginal && !imageFailed
                ? getMarketplaceSrcSet(currentImage)
                : undefined,
        [currentImage, useOriginal, imageFailed]
    );

    const displayImage = useOriginal
        ? currentImage
        : thumbnail;

    const previewImage = useMemo(
        () =>
            currentImage
                ? getImagePreview(currentImage, 1200)
                : '',
        [currentImage]
    );

    const hasMultipleImages = imageCount > 1;

    const updateImageState = useCallback(
        (source, changes) => {
            setImageStates(previous => ({
                ...previous,
                [source]: {
                    ...previous[source],
                    ...changes,
                },
            }));
        },
        []
    );

    const handleImageError = useCallback(
        source => {
            if (!source) return;

            const state = imageStates[source] || {};

            if (
                !state.useOriginal &&
                (thumbnail !== source || imageSrcSet)
            ) {
                updateImageState(source, {
                    useOriginal: true,
                    failed: false,
                });
                return;
            }

            updateImageState(source, {
                failed: true,
            });
        },
        [
            imageStates,
            thumbnail,
            imageSrcSet,
            updateImageState,
        ]
    );

    const handleRetry = useCallback(
        event => {
            event?.stopPropagation();

            if (!currentImage) return;

            updateImageState(currentImage, {
                useOriginal: false,
                failed: false,
                retryCount: retryCount + 1,
            });
        },
        [
            currentImage,
            retryCount,
            updateImageState,
        ]
    );

    const handlePrevious = useCallback(
        event => {
            event?.stopPropagation();

            if (imageCount <= 1) return;

            setActiveIndex(previous =>
                (previous - 1 + imageCount) % imageCount
            );
        },
        [imageCount]
    );

    const handleNext = useCallback(
        event => {
            event?.stopPropagation();

            if (imageCount <= 1) return;

            setActiveIndex(previous =>
                (previous + 1) % imageCount
            );
        },
        [imageCount]
    );

    const handleOpen = useCallback(() => {
        if (currentImage && !imageFailed) {
            setOpen(true);
        }
    }, [currentImage, imageFailed]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    return (
        <>
            <Box
                sx={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '3 / 2',
                    overflow: 'hidden',
                    bgcolor: 'action.hover',
                }}
            >
                {!currentImage || imageFailed ? (
                    <Box
                        role="img"
                        aria-label={t('Image unavailable')}
                        sx={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 1,
                            p: 2,
                            color: 'text.secondary',
                        }}
                    >
                        <BrokenImageOutlinedIcon
                            fontSize="large"
                        />

                        <Typography
                            variant="body2"
                            textAlign="center"
                        >
                            {t('Image unavailable')}
                        </Typography>

                        {currentImage && imageFailed && (
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleRetry}
                                sx={{
                                    textTransform: 'none',
                                    minHeight: 40,
                                }}
                            >
                                {t('Retry')}
                            </Button>
                        )}
                    </Box>
                ) : (
                    <GalleryPhoto
                        key={`${currentImage}-${useOriginal}-${retryCount}`}
                        src={displayImage}
                        srcSet={imageSrcSet}
                        title={title}
                        index={currentIndex}
                        onError={() =>
                            handleImageError(currentImage)
                        }
                        onOpen={handleOpen}
                    />
                )}

                {hasMultipleImages && (
                    <>
                        <IconButton
                            size="small"
                            onClick={handlePrevious}
                            aria-label={t('Previous photo')}
                            sx={{
                                position: 'absolute',
                                left: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.55)',
                                color: 'white',
                                zIndex: 2,
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.75)',
                                },
                            }}
                        >
                            <ChevronLeftIcon />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={handleNext}
                            aria-label={t('Next photo')}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                bgcolor: 'rgba(0,0,0,0.55)',
                                color: 'white',
                                zIndex: 2,
                                '&:hover': {
                                    bgcolor: 'rgba(0,0,0,0.75)',
                                },
                            }}
                        >
                            <ChevronRightIcon />
                        </IconButton>

                        <Box
                            sx={{
                                position: 'absolute',
                                bottom: 8,
                                right: 8,
                                px: 1.2,
                                py: 0.4,
                                borderRadius: 2,
                                bgcolor: 'rgba(0,0,0,0.65)',
                                pointerEvents: 'none',
                                zIndex: 2,
                            }}
                        >
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'white',
                                    fontWeight: 700,
                                }}
                            >
                                {currentIndex + 1} / {imageCount}
                            </Typography>
                        </Box>
                    </>
                )}
            </Box>

            <ImagePreviewDialog
                open={open}
                image={previewImage}
                fallbackImage={currentImage}
                alt={`${title} - ${currentIndex + 1}`}
                onClose={handleClose}
            />
        </>
    );
};

const GalleryPhoto = ({
    src,
    srcSet,
    title,
    index,
    onError,
    onOpen,
}) => {
    const { t } = useTranslation();
    const [loaded, setLoaded] = useState(false);
    const [started, setStarted] = useState(false);

    return (
        <Box
            onClick={onOpen}
            role="button"
            tabIndex={0}
            onKeyDown={event => {
                if (
                    event.key === 'Enter' ||
                    event.key === ' '
                ) {
                    event.preventDefault();
                    onOpen();
                }
            }}
            aria-label={`${t('Preview')} ${title} ${index + 1}`}
            sx={{
                width: '100%',
                height: '100%',
                position: 'relative',
                cursor: 'pointer',
                '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: '-2px',
                },
            }}
        >
            <Box
                component="img"
                src={src}
                srcSet={srcSet}
                sizes={srcSet ? IMAGE_SIZES : undefined}
                width={480}
                height={320}
                alt={`${title} - ${index + 1}`}
                loading="lazy"
                decoding="async"
                onLoadStart={() => setStarted(true)}
                onLoad={() => {
                    setStarted(true);
                    setLoaded(true);
                }}
                onError={onError}
                sx={{
                    display: 'block',
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                }}
            />

            {started && !loaded && (
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
                    <CircularProgress size={28} />
                </Box>
            )}
        </Box>
    );
};

export default memo(MarketplaceImage);