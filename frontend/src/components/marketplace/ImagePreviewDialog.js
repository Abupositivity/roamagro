import React from 'react';

import {
    Dialog,
    DialogContent,
    IconButton,
    Box,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

const ImagePreviewDialog = ({
    open,
    image,
    onClose,
}) => {
    return (
        <Dialog
            open={open}
            maxWidth="md"
            fullWidth
            onClose={onClose}
        >
            <IconButton
                onClick={onClose}
                aria-label="Close image"
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    zIndex: 2,
                    backgroundColor:
                        'rgba(255,255,255,0.9)',
                    '&:hover': {
                        backgroundColor:
                            'white',
                    },
                }}
            >
                <CloseIcon />
            </IconButton>

            <DialogContent
                sx={{
                    p: 0,
                    backgroundColor: 'black',
                }}
            >
                <Box
                    component="img"
                    src={image}
                    alt="Marketplace preview"
                    sx={{
                        width: '100%',
                        maxHeight: '80vh',
                        objectFit: 'contain',
                        display: 'block',
                    }}
                />
            </DialogContent>
        </Dialog>
    );
};

export default ImagePreviewDialog;