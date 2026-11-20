import React, { useState } from 'react';

import {
    Box,
    Typography,
} from '@mui/material';

import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';

import { useTranslation } from 'react-i18next';

import {
    getFeedImage,
    getFeedImageSrcSet,
    getResponsiveImage,
} from '../../utils/cloudinaryImage';

const ADMIN_IMAGE_SIZES = [
    'auto',
    '(max-width: 899px) 90vw',
    '560px',
].join(', ');

const REPORT_IMAGE_SIZES = [
    '(max-width: 899px) 90vw',
    '850px',
].join(', ');

const IMAGE_CONFIGURATIONS = {
    thumbnail: {
        loading: 'lazy',
        sizes: ADMIN_IMAGE_SIZES,
        styles: {
            width: '100%',
            height: 190,
            objectFit: 'cover',
            bgcolor: 'action.hover',
            display: 'block',
        },
    },

    preview: {
        loading: 'eager',
        styles: {
            width: '100%',
            maxHeight: 220,
            objectFit: 'contain',
            borderRadius: 2,
            bgcolor: 'action.hover',
            display: 'block',
        },
    },

    report: {
        loading: 'eager',
        sizes: REPORT_IMAGE_SIZES,
        styles: {
            width: '100%',
            maxHeight: 250,
            objectFit: 'cover',
            bgcolor: 'action.hover',
            display: 'block',
        },
    },
};

const AdvertisementMediaImage = ({
    source,
    alt,
    variant,
}) => {
    const { t } = useTranslation();

    const [useOriginal, setUseOriginal] =
        useState(false);

    const [imageFailed, setImageFailed] =
        useState(false);

    const configuration =
        IMAGE_CONFIGURATIONS[variant] ||
        IMAGE_CONFIGURATIONS.thumbnail;

    const isPreview = variant === 'preview';

    const optimizedSource = isPreview
        ? getResponsiveImage(source, 1200)
        : getFeedImage(source, 800);

    const imageSource = useOriginal
        ? source
        : optimizedSource;

    const srcSet =
        !isPreview && !useOriginal
            ? getFeedImageSrcSet(source)
            : undefined;

    const handleImageError = () => {
        if (
            !useOriginal &&
            (optimizedSource !== source || srcSet)
        ) {
            setUseOriginal(true);
            return;
        }

        setImageFailed(true);
    };

    if (!source || imageFailed) {
        return (
            <Box
                role="img"
                aria-label={t('Image unavailable')}
                sx={{
                    ...configuration.styles,
                    height:
                        variant === 'thumbnail'
                            ? 190
                            : variant === 'preview'
                                ? 220
                                : 250,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                    gap: 1,
                }}
            >
                <BrokenImageOutlinedIcon
                    fontSize="large"
                />

                <Typography variant="body2">
                    {t('Image unavailable')}
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            key={useOriginal ? 'original' : 'optimized'}
            component="img"
            src={imageSource}
            srcSet={srcSet}
            sizes={
                srcSet
                    ? configuration.sizes
                    : undefined
            }
            alt={alt || ''}
            loading={configuration.loading}
            decoding="async"
            referrerPolicy={
                variant === 'report'
                    ? 'no-referrer'
                    : undefined
            }
            onError={handleImageError}
            sx={configuration.styles}
        />
    );
};

const AdvertisementMedia = ({
    source,
    alt,
    variant = 'thumbnail',
}) => (
    <AdvertisementMediaImage
        key={`${variant}:${source || ''}`}
        source={source}
        alt={alt}
        variant={variant}
    />
);

export default AdvertisementMedia;