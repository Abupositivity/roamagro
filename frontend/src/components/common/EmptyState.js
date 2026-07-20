import React from 'react';

import {
    Box,
    Typography,
} from '@mui/material';

const EmptyState = ({
    icon = '🌱',
    title = 'Nothing here yet',
    subtitle = '',
}) => {

    return (

        <Box
            sx={{
                py: 8,
                textAlign: 'center',
            }}
        >

            <Typography
                variant="h2"
            >
                {icon}
            </Typography>

            <Typography
                variant="h5"
                mt={2}
            >
                {title}
            </Typography>

            <Typography
                color="text.secondary"
            >
                {subtitle}
            </Typography>

        </Box>

    );

};

export default EmptyState;