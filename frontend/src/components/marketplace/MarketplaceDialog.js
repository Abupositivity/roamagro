import React from 'react';

import {
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
} from '@mui/material';

import CloseIcon from '@mui/icons-material/Close';

import { useTranslation } from 'react-i18next';

import MarketplaceForm from './MarketplaceForm';

const EMPTY_INITIAL_VALUES = {};

const MarketplaceDialog = ({
    open,
    loading = false,
    listing = null,
    error = '',
    onClose,
    onSubmit,
}) => {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            fullWidth
            maxWidth="md"
            fullScreen={false}
            disableEscapeKeyDown={loading}
            onClose={
                loading
                    ? undefined
                    : onClose
            }
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    pr: 1,
                }}
            >
                {listing
                    ? t('Edit Listing')
                    : t('Create Listing')}

                <IconButton
                    size="small"
                    disabled={loading}
                    onClick={onClose}
                    aria-label={t('Close')}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent
                dividers
                sx={{
                    px: {
                        xs: 2,
                        sm: 3,
                    },
                    pb: 3,
                }}
            >
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            mb: 2,
                            overflowWrap: 'anywhere',
                        }}
                    >
                        {t(error)}
                    </Alert>
                )}

                <MarketplaceForm
                    loading={loading}
                    initialValues={
                        listing || EMPTY_INITIAL_VALUES
                    }
                    submitLabel={
                        listing
                            ? 'Update Listing'
                            : 'Create Listing'
                    }
                    onSubmit={onSubmit}
                />
            </DialogContent>
        </Dialog>
    );
};

export default MarketplaceDialog;