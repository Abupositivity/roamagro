import React, {
    memo,
    useEffect,
    useState,
} from 'react';

import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    IconButton,
    Stack,
    Typography,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useTranslation } from 'react-i18next';

const ImagePreviewDialog = ({
    open,
    image,
    fallbackImage = '',
    alt = 'Marketplace image preview',
    onClose,
}) => {
    const { t } = useTranslation();

    const [imageFailed, setImageFailed] = useState(false);
    const [useFallback, setUseFallback] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [retryCount, setRetryCount] = useState(0);

    useEffect(() => {
        setImageFailed(false);
        setUseFallback(false);
        setImageLoaded(false);
        setRetryCount(0);
    }, [image, fallbackImage, open]);

    const displayImage = useFallback
        ? fallbackImage
        : image || fallbackImage;

    const handleImageError = () => {
        setImageLoaded(false);

        if (
            !useFallback &&
            image &&
            fallbackImage &&
            fallbackImage !== image
        ) {
            setUseFallback(true);
            return;
        }

        setImageFailed(true);
    };

    const handleRetry = () => {
        setImageFailed(false);
        setUseFallback(false);
        setImageLoaded(false);
        setRetryCount(previous => previous + 1);
    };

    const showImage = Boolean(
        open && displayImage && !imageFailed
    );

    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            onClose={onClose}
            aria-label={alt}
            slotProps={{
                paper: {
                    sx: {
                        overflow: 'hidden',
                        bgcolor: 'black',
                        position: 'relative',
                    },
                },
            }}
        >
            <IconButton
                onClick={onClose}
                aria-label={t('Close image preview')}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    zIndex: 3,
                    color: '#202124',
                    bgcolor: 'rgba(255,255,255,0.92)',
                    '&:hover': {
                        bgcolor: '#FFFFFF',
                    },
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent
                sx={{
                    p: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: {
                        xs: 220,
                        sm: 300,
                    },
                    maxHeight: '80vh',
                    overflow: 'hidden',
                    bgcolor: 'black',
                    position: 'relative',
                }}
            >
                {showImage && (
                    <Box
                        component="img"
                        key={`${displayImage}-${retryCount}`}
                        src={displayImage}
                        alt={alt}
                        loading="eager"
                        decoding="async"
                        onLoad={() => setImageLoaded(true)}
                        onError={handleImageError}
                        sx={{
                            display: 'block',
                            width: '100%',
                            maxHeight: '80vh',
                            objectFit: 'contain',
                        }}
                    />
                )}

                {showImage && !imageLoaded && (
                    <Stack
                        spacing={1.5}
                        alignItems="center"
                        justifyContent="center"
                        role="status"
                        sx={{
                            position: 'absolute',
                            inset: 0,
                            color: 'white',
                            bgcolor: 'black',
                            pointerEvents: 'none',
                        }}
                    >
                        <CircularProgress
                            size={32}
                            sx={{ color: 'white' }}
                        />

                        <Typography variant="body2">
                            {t('Loading image...')}
                        </Typography>
                    </Stack>
                )}

                {open && (!displayImage || imageFailed) && (
                    <Stack
                        spacing={2}
                        alignItems="center"
                        justifyContent="center"
                        sx={{
                            width: '100%',
                            minHeight: 220,
                            color: 'white',
                            p: 4,
                        }}
                    >
                        <BrokenImageOutlinedIcon
                            sx={{ fontSize: 44 }}
                        />

                        <Typography
                            variant="body2"
                            textAlign="center"
                            role="alert"
                        >
                            {t('Image unavailable')}
                        </Typography>

                        {displayImage && imageFailed && (
                            <Button
                                variant="outlined"
                                startIcon={<RefreshIcon />}
                                onClick={handleRetry}
                                sx={{
                                    color: 'white',
                                    borderColor: 'rgba(255,255,255,0.7)',
                                    textTransform: 'none',
                                    minHeight: 44,
                                    '&:hover': {
                                        borderColor: 'white',
                                    },
                                }}
                            >
                                {t('Retry')}
                            </Button>
                        )}
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default memo(ImagePreviewDialog);