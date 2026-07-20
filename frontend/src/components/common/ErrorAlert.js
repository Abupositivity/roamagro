import React from 'react';

import { Alert } from '@mui/material';

const ErrorAlert = ({
    error,
}) => {

    if (!error) return null;

    return (

        <Alert
            severity="error"
            sx={{
                mb: 3,
            }}
        >

            {error}

        </Alert>

    );

};

export default ErrorAlert;