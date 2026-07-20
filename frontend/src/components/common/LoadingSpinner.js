import React from 'react';
import {
    Box,
    CircularProgress,
    Typography,
} from '@mui/material';

const LoadingSpinner = ({
    message = 'Loading...',
}) => {

    return (

        <Box
            sx={{
                py: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >

            <CircularProgress color="primary" />

            <Typography
                sx={{
                    mt: 2,
                }}
            >
                {message}
            </Typography>

        </Box>

    );

};

export default LoadingSpinner;