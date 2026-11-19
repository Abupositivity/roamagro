import React, { Component } from 'react';

import {
    Alert,
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';

import { withTranslation } from 'react-i18next';

class RouteErrorBoundary extends Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
        };
    }

    static getDerivedStateFromError() {
        return {
            hasError: true,
        };
    }

    componentDidCatch(error, errorInfo) {
        if (process.env.NODE_ENV !== 'production') {
            console.error(
                'Route rendering error:',
                error,
                errorInfo
            );
        }
    }

    handleRetry = () => {
        window.location.reload();
    };

    render() {
        const { hasError } = this.state;
        const { children, t } = this.props;

        if (!hasError) {
            return children;
        }

        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh',
                    px: 2,
                    py: 4,
                }}
            >
                <Stack
                    spacing={2}
                    sx={{
                        width: '100%',
                        maxWidth: 480,
                    }}
                >
                    <Alert severity="error">
                        <Typography
                            variant="subtitle1"
                            fontWeight={600}
                        >
                            {t('Unable to load this page.')}
                        </Typography>

                        <Typography variant="body2">
                            {t(
                                'Please check your internet connection and try again.'
                            )}
                        </Typography>
                    </Alert>

                    <Button
                        variant="contained"
                        onClick={this.handleRetry}
                        fullWidth
                    >
                        {t('Try Again')}
                    </Button>
                </Stack>
            </Box>
        );
    }
}

export default withTranslation()(RouteErrorBoundary);