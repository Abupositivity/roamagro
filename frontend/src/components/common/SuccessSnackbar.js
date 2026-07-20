import React from 'react';

import {
    Snackbar,
    Alert,
} from '@mui/material';

const SuccessSnackbar = ({
    open,
    onClose,
    message,
}) => {

    return (

        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
        >

            <Alert
                severity="success"
                variant="filled"
                onClose={onClose}
            >

                {message}

            </Alert>

        </Snackbar>

    );

};

export default SuccessSnackbar;