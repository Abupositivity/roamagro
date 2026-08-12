import React, { useState } from 'react';

import {
    Box,
    CardMedia,
} from '@mui/material';

import ImagePreviewDialog from './ImagePreviewDialog';

const PLACEHOLDER =
    'https://via.placeholder.com/600x400?text=RoamAgro';

const MarketplaceImage = ({
    images = [],
}) => {
    const [open, setOpen] = useState(false);

    const image =
        Array.isArray(images)
            ? images.find(Boolean) || PLACEHOLDER
            : PLACEHOLDER;

    const handleImageError = (event) => {
        if (event.currentTarget.src !== PLACEHOLDER) {
            event.currentTarget.src = PLACEHOLDER;
        }
    };

    return (
        <>
            <Box
                onClick={() => setOpen(true)}
                sx={{
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <CardMedia
                    component="img"
                    image={image}
                    alt="Marketplace listing"
                    onError={handleImageError}
                    sx={{
                        width: '100%',
                        height: {
                            xs: 200,
                            sm: 220,
                        },
                        objectFit: 'cover',
                        display: 'block',
                        backgroundColor: 'action.hover',
                    }}
                />
            </Box>

            <ImagePreviewDialog
                open={open}
                image={image}
                onClose={() => setOpen(false)}
            />
        </>
    );
};

export default MarketplaceImage;